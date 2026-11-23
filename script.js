// Replace with your API Gateway base URL (no trailing slash), e.g.:
// https://abc123def.execute-api.us-east-1.amazonaws.com
const API_BASE_URL = '';

function apiUrl(routePath) {
  return `${API_BASE_URL}${routePath}`;
}

const EAPRODUCTS = [
  {
    id: 'gold-buzz-pro',
    live: true,
    name: 'Glisten Bars',
    badge: 'Live · Best Seller',
    pair: 'XAUUSD',
    strategyType: 'Scalper',
    returnTimeframe: 'Daily',
    numericPrice: 199,
    priceMonthly: '29.00',
    priceOnce: '199.00',
    desc: 'High-frequency momentum scalper engineered specifically for XAUUSD (Gold). Low drawdown, smart trailing stop, and automated news filter to dodge high volatility spikes.',
    img: 'images/glisten-bars.jpg',
    myfxbookUrl: 'https://www.myfxbook.com/members/neatforexeas/glisten-bars-xauusd',
    gain: '+342.8%',
    pf: '2.45',
    dd: '8.2%',
    characteristics: [
      { text: 'Optimized strictly for XAUUSD (Gold) on M1 and M5 timeframes.', type: 'dos' },
      { text: 'Built-in automated news filter pauses trading before high-impact FOMC releases.', type: 'dos' },
      { text: 'Requires ECN broker with raw spreads under 20 points.', type: 'dos' },
      { text: 'Do not run on high-spread retail market maker accounts during rollovers.', type: 'dont' },
      { text: 'Do not manually override automated stop-loss thresholds during trades.', type: 'dont' }
    ]
  },
  {
    id: 'trend-master',
    live: false,
    name: 'Neat Forex Trend Master EA',
    badge: 'Coming Soon',
    pair: 'EURUSD',
    strategyType: 'Trend',
    returnTimeframe: 'Weekly',
    numericPrice: 149,
    priceMonthly: '19.00',
    priceOnce: '149.00',
    desc: 'Multi-currency trend follower designed for EURUSD and GBPUSD H4 timeframes with advanced multi-timeframe trend confirmation and dynamic lot-scaling.',
    img: 'images/trend-master.jpg',
    myfxbookUrl: 'https://www.myfxbook.com/',
    gain: '+215.4%',
    pf: '2.12',
    dd: '9.5%',
    characteristics: [
      { text: 'Trades major pairs (EURUSD, GBPUSD) on H4 trend breakouts.', type: 'dos' },
      { text: 'Utilizes trailing profit locks to protect open equity during retracements.', type: 'dos' },
      { text: 'Recommended minimum account balance of $500 for standard micro lots.', type: 'dos' },
      { text: 'Do not interrupt basket closures during major session openings.', type: 'dont' },
      { text: 'Avoid running on exotic currency crosses with high swap fees.', type: 'dont' }
    ]
  },
  {
    id: 'nexus-grid',
    live: false,
    name: 'Neat Forex Nexus Grid EA',
    badge: 'Coming Soon',
    pair: 'Multi',
    strategyType: 'Averaging',
    returnTimeframe: 'Monthly',
    numericPrice: 249,
    priceMonthly: '39.00',
    priceOnce: '249.00',
    desc: 'Sophisticated grid averaging system with dynamic basket take-profit, intelligent drawdown mitigation controls, and institutional risk management algorithms.',
    img: 'images/nexus-grid.jpg',
    myfxbookUrl: 'https://www.myfxbook.com/',
    gain: '+410.2%',
    pf: '2.68',
    dd: '11.0%',
    characteristics: [
      { text: 'Advanced grid recovery algorithm with hard equity stop protection.', type: 'dos' },
      { text: 'Operates efficiently across correlated currency pairs simultaneously.', type: 'dos' },
      { text: 'Requires VPS with ping under 15ms to broker trading server.', type: 'dos' },
      { text: 'Do not exceed recommended risk multipliers in input settings.', type: 'dont' },
      { text: 'Do not use accounts with leverage lower than 1:100.', type: 'dont' }
    ]
  },
  {
    id: 'news-flash-sniper',
    live: false,
    name: 'Neat Forex News Flash Sniper',
    badge: 'Coming Soon',
    pair: 'XAUUSD',
    strategyType: 'Hedging',
    returnTimeframe: 'Daily',
    numericPrice: 299,
    priceMonthly: '49.00',
    priceOnce: '299.00',
    desc: 'Automated pending order straddle strategy engineered to capture explosive volatility during NFP, CPI, and FOMC macroeconomic releases.',
    img: 'images/news-flash-sniper.jpg',
    myfxbookUrl: 'https://www.myfxbook.com/',
    gain: '+520.5%',
    pf: '2.90',
    dd: '12.4%',
    characteristics: [
      { text: 'Places automated bracket orders moments before major macroeconomic data drops.', type: 'dos' },
      { text: 'Includes instant breakeven trailing stops to lock in windfall gains.', type: 'dos' },
      { text: 'Works best on institutional low-latency ECN execution feeds.', type: 'dos' },
      { text: 'Do not disable automated slippage protection parameters.', type: 'dont' },
      { text: 'Avoid testing on demo servers with artificial execution latency.', type: 'dont' }
    ]
  },
  {
    id: 'volatility-breakout',
    live: false,
    name: 'Neat Forex Volatility Breakout',
    badge: 'Coming Soon',
    pair: 'EURUSD',
    strategyType: 'Breakout',
    returnTimeframe: 'Weekly',
    numericPrice: 179,
    priceMonthly: '24.00',
    priceOnce: '179.00',
    desc: 'Captures breakout momentum at the London and New York session opens with automated trailing stops, spread filters, and robust risk protection.',
    img: 'images/volatility-breakout.jpg',
    myfxbookUrl: 'https://www.myfxbook.com/',
    gain: '+289.1%',
    pf: '2.30',
    dd: '7.9%',
    characteristics: [
      { text: 'Targets opening range breakouts during London and NY crossover hours.', type: 'dos' },
      { text: 'Strict spread filter avoids executing trades during quiet Asian liquidity hours.', type: 'dos' },
      { text: 'Compatible with standard and cent accounts on MetaTrader 5.', type: 'dos' },
      { text: 'Do not run outside specified trading hours without adjusting session filters.', type: 'dont' },
      { text: 'Do not trade during bank holidays when liquidity is thin.', type: 'dont' }
    ]
  }
];

let currentSelectedId = null;
let currentCheckoutState = {
  productId: null,
  price: null,
  tierName: null,
  paymentId: null,
  buyerEmail: ''
};

// Navigation wiring
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('backdrop');

if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
    backdrop.classList.add('active');
  });
}
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
    backdrop.classList.remove('active');
  });
}
if (backdrop) {
  backdrop.addEventListener('click', () => {
    sidebar.classList.remove('open');
    backdrop.classList.remove('active');
  });
}

function showSection(sectionId) {
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('.nav-link, .sidebar-link, .footer-nav-link').forEach(link => {
    if (link.getAttribute('data-target') === sectionId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('active');
}

document.querySelectorAll('.nav-link, .sidebar-link, .footer-nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.getAttribute('data-target');
    if (target) showSection(target);
  });
});

function toggleFilterDrawer(forceOpen) {
  const drawer = document.getElementById('filter-drawer');
  const btn = document.getElementById('filter-toggle-btn');
  const chevron = document.getElementById('filter-chevron');
  if (!drawer || !btn) return;

  const isOpen = typeof forceOpen === 'boolean' ? forceOpen : !drawer.classList.contains('open');
  drawer.classList.toggle('open', isOpen);
  btn.setAttribute('aria-expanded', String(isOpen));
  if (chevron) {
    chevron.classList.toggle('rotated', isOpen);
  }
}

function updateActiveFilterBadge() {
  const badge = document.getElementById('active-filter-count');
  if (!badge) return;

  const nameQuery = (document.getElementById('filter-name')?.value || '').trim();
  const strategyVal = document.getElementById('filter-strategy')?.value || 'all';
  const pairVal = document.getElementById('filter-pair')?.value || 'all';
  const budgetVal = document.getElementById('filter-budget')?.value || 'all';

  let count = 0;
  if (nameQuery) count += 1;
  if (strategyVal !== 'all') count += 1;
  if (pairVal !== 'all') count += 1;
  if (budgetVal !== 'all') count += 1;

  badge.textContent = String(count);
  badge.classList.toggle('hidden', count === 0);
}

function initHomeLiveness() {
  const stream = document.getElementById('ea-icon-stream');
  if (!stream) return;

  const repeatedIcons = [...EAPRODUCTS, ...EAPRODUCTS, ...EAPRODUCTS];
  stream.innerHTML = repeatedIcons.map(ea => {
    if (ea.live) {
      return `
        <button type="button" class="ea-drift-icon is-live is-clickable" onclick="openProductDetail('${ea.id}')" title="Open ${ea.name}">
          <img src="${ea.img}" alt="${ea.name}">
          <span>${ea.pair}</span>
        </button>
      `;
    }
    return `
      <button type="button" class="ea-drift-icon is-coming-soon is-clickable" onclick="showSection('products-section')" title="${ea.name} (Coming Soon)">
        <img src="${ea.img}" alt="${ea.name}">
        <span>${ea.pair}</span>
      </button>
    `;
  }).join('');
}

function initFooterEAList() {
  const listEl = document.getElementById('footer-ea-list');
  if (!listEl) return;

  listEl.innerHTML = EAPRODUCTS.map(ea => {
    if (ea.live) {
      return `
        <li>
          <a href="#" class="footer-ea-link" onclick="event.preventDefault(); openProductDetail('${ea.id}');">
            <span>${ea.name}</span>
            <span class="footer-ea-tag live-tag">Live</span>
          </a>
        </li>
      `;
    }
    return `
      <li>
        <a href="#" class="footer-ea-link is-muted" onclick="event.preventDefault(); showSection('products-section');">
          <span>${ea.name}</span>
          <span class="footer-ea-tag soon-tag">Soon</span>
        </a>
      </li>
    `;
  }).join('');
}

function showPurchasePulse(amount) {
  const toastEl = document.getElementById('purchase-pulse-toast');
  const toastTextEl = document.getElementById('purchase-pulse-text');
  if (!toastEl || !toastTextEl) return;

  const formatted = Number(amount).toFixed(2);
  toastTextEl.textContent = `A purchase of $${formatted} has been made`;
  toastEl.classList.remove('visible');
  void toastEl.offsetWidth;
  toastEl.classList.add('visible');

  clearTimeout(showPurchasePulse._timer);
  showPurchasePulse._timer = setTimeout(() => {
    toastEl.classList.remove('visible');
  }, 4500);
}

function renderProducts(productsToRender) {
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  if (productsToRender.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 3rem;">No Expert Advisors match your selected filter criteria.</p>`;
    return;
  }

  container.innerHTML = productsToRender.map(ea => {
    if (!ea.live) {
      return `
        <div class="ea-card coming-soon-card" onclick="showSection('products-section')">
          <div class="ea-card-body">
            <div class="ea-card-top-row">
              <span class="ea-badge-pill coming-soon-badge">Coming Soon</span>
            </div>
            <div class="ea-card-img-wrap bw-tv-img">
              <img src="${ea.img}" alt="${ea.name}">
            </div>
            <h3>${ea.name}</h3>
            <div class="ea-meta-tags">
              <span class="meta-tag"><i class="fa-solid fa-coins"></i> ${ea.pair}</span>
              <span class="meta-tag strategy-type"><i class="fa-solid fa-robot"></i> ${ea.strategyType}</span>
            </div>
            <p class="ea-card-desc">${ea.desc}</p>
            <div class="ea-card-footer">
              <span class="ea-card-price coming-soon-price">Coming Soon</span>
              <span class="dynamic-action-pill coming-soon-pill">Coming Soon</span>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="ea-card" onclick="openProductDetail('${ea.id}')">
        <div class="ea-card-body">
          <div class="ea-card-top-row">
            <span class="ea-badge-pill">${ea.badge}</span>
          </div>
          <div class="ea-card-img-wrap">
            <img src="${ea.img}" alt="${ea.name}">
          </div>
          <h3>${ea.name}</h3>
          <div class="ea-meta-tags">
            <span class="meta-tag"><i class="fa-solid fa-coins"></i> ${ea.pair}</span>
            <span class="meta-tag strategy-type"><i class="fa-solid fa-robot"></i> ${ea.strategyType}</span>
          </div>
          <p class="ea-card-desc">${ea.desc}</p>
          <div class="ea-card-footer">
            <span class="ea-card-price">$${ea.priceOnce}</span>
            <span class="dynamic-action-pill">View Strategy <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterProducts() {
  const nameQuery = document.getElementById('filter-name').value.toLowerCase();
  const strategyVal = document.getElementById('filter-strategy').value;
  const pairVal = document.getElementById('filter-pair').value;
  const budgetVal = document.getElementById('filter-budget').value;

  const filtered = EAPRODUCTS.filter(ea => {
    const matchesName = ea.name.toLowerCase().includes(nameQuery) || ea.desc.toLowerCase().includes(nameQuery);
    const matchesStrategy = strategyVal === 'all' || ea.strategyType === strategyVal;
    const matchesPair = pairVal === 'all' || ea.pair === pairVal;

    let matchesBudget = true;
    if (budgetVal === '0-150') {
      matchesBudget = ea.numericPrice <= 150;
    } else if (budgetVal === '151-200') {
      matchesBudget = ea.numericPrice > 150 && ea.numericPrice <= 200;
    } else if (budgetVal === '201-500') {
      matchesBudget = ea.numericPrice > 200 && ea.numericPrice <= 500;
    }

    return matchesName && matchesStrategy && matchesPair && matchesBudget;
  });

  updateActiveFilterBadge();
  renderProducts(filtered);
}

function resetFilters() {
  document.getElementById('filter-name').value = '';
  document.getElementById('filter-strategy').value = 'all';
  document.getElementById('filter-pair').value = 'all';
  document.getElementById('filter-budget').value = 'all';
  updateActiveFilterBadge();
  renderProducts(EAPRODUCTS);
}

function openProductDetail(eaId) {
  const ea = EAPRODUCTS.find(item => item.id === eaId);
  if (!ea || !ea.live) return;
  currentSelectedId = eaId;

  document.getElementById('detail-img').src = ea.img;
  document.getElementById('detail-badge').innerText = ea.badge;
  document.getElementById('detail-title').innerText = ea.name;
  document.getElementById('detail-desc').innerText = ea.desc;

  document.getElementById('metric-gain').innerText = ea.gain;
  document.getElementById('metric-pf').innerText = ea.pf;
  document.getElementById('metric-dd').innerText = ea.dd;

  const mfxLink = document.getElementById('myfxbook-link-card');
  const mfxSub = document.getElementById('myfxbook-verify-sub');
  if (mfxLink) {
    mfxLink.href = ea.myfxbookUrl || 'https://www.myfxbook.com/';
  }
  if (mfxSub) {
    mfxSub.textContent = `Audited ${ea.pair} statement for ${ea.name}`;
  }

  const charContainer = document.getElementById('characteristics-container');
  charContainer.innerHTML = ea.characteristics.map(c => `
    <div class="floating-rule-card ${c.type}">
      <i class="fa-solid ${c.type === 'dos' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
      <span>${c.text}</span>
    </div>
  `).join('');

  const pricingStack = document.getElementById('pricing-options-stack');
  pricingStack.innerHTML = `
    <div class="price-tier-row">
      <div class="tier-info-left">
        <span class="tier-title-label">Free Demo Version</span>
        <span class="tier-price-val free">$0.00</span>
      </div>
      <div class="tier-btn-right">
        <a href="${apiUrl(`/api/download-demo/${ea.id}`)}" class="btn demo"><i class="fa-solid fa-download"></i> Demo</a>
      </div>
    </div>
    <div class="price-tier-row">
      <div class="tier-info-left">
        <span class="tier-title-label">Monthly (5 Devices)</span>
        <span class="tier-price-val">$${ea.priceMonthly} / mo</span>
      </div>
      <div class="tier-btn-right">
        <button class="btn buy" onclick="openCheckout('${ea.id}', '${ea.priceMonthly}', 'Monthly Subscription')"><i class="fa-solid fa-shield-halved"></i> Subscribe</button>
      </div>
    </div>
    <div class="price-tier-row">
      <div class="tier-info-left">
        <span class="tier-title-label">Lifetime Access</span>
        <span class="tier-price-val">$${ea.priceOnce}</span>
      </div>
      <div class="tier-btn-right">
        <button class="btn buy" onclick="openCheckout('${ea.id}', '${ea.priceOnce}', 'Lifetime License')"><i class="fa-solid fa-shield-halved"></i> Buy Now</button>
      </div>
    </div>
  `;

  showSection('product-detail-section');
}

function getValidatedBuyerEmail() {
  const input = document.getElementById('checkout-email');
  const email = (input?.value || '').trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValid) {
    alert('Please enter a valid email address so we can send your license key and .ex5 download link.');
    input?.focus();
    return null;
  }
  currentCheckoutState.buyerEmail = email;
  return email;
}

function switchPaymentMethod(method) {
  const tabPaypal = document.getElementById('tab-paypal');
  const tabCrypto = document.getElementById('tab-crypto');
  const paypalPanel = document.getElementById('paypal-panel');
  const cryptoPanel = document.getElementById('crypto-panel');

  if (method === 'crypto') {
    tabPaypal.classList.remove('active');
    tabCrypto.classList.add('active');
    paypalPanel.classList.add('hidden');
    cryptoPanel.classList.remove('hidden');
  } else {
    tabCrypto.classList.remove('active');
    tabPaypal.classList.add('active');
    cryptoPanel.classList.add('hidden');
    paypalPanel.classList.remove('hidden');
  }
}

function openCheckout(productId, price, tierName) {
  const ea = EAPRODUCTS.find(item => item.id === productId);
  if (!ea || !ea.live) return;

  currentCheckoutState = { productId, price, tierName, paymentId: null, buyerEmail: '' };

  document.getElementById('modal-product-title').innerText = `${ea.name} - ${tierName}`;
  document.getElementById('modal-product-price').innerText = `$${price} USD`;

  const emailInput = document.getElementById('checkout-email');
  if (emailInput) emailInput.value = '';

  document.getElementById('checkout-email-group').classList.remove('hidden');
  document.getElementById('payment-method-selector').classList.remove('hidden');
  document.getElementById('loading-spinner').classList.add('hidden');
  document.getElementById('download-box').classList.add('hidden');
  document.getElementById('crypto-invoice-box').classList.add('hidden');
  document.getElementById('paypal-button-container').innerHTML = '';

  switchPaymentMethod('paypal');
  document.getElementById('checkout-modal').classList.add('open');

  if (window.paypal) {
    paypal.Buttons({
      onClick: function(data, actions) {
        const email = getValidatedBuyerEmail();
        if (!email) return actions.reject();
        return actions.resolve();
      },
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: { value: price },
            description: `${ea.name} (${tierName})`
          }]
        });
      },
      onApprove: function(data) {
        const buyerEmail = currentCheckoutState.buyerEmail || getValidatedBuyerEmail() || '';

        document.getElementById('checkout-email-group').classList.add('hidden');
        document.getElementById('payment-method-selector').classList.add('hidden');
        document.getElementById('paypal-panel').classList.add('hidden');
        document.getElementById('loading-status-text').innerText = 'Verifying PayPal payment, generating license & sending email...';
        document.getElementById('loading-spinner').classList.remove('hidden');

        return fetch(apiUrl('/api/verify-order'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderID: data.orderID,
            productId,
            tierName,
            buyerEmail
          })
        })
          .then(res => res.json())
          .then(result => {
            document.getElementById('loading-spinner').classList.add('hidden');
            if (result.success) {
              showPurchasePulse(price);
              document.getElementById('display-license-key').innerText = result.licenseKey;
              document.getElementById('final-download-btn').href = apiUrl(`/api/download/${result.downloadToken}`);
              document.getElementById('download-box').classList.remove('hidden');
            } else {
              alert('Payment verification failed: ' + result.message);
              document.getElementById('checkout-email-group').classList.remove('hidden');
              document.getElementById('payment-method-selector').classList.remove('hidden');
              document.getElementById('paypal-panel').classList.remove('hidden');
            }
          })
          .catch(err => {
            console.error(err);
            document.getElementById('loading-spinner').classList.add('hidden');
            alert('An error occurred while verifying the order.');
            document.getElementById('checkout-email-group').classList.remove('hidden');
            document.getElementById('payment-method-selector').classList.remove('hidden');
            document.getElementById('paypal-panel').classList.remove('hidden');
          });
      }
    }).render('#paypal-button-container');
  } else {
    document.getElementById('paypal-button-container').innerHTML = '<p style="color: #ef4444;">PayPal SDK failed to load.</p>';
  }
}

async function startNowPaymentsCheckout() {
  const buyerEmail = getValidatedBuyerEmail();
  if (!buyerEmail) return;

  const { productId, price, tierName } = currentCheckoutState;
  const payCurrency = document.getElementById('crypto-currency-select').value;
  const btn = document.getElementById('create-crypto-invoice-btn');

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Crypto Address...';

  try {
    const res = await fetch(apiUrl('/api/nowpayments/create-payment'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, price, tierName, payCurrency, buyerEmail })
    });
    const data = await res.json();

    if (!data.success) {
      alert(data.message || 'Could not create NOWPayments invoice.');
      return;
    }

    currentCheckoutState.paymentId = data.paymentId;
    document.getElementById('crypto-pay-amount').textContent = `${data.payAmount} ${String(data.payCurrency).toUpperCase()}`;
    document.getElementById('crypto-pay-address').textContent = data.payAddress;
    document.getElementById('crypto-invoice-status').textContent = `Status: ${String(data.paymentStatus || 'waiting').toUpperCase()}`;

    const linkEl = document.getElementById('crypto-invoice-link');
    if (data.invoiceUrl) {
      linkEl.href = data.invoiceUrl;
      linkEl.classList.remove('hidden');
    } else {
      linkEl.classList.add('hidden');
    }

    document.getElementById('crypto-invoice-box').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    alert('Failed to connect to crypto payment service.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-coins"></i> Pay with Crypto';
  }
}

async function checkNowPaymentsStatus() {
  const { paymentId, productId, price, tierName, buyerEmail } = currentCheckoutState;
  if (!paymentId) return;

  const statusEl = document.getElementById('crypto-invoice-status');
  statusEl.textContent = 'Checking blockchain confirmation...';

  try {
    const params = new URLSearchParams({
      productId: productId || '',
      price: price || '',
      tierName: tierName || 'License',
      buyerEmail: buyerEmail || ''
    });

    const res = await fetch(apiUrl(`/api/nowpayments/status/${encodeURIComponent(paymentId)}?${params.toString()}`));
    const data = await res.json();

    if (data.success && data.paid) {
      showPurchasePulse(price);
      document.getElementById('checkout-email-group').classList.add('hidden');
      document.getElementById('payment-method-selector').classList.add('hidden');
      document.getElementById('crypto-panel').classList.add('hidden');
      document.getElementById('display-license-key').innerText = data.licenseKey;
      document.getElementById('final-download-btn').href = apiUrl(`/api/download/${data.downloadToken}`);
      document.getElementById('download-box').classList.remove('hidden');
    } else {
      statusEl.textContent = `Status: ${String(data.paymentStatus || 'waiting').toUpperCase()} — Not confirmed yet.`;
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Unable to check payment status right now.';
  }
}

function triggerLiveChat() {
  if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
    window.Tawk_API.showWidget?.();
    window.Tawk_API.maximize();
    return;
  }
  if (window.$crisp) {
    window.$crisp.push(['do', 'chat:open']);
    return;
  }
  window.open('https://tawk.to/chat/6b041ff876f9fb3cabb039f6/1k841pq1j?layout=modern', '_blank', 'noopener,noreferrer');
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts(EAPRODUCTS);
  initHomeLiveness();
  initFooterEAList();

  const filterToggleBtn = document.getElementById('filter-toggle-btn');
  if (filterToggleBtn) {
    filterToggleBtn.addEventListener('click', () => toggleFilterDrawer());
  }
  updateActiveFilterBadge();
});