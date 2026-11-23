const axios = require('axios');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const REGION = process.env.AWS_REGION || process.env.SES_REGION || 'us-east-1';
const TABLE_NAME = process.env.DDB_TABLE_NAME || 'NeatForexLicenses';
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || 'no-reply@neatforexeas.com';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@neatforexeas.com';
const EX5_BUCKET = process.env.EX5_BUCKET || '';
const DOWNLOAD_BASE_URL = process.env.DOWNLOAD_BASE_URL || '';
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const ses = new SESClient({ region: REGION });
const s3 = new S3Client({ region: REGION });

const PRODUCTS = {
  'gold-buzz-pro': {
    id: 'gold-buzz-pro',
    live: true,
    name: 'Glisten Bars',
    priceOnce: '199.00',
    priceMonthly: '29.00',
    filename: 'glisten_bars.ex5',
    demoFilename: 'glisten_bars_demo.ex5'
  }
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function createLicenseKey(orderRef) {
  const clean = String(orderRef || Date.now()).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `NF-${clean.slice(-8).padStart(8, 'X')}`;
}

function createDownloadToken(orderRef, productId) {
  return Buffer.from(`${orderRef}:${productId}:${Date.now()}`).toString('base64url');
}

async function buildDownloadUrl(baseUrl, downloadToken, product, isDemo = false) {
  if (EX5_BUCKET) {
    const key = isDemo ? product.demoFilename : product.filename;
    const command = new GetObjectCommand({
      Bucket: EX5_BUCKET,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${key}"`
    });
    return await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 24 * 7 }); // 7 days
  }
  return `${baseUrl}/api/download/${downloadToken}`;
}

async function sendPurchaseEmail({ toEmail, product, tierName, price, licenseKey, downloadUrl }) {
  if (!toEmail || !SES_FROM_EMAIL) return;

  const textBody = [
    `Thank you for your purchase of ${product.name} (${tierName})!`,
    ``,
    `Purchase Summary:`,
    `- Product: ${product.name}`,
    `- Plan: ${tierName}`,
    `- Amount Paid: $${price} USD`,
    `- 5-Device License Key: ${licenseKey}`,
    ``,
    `Download your .ex5 file here:`,
    `${downloadUrl}`,
    ``,
    `If you need help installing on MetaTrader 5, contact ${SUPPORT_EMAIL}.`
  ].join('\n');

  await ses.send(new SendEmailCommand({
    Source: SES_FROM_EMAIL,
    Destination: { ToAddresses: [toEmail] },
    Message: {
      Subject: { Data: `Your ${product.name} License Key & .ex5 Download Link` },
      Body: {
        Text: { Data: textBody }
      }
    }
  }));
}

async function saveLicenseRecord({ licenseKey, productId, tierName, price, buyerEmail, orderId, downloadToken }) {
  await ddb.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      licenseKey,
      productId,
      tierName: tierName || 'License',
      price: String(price || ''),
      buyerEmail: buyerEmail || '',
      orderId: String(orderId),
      downloadToken,
      devices: [],
      createdAt: new Date().toISOString()
    },
    ConditionExpression: 'attribute_not_exists(licenseKey)'
  })).catch((err) => {
    if (err.name !== 'ConditionalCheckFailedException') throw err;
  });
}

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await axios({
    url: `${process.env.PAYPAL_API}/v1/oauth2/token`,
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: 'grant_type=client_credentials'
  });
  return response.data.access_token;
}

exports.handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  const rawPath = event.rawPath || event.path || '/';
  const pathClean = rawPath.replace(/^\/[^/]+(?=\/api\/)/, '');

  if (method === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  const body = event.body
    ? JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body)
    : {};
  const query = event.queryStringParameters || {};
  const baseUrl = DOWNLOAD_BASE_URL || `https://${event.requestContext?.domainName || ''}`;

  try {
    // 1. Verify PayPal order -> Save in DynamoDB -> Send SES email
    if (method === 'POST' && pathClean === '/api/verify-order') {
      const { orderID, productId, tierName, buyerEmail } = body;
      const product = PRODUCTS[productId];
      if (!product || !product.live) {
        return jsonResponse(404, { success: false, message: 'Product not available.' });
      }

      const accessToken = await getPayPalAccessToken();
      const orderRes = await axios({
        url: `${process.env.PAYPAL_API}/v2/checkout/orders/${orderID}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      let status = orderRes.data.status;
      if (status === 'APPROVED') {
        const capRes = await axios({
          url: `${process.env.PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });
        status = capRes.data.status;
      }

      if (status !== 'COMPLETED') {
        return jsonResponse(400, { success: false, message: 'Payment not completed.' });
      }

      const paidAmount = orderRes.data.purchase_units?.[0]?.amount?.value || product.priceOnce;
      const licenseKey = createLicenseKey(orderID);
      const downloadToken = createDownloadToken(orderID, productId);
      const downloadUrl = await buildDownloadUrl(baseUrl, downloadToken, product, false);

      await saveLicenseRecord({
        licenseKey,
        productId,
        tierName,
        price: paidAmount,
        buyerEmail,
        orderId: orderID,
        downloadToken
      });

      await sendPurchaseEmail({
        toEmail: buyerEmail,
        product,
        tierName: tierName || 'License',
        price: paidAmount,
        licenseKey,
        downloadUrl
      });

      return jsonResponse(200, {
        success: true,
        licenseKey,
        downloadToken,
        message: 'Payment verified, license saved, and email sent.'
      });
    }

    // 2. NOWPayments create payment
    if (method === 'POST' && pathClean === '/api/nowpayments/create-payment') {
      const { productId, price, tierName, payCurrency } = body;
      const product = PRODUCTS[productId];
      if (!product || !product.live) {
        return jsonResponse(404, { success: false, message: 'Product not available.' });
      }
      if (!process.env.NOWPAYMENTS_API_KEY || process.env.NOWPAYMENTS_API_KEY === 'your_nowpayments_api_key_here') {
        return jsonResponse(400, { success: false, message: 'NOWPAYMENTS_API_KEY is not configured.' });
      }

      const npRes = await axios({
        url: `${NOWPAYMENTS_API_URL}/payment`,
        method: 'POST',
        headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY, 'Content-Type': 'application/json' },
        data: {
          price_amount: Number(price),
          price_currency: 'usd',
          pay_currency: (payCurrency || 'usdttrc20').toLowerCase(),
          order_id: `${productId}-${Date.now()}`,
          order_description: `${product.name} (${tierName || 'License'})`
        }
      });

      const p = npRes.data;
      return jsonResponse(200, {
        success: true,
        paymentId: p.payment_id,
        payAddress: p.pay_address,
        payAmount: p.pay_amount,
        payCurrency: p.pay_currency,
        paymentStatus: p.payment_status,
        invoiceUrl: p.invoice_url || ''
      });
    }

    // 3. NOWPayments status -> Save in DynamoDB & Send SES email when paid
    const statusMatch = pathClean.match(/^\/api\/nowpayments\/status\/([^/]+)$/);
    if (method === 'GET' && statusMatch) {
      const paymentId = decodeURIComponent(statusMatch[1]);
      const product = PRODUCTS[query.productId] || PRODUCTS['gold-buzz-pro'];
      const buyerEmail = query.buyerEmail || '';
      const price = query.price || product.priceOnce;
      const tierName = query.tierName || 'License';

      const npRes = await axios({
        url: `${NOWPAYMENTS_API_URL}/payment/${paymentId}`,
        method: 'GET',
        headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY }
      });

      const paymentStatus = npRes.data.payment_status;
      const paid = ['finished', 'confirmed', 'sending'].includes(paymentStatus);

      if (paid) {
        const licenseKey = createLicenseKey(paymentId);
        const downloadToken = createDownloadToken(paymentId, product.id);
        const downloadUrl = await buildDownloadUrl(baseUrl, downloadToken, product, false);

        await saveLicenseRecord({
          licenseKey,
          productId: product.id,
          tierName,
          price,
          buyerEmail,
          orderId: paymentId,
          downloadToken
        });

        await sendPurchaseEmail({
          toEmail: buyerEmail,
          product,
          tierName,
          price,
          licenseKey,
          downloadUrl
        });

        return jsonResponse(200, {
          success: true,
          paid: true,
          paymentStatus,
          licenseKey,
          downloadToken
        });
      }

      return jsonResponse(200, { success: true, paid: false, paymentStatus });
    }

    // 4. Demo download redirect (if using S3 bucket)
    const demoMatch = pathClean.match(/^\/api\/download-demo\/([^/]+)$/);
    if (method === 'GET' && demoMatch) {
      const product = PRODUCTS[demoMatch[1]];
      if (!product || !product.live || !EX5_BUCKET) {
        return { statusCode: 404, body: 'Demo file unavailable.' };
      }
      const demoUrl = await buildDownloadUrl(baseUrl, '', product, true);
      return { statusCode: 302, headers: { Location: demoUrl }, body: '' };
    }

    // 5. Paid download redirect via token (if using S3 bucket)
    const dlMatch = pathClean.match(/^\/api\/download\/([^/]+)$/);
    if (method === 'GET' && dlMatch) {
      const decoded = Buffer.from(dlMatch[1], 'base64url').toString('utf8');
      const [, productId] = decoded.split(':');
      const product = PRODUCTS[productId];
      if (!product || !product.live || !EX5_BUCKET) {
        return { statusCode: 404, body: 'Download unavailable.' };
      }
      const signedUrl = await buildDownloadUrl(baseUrl, dlMatch[1], product, false);
      return { statusCode: 302, headers: { Location: signedUrl }, body: '' };
    }

    // 6. MT5 5-Device License Check via DynamoDB
    if (method === 'GET' && pathClean === '/api/verify-device') {
      const { key, device } = query;
      if (!key || !device) {
        return { statusCode: 400, body: 'INVALID_REQUEST' };
      }

      const res = await ddb.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { licenseKey: key }
      }));

      if (!res.Item) {
        return { statusCode: 200, body: 'INVALID_KEY' };
      }

      const devices = Array.isArray(res.Item.devices) ? res.Item.devices : [];
      if (devices.includes(device)) {
        return { statusCode: 200, body: 'AUTHORIZED' };
      }

      if (devices.length < 5) {
        await ddb.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { licenseKey: key },
          UpdateExpression: 'SET devices = list_append(if_not_exists(devices, :empty), :dev)',
          ExpressionAttributeValues: {
            ':empty': [],
            ':dev': [device]
          }
        }));
        return { statusCode: 200, body: 'AUTHORIZED' };
      }

      return { statusCode: 200, body: 'BLOCKED_DEVICE_LIMIT_REACHED' };
    }

    return jsonResponse(404, { success: false, message: 'Route not found.' });
  } catch (err) {
    console.error('Lambda Error:', err.response?.data || err.message || err);
    return jsonResponse(500, { success: false, message: 'Internal server error.' });
  }
};