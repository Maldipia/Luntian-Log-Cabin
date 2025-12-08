// ============================================================
// AMADEO MARKETPLACE v3.1 - TASK 2 & 3
// File: dashboard.js - Session Management + Dashboard Logic
// ============================================================

const API = 'https://script.google.com/macros/s/AKfycbwgHmmK1j8a6rqx_Zfk5nPGqdUIRSo1oIUNgGoVr2-in988F3K8Kyp8PN15zHS3InIUgw/exec';

// Session storage keys
const SESSION_KEYS = {
  MERCHANT: 'amadeo_merchant',
  LOGIN_TIME: 'amadeo_login_time',
  SESSION_TOKEN: 'amadeo_session'
};

// Session timeout (24 hours)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

// Auto-refresh interval (15 seconds)
const AUTO_REFRESH_INTERVAL = 15000;

// Global state
let merchant = null;
let orders = [];
let autoRefreshTimer = null;
let lastOrderCount = 0;


// ============================================================
// TASK 2: SESSION CHECK ON PAGE LOAD
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  // Check if logged in
  if (!checkSession()) {
    // Not logged in, redirect to login
    window.location.href = 'merchant-login.html';
    return;
  }
  
  // Load merchant data
  merchant = getCurrentMerchant();
  
  if (!merchant) {
    window.location.href = 'merchant-login.html';
    return;
  }
  
  // Initialize dashboard
  initializeDashboard();
});


// ============================================================
// CHECK SESSION
// ============================================================

function checkSession() {
  const merchantData = localStorage.getItem(SESSION_KEYS.MERCHANT);
  const loginTime = localStorage.getItem(SESSION_KEYS.LOGIN_TIME);
  
  if (!merchantData || !loginTime) {
    return false;
  }
  
  // Check if session has expired
  const elapsed = Date.now() - parseInt(loginTime);
  if (elapsed > SESSION_TIMEOUT) {
    clearSession();
    return false;
  }
  
  return true;
}


// ============================================================
// GET CURRENT MERCHANT
// ============================================================

function getCurrentMerchant() {
  const merchantData = localStorage.getItem(SESSION_KEYS.MERCHANT);
  if (!merchantData) return null;
  
  try {
    return JSON.parse(merchantData);
  } catch (e) {
    console.error('Error parsing merchant data:', e);
    return null;
  }
}


// ============================================================
// CLEAR SESSION
// ============================================================

function clearSession() {
  localStorage.removeItem(SESSION_KEYS.MERCHANT);
  localStorage.removeItem(SESSION_KEYS.LOGIN_TIME);
  localStorage.removeItem(SESSION_KEYS.SESSION_TOKEN);
}


// ============================================================
// LOGOUT
// ============================================================

function logout() {
  // Stop auto-refresh
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }
  
  // Clear session
  clearSession();
  
  // Redirect to login
  window.location.href = 'merchant-login.html';
}


// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

function initializeDashboard() {
  // Update header with merchant info
  updateDashboardHeader();
  
  // Set store status toggle
  initializeStoreToggle();
  
  // Load orders
  loadOrders();
  
  // Start auto-refresh (TASK 3)
  startAutoRefresh();
  
  // Refresh session timestamp
  refreshSession();
  
  console.log('Dashboard initialized for:', merchant.BusinessName);
}


// ============================================================
// UPDATE DASHBOARD HEADER
// ============================================================

function updateDashboardHeader() {
  // Set business name
  const nameEl = document.getElementById('merchantName');
  if (nameEl) {
    nameEl.textContent = merchant.BusinessName || 'My Store';
  }
  
  // Set avatar/initials
  const avatarEl = document.getElementById('merchantAvatar');
  if (avatarEl) {
    const initials = (merchant.BusinessName || 'M').charAt(0).toUpperCase();
    avatarEl.textContent = initials;
  }
  
  // Set store status indicator
  updateStoreStatusDisplay();
}


// ============================================================
// TASK 3: STORE STATUS TOGGLE
// ============================================================

function initializeStoreToggle() {
  const toggle = document.getElementById('storeStatusToggle');
  if (toggle) {
    // Set initial state from merchant data
    const isOpen = String(merchant.IsOpen).toUpperCase() === 'TRUE';
    toggle.checked = isOpen;
    
    // Add change handler
    toggle.addEventListener('change', handleStoreStatusChange);
  }
  
  updateStoreStatusDisplay();
}

async function handleStoreStatusChange(e) {
  const isOpen = e.target.checked;
  const toggle = e.target;
  
  // Disable toggle while updating
  toggle.disabled = true;
  
  try {
    const response = await fetch(API, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'updateStoreStatus',
        merchantId: merchant.MerchantId,
        isOpen: isOpen
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update local merchant data
      merchant.IsOpen = isOpen ? 'TRUE' : 'FALSE';
      localStorage.setItem(SESSION_KEYS.MERCHANT, JSON.stringify(merchant));
      
      // Update display
      updateStoreStatusDisplay();
      
      // Show toast
      showToast(isOpen ? '🟢 Store is now OPEN' : '🔴 Store is now CLOSED');
      
    } else {
      // Revert toggle
      toggle.checked = !isOpen;
      showToast('❌ Failed to update store status', 'error');
    }
    
  } catch (error) {
    console.error('Error updating store status:', error);
    toggle.checked = !isOpen;
    showToast('❌ Connection error', 'error');
  }
  
  toggle.disabled = false;
}

function updateStoreStatusDisplay() {
  const isOpen = String(merchant.IsOpen).toUpperCase() === 'TRUE';
  
  // Update status text
  const statusText = document.getElementById('storeStatusText');
  if (statusText) {
    statusText.textContent = isOpen ? 'OPEN' : 'CLOSED';
    statusText.className = isOpen ? 'status-text status-open' : 'status-text status-closed';
  }
  
  // Update status indicator
  const indicator = document.getElementById('storeStatusIndicator');
  if (indicator) {
    indicator.className = isOpen ? 'status-indicator online' : 'status-indicator offline';
  }
}


// ============================================================
// TASK 3: AUTO-REFRESH ORDERS (Every 15 seconds)
// ============================================================

function startAutoRefresh() {
  // Clear any existing timer
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }
  
  // Start new timer
  autoRefreshTimer = setInterval(() => {
    loadOrders(true); // silent refresh
  }, AUTO_REFRESH_INTERVAL);
  
  console.log('Auto-refresh started (every 15 seconds)');
  
  // Update last refresh indicator
  updateRefreshIndicator();
}

function stopAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}

function updateRefreshIndicator() {
  const indicator = document.getElementById('lastRefresh');
  if (indicator) {
    indicator.textContent = 'Just now';
    
    // Update every second
    let seconds = 0;
    setInterval(() => {
      seconds++;
      if (seconds < 60) {
        indicator.textContent = `${seconds}s ago`;
      }
    }, 1000);
  }
}


// ============================================================
// LOAD ORDERS
// ============================================================

async function loadOrders(silent = false) {
  if (!silent) {
    showLoadingOrders();
  }
  
  try {
    const response = await fetch(`${API}?action=getMerchantOrders&merchantId=${merchant.MerchantId}`);
    const result = await response.json();
    
    if (result.success) {
      orders = result.orders || [];
      
      // Check for new orders
      if (orders.length > lastOrderCount && lastOrderCount > 0) {
        // New order arrived!
        playNotificationSound();
        showToast(`🔔 New order received!`, 'success');
      }
      lastOrderCount = orders.length;
      
      // Render orders
      renderOrders(orders);
      
      // Update stats
      updateDashboardStats(orders);
      
    } else {
      if (!silent) {
        showToast('Failed to load orders', 'error');
      }
    }
    
  } catch (error) {
    console.error('Error loading orders:', error);
    if (!silent) {
      showToast('Connection error', 'error');
    }
  }
  
  // Update refresh timestamp
  const refreshTime = document.getElementById('lastRefreshTime');
  if (refreshTime) {
    refreshTime.textContent = new Date().toLocaleTimeString();
  }
}


// ============================================================
// RENDER ORDERS
// ============================================================

function renderOrders(orders) {
  const container = document.getElementById('ordersContainer');
  if (!container) return;
  
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📦</span>
        <h3>No orders yet</h3>
        <p>New orders will appear here automatically</p>
      </div>
    `;
    return;
  }
  
  // Group orders by status
  const pending = orders.filter(o => o.Status === 'pending');
  const active = orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.Status));
  const completed = orders.filter(o => o.Status === 'delivered');
  
  container.innerHTML = `
    ${pending.length > 0 ? `
      <div class="orders-section">
        <h3 class="section-title">🔔 Pending Orders (${pending.length})</h3>
        <div class="orders-grid">
          ${pending.map(o => renderOrderCard(o)).join('')}
        </div>
      </div>
    ` : ''}
    
    ${active.length > 0 ? `
      <div class="orders-section">
        <h3 class="section-title">⏳ Active Orders (${active.length})</h3>
        <div class="orders-grid">
          ${active.map(o => renderOrderCard(o)).join('')}
        </div>
      </div>
    ` : ''}
    
    ${completed.length > 0 ? `
      <div class="orders-section">
        <h3 class="section-title">✅ Completed Today</h3>
        <div class="orders-grid">
          ${completed.slice(0, 5).map(o => renderOrderCard(o)).join('')}
        </div>
      </div>
    ` : ''}
  `;
}


// ============================================================
// RENDER ORDER CARD
// ============================================================

function renderOrderCard(order) {
  const fulfillmentType = order.FulfillmentType || 'pickup';
  const items = Array.isArray(order.Items) ? order.Items : [];
  
  // Fulfillment badge
  const fulfillmentBadge = fulfillmentType === 'service' 
    ? '<span class="badge badge-service">📅 Service</span>'
    : fulfillmentType === 'courier'
    ? '<span class="badge badge-courier">🏍️ Buyer\'s Courier</span>'
    : '<span class="badge badge-pickup">🏪 Self Pickup</span>';
  
  // Status badge
  const statusClass = `status-${order.Status || 'pending'}`;
  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    delivered: 'Delivered'
  };
  
  // Items HTML
  const itemsHtml = items.map(item => 
    `<div class="order-item">${item.quantity || 1}x ${item.name || item.Name}</div>`
  ).join('');
  
  // Action buttons based on status
  let actionsHtml = '';
  if (order.Status === 'pending') {
    actionsHtml = `<button class="btn-action btn-confirm" onclick="updateOrderStatus('${order.OrderId}', 'confirmed')">✓ Confirm</button>`;
  } else if (order.Status === 'confirmed') {
    actionsHtml = `<button class="btn-action btn-prepare" onclick="updateOrderStatus('${order.OrderId}', 'preparing')">🔥 Start Preparing</button>`;
  } else if (order.Status === 'preparing') {
    actionsHtml = fulfillmentType === 'courier'
      ? `<button class="btn-action btn-ready" onclick="markReadyForCourier('${order.OrderId}')">📦 Ready for Courier</button>`
      : `<button class="btn-action btn-ready" onclick="updateOrderStatus('${order.OrderId}', 'ready')">📦 Mark Ready</button>`;
  } else if (order.Status === 'ready') {
    actionsHtml = `<button class="btn-action btn-complete" onclick="updateOrderStatus('${order.OrderId}', 'delivered')">✅ Complete</button>`;
  }
  
  // Delivery address for courier orders
  const addressHtml = fulfillmentType === 'courier' && order.DeliveryAddress ? `
    <div class="courier-address">
      <small>📍 Deliver to:</small>
      <span>${order.DeliveryAddress}, ${order.Barangay || ''}</span>
    </div>
  ` : '';
  
  // Scheduled time for services
  const scheduleHtml = fulfillmentType === 'service' && order.ScheduledTime ? `
    <div class="service-schedule">
      <small>📅 Scheduled:</small>
      <span>${order.ScheduledTime}</span>
    </div>
  ` : '';
  
  return `
    <div class="order-card" data-order-id="${order.OrderId}">
      <div class="order-header">
        <span class="order-id">#${order.OrderId}</span>
        <span class="order-status ${statusClass}">${statusLabels[order.Status] || order.Status}</span>
      </div>
      
      <div class="order-customer">
        <strong>${order.CustomerName || 'Customer'}</strong>
        <a href="tel:${order.CustomerPhone}" class="customer-phone">📞 ${order.CustomerPhone}</a>
      </div>
      
      <div class="order-items">${itemsHtml}</div>
      
      <div class="order-fulfillment">${fulfillmentBadge}</div>
      
      ${addressHtml}
      ${scheduleHtml}
      
      <div class="order-total">
        <span>Total:</span>
        <strong>₱${(order.Total || 0).toLocaleString()}</strong>
      </div>
      
      <div class="order-actions">${actionsHtml}</div>
    </div>
  `;
}


// ============================================================
// UPDATE ORDER STATUS
// ============================================================

async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(API, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'updateOrderStatus',
        orderId: orderId,
        status: status
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(`✅ Order ${status}!`);
      loadOrders();
    } else {
      showToast('❌ Failed to update order', 'error');
    }
    
  } catch (error) {
    console.error('Error:', error);
    showToast('❌ Connection error', 'error');
  }
}

async function markReadyForCourier(orderId) {
  try {
    const response = await fetch(API, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'updateOrderStatus',
        orderId: orderId,
        status: 'ready',
        courierStatus: 'ready_for_pickup'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast('📦 Ready for courier! Customer notified.');
      loadOrders();
    } else {
      showToast('❌ Failed to update', 'error');
    }
    
  } catch (error) {
    console.error('Error:', error);
    showToast('❌ Connection error', 'error');
  }
}


// ============================================================
// UPDATE DASHBOARD STATS
// ============================================================

function updateDashboardStats(orders) {
  const today = new Date().toDateString();
  
  const todayOrders = orders.filter(o => new Date(o.CreatedAt).toDateString() === today);
  const pendingCount = orders.filter(o => o.Status === 'pending').length;
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.Total || 0), 0);
  
  // Update stat cards
  const pendingEl = document.getElementById('statPending');
  const todayEl = document.getElementById('statToday');
  const revenueEl = document.getElementById('statRevenue');
  
  if (pendingEl) pendingEl.textContent = pendingCount;
  if (todayEl) todayEl.textContent = todayOrders.length;
  if (revenueEl) revenueEl.textContent = `₱${todayRevenue.toLocaleString()}`;
}


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function showLoadingOrders() {
  const container = document.getElementById('ordersContainer');
  if (container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading orders...</p>
      </div>
    `;
  }
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function playNotificationSound() {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2telesBbAAAAAAA=');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch (e) {}
}

function refreshSession() {
  localStorage.setItem(SESSION_KEYS.LOGIN_TIME, Date.now().toString());
}


// ============================================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================================

window.logout = logout;
window.updateOrderStatus = updateOrderStatus;
window.markReadyForCourier = markReadyForCourier;
window.loadOrders = loadOrders;
