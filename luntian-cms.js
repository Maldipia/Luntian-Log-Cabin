/**
 * LUNTIAN CMS ENGINE v1.0
 * ═══════════════════════════════════════════════════════════
 * Architecture:
 *   Admin Dashboard → Supabase DB → This script → DOM update
 *
 * How it works:
 *   1. Fetches content from Supabase on every page load
 *   2. Finds HTML elements tagged with data-cms="key"
 *   3. Replaces their content with the DB value
 *   4. Also dynamically renders rooms and food menu
 *
 * To make ANY element editable, add: data-cms="your_key"
 * ═══════════════════════════════════════════════════════════
 */

const SUPABASE_URL = 'https://hajjuiqwgzwmrbqpihli.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhamp1aXF3Z3p3bXJicXBpaGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzEzNDQsImV4cCI6MjA5MTQwNzM0NH0.3c094GIj3rMRwIysi_GRV6Pzz1vCvZy7ggK2tH2yz4Y'

async function supabaseFetch(table, query = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  })
  if (!res.ok) return null
  return res.json()
}

// ── CONTENT ENGINE ────────────────────────────────────────────────────────────
async function loadCMSContent() {
  const content = await supabaseFetch('content', '?select=key,value,type&order=sort_order')
  if (!content) return {}

  const map = {}
  content.forEach(item => { map[item.key] = { value: item.value, type: item.type } })

  // Apply to all data-cms elements
  document.querySelectorAll('[data-cms]').forEach(el => {
    const key = el.getAttribute('data-cms')
    if (!map[key]) return
    const { value, type } = map[key]

    if (type === 'boolean') {
      // Handle visibility toggles
      if (value === 'false') el.style.display = 'none'
      else el.style.removeProperty('display')
    } else if (type === 'html') {
      el.innerHTML = value
    } else if (el.tagName === 'A' && el.hasAttribute('data-cms-href')) {
      el.href = value
    } else if (el.tagName === 'IMG' && el.hasAttribute('data-cms-src')) {
      el.src = value
    } else {
      el.textContent = value
    }
  })

  // Handle special attributes
  document.querySelectorAll('[data-cms-href]').forEach(el => {
    const key = el.getAttribute('data-cms-href')
    if (map[key]) el.href = map[key].value
  })

  document.querySelectorAll('[data-cms-src]').forEach(el => {
    const key = el.getAttribute('data-cms-src')
    if (map[key]) el.src = map[key].value
  })

  document.querySelectorAll('[data-cms-style-bg]').forEach(el => {
    const key = el.getAttribute('data-cms-style-bg')
    if (map[key]) el.style.backgroundColor = map[key].value
  })

  // Update page title and meta
  if (map['meta_title']) document.title = map['meta_title'].value
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc && map['meta_description']) metaDesc.content = map['meta_description'].value

  return map
}

// ── ROOMS ENGINE ──────────────────────────────────────────────────────────────
async function loadRooms() {
  const rooms = await supabaseFetch('rooms', '?select=*&eq.is_active=true&order=sort_order')
  if (!rooms || !rooms.length) return

  const container = document.querySelector('[data-cms-section="rooms"]')
  if (!container) return

  container.innerHTML = rooms.map(room => {
    const images = room.images && room.images.length ? room.images : []
    const mainImage = images[0] || ''
    const amenities = room.amenities || []

    return `
    <div class="room-card" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);margin-bottom:2rem;">
      ${mainImage ? `<img src="${mainImage}" alt="${room.name}" style="width:100%;height:280px;object-fit:cover;">` : ''}
      <div style="padding:1.5rem;">
        <h3 style="font-size:1.4rem;margin-bottom:0.5rem;">${room.name}</h3>
        <p style="color:#666;margin-bottom:1rem;">${room.description || ''}</p>
        ${room.highlights ? `<p style="color:#2d6a4f;font-style:italic;margin-bottom:1rem;">"${room.highlights}"</p>` : ''}
        <div style="display:flex;gap:1rem;margin-bottom:1rem;font-size:0.85rem;color:#888;">
          ${room.bedroom_count ? `<span>🛏 ${room.bedroom_count} BR</span>` : ''}
          ${room.bathroom_count ? `<span>🚿 ${room.bathroom_count} BA</span>` : ''}
          ${room.capacity ? `<span>👥 Up to ${room.max_capacity || room.capacity} guests</span>` : ''}
        </div>
        ${amenities.length ? `
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:1.2rem;">
          ${amenities.slice(0,6).map(a => `<span style="background:#d8f3dc;color:#1b4332;font-size:0.75rem;padding:3px 10px;border-radius:20px;">✓ ${a}</span>`).join('')}
        </div>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:1.5rem;font-weight:700;color:#2d6a4f;">₱${room.price_weekday?.toLocaleString()}<span style="font-size:0.8rem;font-weight:400;color:#888;">/weeknight</span></div>
            <div style="font-size:0.85rem;color:#888;">Weekend: ₱${room.price_weekend?.toLocaleString()} · Holiday: ₱${room.price_holiday?.toLocaleString()}</div>
          </div>
          <a href="booking.html" style="background:linear-gradient(135deg,#2d6a4f,#40916c);color:#fff;padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:0.9rem;">📅 Book Now</a>
        </div>
      </div>
    </div>`
  }).join('')
}

// ── FOOD MENU ENGINE ──────────────────────────────────────────────────────────
async function loadFoodMenu() {
  const items = await supabaseFetch('food_menu', '?select=*&eq.is_available=true&order=category,sort_order')
  if (!items || !items.length) return

  const container = document.querySelector('[data-cms-section="food-menu"]')
  if (!container) return

  // Group by category
  const categories = {}
  items.forEach(item => {
    if (!categories[item.category]) categories[item.category] = []
    categories[item.category].push(item)
  })

  container.innerHTML = Object.entries(categories).map(([cat, catItems]) => `
    <div style="margin-bottom:2rem;">
      <h3 style="color:#2d6a4f;border-bottom:2px solid #d8f3dc;padding-bottom:0.5rem;margin-bottom:1rem;">${cat}</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;">
        ${catItems.map(item => `
        <div style="background:#f9f9f9;border-radius:12px;padding:1rem;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:600;color:#333;">${item.name}</div>
            ${item.description ? `<div style="font-size:0.8rem;color:#888;">${item.description}</div>` : ''}
          </div>
          <div style="font-weight:700;font-size:1.1rem;color:#2d6a4f;white-space:nowrap;">₱${item.price?.toLocaleString()}</div>
        </div>`).join('')}
      </div>
    </div>
  `).join('')
}

// ── ADD-ONS ENGINE ────────────────────────────────────────────────────────────
async function loadAddons() {
  const addons = await supabaseFetch('addons', '?select=*&eq.is_available=true&order=sort_order')
  if (!addons || !addons.length) return

  const container = document.querySelector('[data-cms-section="addons"]')
  if (!container) return

  container.innerHTML = addons.map(addon => `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1rem;display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
      <div>
        <div style="font-weight:600;color:#1a1d23;">${addon.name}</div>
        <div style="font-size:0.8rem;color:#888;">${addon.description || addon.category}</div>
      </div>
      <div style="font-weight:700;color:#2d6a4f;font-size:1rem;">₱${addon.price?.toLocaleString()}</div>
    </div>
  `).join('')
}

// ── AVAILABILITY / BOOKING VALIDATION ─────────────────────────────────────────
async function checkAvailability(roomId, checkIn, checkOut) {
  const blocks = await supabaseFetch('availability_blocks',
    `?eq.room_id=${roomId}&lt.start_date=${checkOut}&gt.end_date=${checkIn}`)
  const bookings = await supabaseFetch('bookings',
    `?eq.room_id=${roomId}&neq.status=cancelled&lt.check_in=${checkOut}&gt.check_out=${checkIn}`)

  const hasBlock = blocks && blocks.length > 0
  const hasBooking = bookings && bookings.length > 0
  return !hasBlock && !hasBooking
}

// ── PROMO VALIDATION ──────────────────────────────────────────────────────────
async function validatePromo(code) {
  const promos = await supabaseFetch('promos',
    `?eq.code=${code.toUpperCase()}&eq.is_active=true`)
  if (!promos || !promos.length) return { valid: false, message: 'Invalid promo code' }

  const promo = promos[0]
  const now = new Date()
  if (promo.valid_until && new Date(promo.valid_until) < now)
    return { valid: false, message: 'Promo code has expired' }
  if (promo.valid_from && new Date(promo.valid_from) > now)
    return { valid: false, message: 'Promo not yet active' }
  if (promo.usage_limit && promo.usage_count >= promo.usage_limit)
    return { valid: false, message: 'Promo usage limit reached' }

  return {
    valid: true,
    type: promo.type,
    value: promo.value,
    message: `Promo applied: ${promo.type === 'percent' ? promo.value + '% off' : '₱' + promo.value + ' off'}`
  }
}

// Expose to global scope for use in booking forms
window.LuntianCMS = { checkAvailability, validatePromo, supabaseFetch }

// ── INIT ──────────────────────────────────────────────────────────────────────
async function initCMS() {
  try {
    await Promise.all([
      loadCMSContent(),
      loadRooms(),
      loadFoodMenu(),
      loadAddons(),
    ])
    console.log('✅ Luntian CMS loaded successfully')
  } catch (err) {
    console.warn('CMS load error (non-critical):', err)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCMS)
} else {
  initCMS()
}
