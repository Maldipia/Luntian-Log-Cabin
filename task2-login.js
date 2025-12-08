// ============================================================
// AMADEO MARKETPLACE v3.1 - TASK 2: SESSION MANAGEMENT
// File: login.js - Merchant Login & Session Handling
// ============================================================

const API = 'https://script.google.com/macros/s/AKfycbwgHmmK1j8a6rqx_Zfk5nPGqdUIRSo1oIUNgGoVr2-in988F3K8Kyp8PN15zHS3InIUgw/exec';

// Session storage keys
const SESSION_KEYS = {
  MERCHANT: 'amadeo_merchant',
  LOGIN_TIME: 'amadeo_login_time',
  SESSION_TOKEN: 'amadeo_session'
};

// Session timeout (24 hours in milliseconds)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;


// ============================================================
// CHECK EXISTING SESSION ON PAGE LOAD
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  // If already logged in, redirect to dashboard
  if (isLoggedIn()) {
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Set up form handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});


// ============================================================
// CHECK IF USER IS LOGGED IN
// ============================================================

function isLoggedIn() {
  const merchant = localStorage.getItem(SESSION_KEYS.MERCHANT);
  const loginTime = localStorage.getItem(SESSION_KEYS.LOGIN_TIME);
  
  if (!merchant || !loginTime) {
    return false;
  }
  
  // Check if session has expired
  const elapsed = Date.now() - parseInt(loginTime);
  if (elapsed > SESSION_TIMEOUT) {
    // Session expired, clear and return false
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
    clearSession();
    return null;
  }
}


// ============================================================
// HANDLE LOGIN FORM SUBMISSION
// ============================================================

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const submitBtn = document.getElementById('loginBtn');
  const errorDiv = document.getElementById('loginError');
  
  // Validate inputs
  if (!email || !password) {
    showError('Please enter email and password');
    return;
  }
  
  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Logging in...';
  errorDiv.style.display = 'none';
  
  try {
    const response = await fetch(API, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'merchantLogin',
        email: email,
        password: password
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Save session to localStorage
      saveSession(result.merchant);
      
      // Show success message
      showSuccess('Login successful! Redirecting...');
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
      
    } else {
      showError(result.error || 'Invalid email or password');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
    
  } catch (error) {
    console.error('Login error:', error);
    showError('Connection error. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
}


// ============================================================
// SAVE SESSION TO LOCALSTORAGE
// ============================================================

function saveSession(merchant) {
  // Generate a simple session token
  const sessionToken = generateSessionToken();
  
  // Save to localStorage
  localStorage.setItem(SESSION_KEYS.MERCHANT, JSON.stringify(merchant));
  localStorage.setItem(SESSION_KEYS.LOGIN_TIME, Date.now().toString());
  localStorage.setItem(SESSION_KEYS.SESSION_TOKEN, sessionToken);
  
  console.log('Session saved for:', merchant.BusinessName);
}


// ============================================================
// CLEAR SESSION (LOGOUT)
// ============================================================

function clearSession() {
  localStorage.removeItem(SESSION_KEYS.MERCHANT);
  localStorage.removeItem(SESSION_KEYS.LOGIN_TIME);
  localStorage.removeItem(SESSION_KEYS.SESSION_TOKEN);
  console.log('Session cleared');
}


// ============================================================
// LOGOUT FUNCTION
// ============================================================

function logout() {
  clearSession();
  window.location.href = 'merchant-login.html';
}


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateSessionToken() {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function showError(message) {
  const errorDiv = document.getElementById('loginError');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.className = 'alert alert-error';
  }
}

function showSuccess(message) {
  const errorDiv = document.getElementById('loginError');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.className = 'alert alert-success';
  }
}


// ============================================================
// REFRESH SESSION (extends timeout)
// ============================================================

function refreshSession() {
  if (isLoggedIn()) {
    localStorage.setItem(SESSION_KEYS.LOGIN_TIME, Date.now().toString());
  }
}


// ============================================================
// EXPORT FOR USE IN OTHER FILES
// ============================================================

// These functions will be available globally
window.AmadeoAuth = {
  isLoggedIn,
  getCurrentMerchant,
  saveSession,
  clearSession,
  logout,
  refreshSession,
  SESSION_KEYS
};
