'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const ACCOMMODATION_TYPES = [
  { value: 'private_room',    label: 'Private Room',    icon: '🛏',  desc: 'A private bedroom in a shared property' },
  { value: 'suite',           label: 'Suite',           icon: '🏨',  desc: 'Larger room with premium amenities' },
  { value: 'cabin',           label: 'Cabin / Log Cabin',icon: '🪵', desc: 'A standalone rustic cabin' },
  { value: 'villa',           label: 'Villa',           icon: '🏡',  desc: 'Large private villa with full facilities' },
  { value: 'entire_property', label: 'Entire Property', icon: '🏘',  desc: 'The whole property exclusively' },
  { value: 'studio',          label: 'Studio',          icon: '🏢',  desc: 'Open-plan living space' },
  { value: 'glamping',        label: 'Glamping',        icon: '⛺',  desc: 'Glamorous camping experience' },
  { value: 'tent',            label: 'Tent / Camping',  icon: '🏕',  desc: 'Outdoor camping setup' },
  { value: 'treehouse',       label: 'Treehouse',       icon: '🌳',  desc: 'Elevated treehouse experience' },
  { value: 'container',       label: 'Container Home',  icon: '📦',  desc: 'Converted shipping container' },
  { value: 'dormitory',       label: 'Dormitory',       icon: '🛌',  desc: 'Shared dormitory-style room' },
  { value: 'other',           label: 'Other',           icon: '✦',  desc: 'Custom accommodation type' },
]

const BED_TYPES = ['Single','Double','Queen','King','Twin','Bunk','Floor Mattress','Sofa Bed']
const ALL_AMENITIES = [
  'Air Conditioning','Electric Fan','Free WiFi','Smart TV','Refrigerator',
  'Hot Shower','Private Bathroom','Shared Bathroom','Kitchen Access',
  'Full Kitchen','Mini Bar','Coffee Station','Washing Machine',
  'Bonfire Area','Karaoke','Garden','Balcony','Terrace',
  'Parking','Outdoor Shower','Pool','Jacuzzi','BBQ Grill',
  'Pet Friendly','Baby Cot','Extra Bed','Wheelchair Accessible',
]

export default function AccommodationsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [step, setStep] = useState<'list' | 'type-select' | 'form'>('list')
  const [pickedType, setPickedType] = useState<string>('')
  const [newAmenity, setNewAmenity] = useState('')
  const [newRoom, setNewRoom] = useState({
    name: '', description: '', highlights: '',
    accommodation_type: '', bedroom_count: 1, bathroom_count: 1,
    bed_type: 'Double', floor_area_sqm: '', capacity: 2, max_capacity: 2,
    location_note: '',
    price_weekday: 2500, price_weekend: 3200, price_holiday: 4000,
    fee_extra_guest: 500, fee_pet: 300, fee_late_checkout: 500,
    amenities: [] as string[], images: [] as string[], is_active: true,
  })

  async function load() {
    const { data } = await supabase.from('rooms').select('*').order('sort_order')
    setRooms(data || [])
  }
  useEffect(() => { load() }, [])

  async function selectRoom(r: any) {
    setSelected({ ...r, amenities: r.amenities || [], images: r.images || [] })
    setStep('list')
  }

  function updateSelected(field: string, value: any) {
    setSelected((s: any) => ({ ...s, [field]: value }))
  }

  function toggleAmenity(a: string, isNew = false) {
    if (isNew) {
      setNewRoom(n => ({
        ...n,
        amenities: n.amenities.includes(a) ? n.amenities.filter(x => x !== a) : [...n.amenities, a]
      }))
    } else {
      if (!selected) return
      const cur = selected.amenities || []
      updateSelected('amenities', cur.includes(a) ? cur.filter((x: string) => x !== a) : [...cur, a])
    }
  }

  async function save() {
    if (!selected) return
    setSaving(true)
    await supabase.from('rooms').update({
      name: selected.name, description: selected.description,
      highlights: selected.highlights, accommodation_type: selected.accommodation_type,
      bedroom_count: selected.bedroom_count, bathroom_count: selected.bathroom_count,
      bed_type: selected.bed_type, floor_area_sqm: selected.floor_area_sqm,
      capacity: selected.capacity, max_capacity: selected.max_capacity,
      location_note: selected.location_note,
      price_weekday: selected.price_weekday, price_weekend: selected.price_weekend,
      price_holiday: selected.price_holiday, fee_extra_guest: selected.fee_extra_guest,
      fee_pet: selected.fee_pet, fee_late_checkout: selected.fee_late_checkout,
      amenities: selected.amenities, images: selected.images, is_active: selected.is_active,
    }).eq('id', selected.id)
    await supabase.from('system_logs').insert([{ action: 'UPDATE_ACCOMMODATION', module: 'Property', description: `Updated accommodation: ${selected.name}` }])
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); load()
  }

  async function createAccommodation() {
    if (!newRoom.name || !newRoom.accommodation_type) return
    const { data } = await supabase.from('rooms').insert([{
      ...newRoom,
      floor_area_sqm: newRoom.floor_area_sqm ? Number(newRoom.floor_area_sqm) : null,
      sort_order: rooms.length + 1,
    }]).select().single()
    if (data) {
      await supabase.from('room_rules').insert([{
        room_id: data.id, checkin_time: '14:00', checkout_time: '10:00',
        max_guests: newRoom.max_capacity, allow_pets: false, allow_parking: true,
        allow_party: false, allow_smoking: false,
        house_rules: '• No parties or loud music after 10PM\n• No smoking inside\n• Pets must be declared',
        agreement_text: 'By confirming this booking, you agree to all house rules and a security deposit of ₱1,000 (refundable).',
      }])
      await supabase.from('welcome_messages').insert([{
        room_id: data.id, send_on: 'payment_confirmed', is_active: true,
        subject: `Your Luntian Booking is Confirmed! 🌿`,
        message_template: `Hi {{guest_name}}! Your booking at ${newRoom.name} is confirmed.\n\nCheck-in: {{checkin_date}} at {{checkin_time}}\nCheck-out: {{checkout_date}} at {{checkout_time}}\n\n🔑 Access:\n{{access_details}}\n\nWelcome! 🌿`,
      }])
      setStep('list')
      setNewRoom({ name:'',description:'',highlights:'',accommodation_type:'',bedroom_count:1,bathroom_count:1,bed_type:'Double',floor_area_sqm:'',capacity:2,max_capacity:2,location_note:'',price_weekday:2500,price_weekend:3200,price_holiday:4000,fee_extra_guest:500,fee_pet:300,fee_late_checkout:500,amenities:[],images:[],is_active:true })
      setPickedType('')
      load()
      selectRoom(data)
    }
  }

  async function deleteRoom(id: string) {
    if (!confirm('Delete this accommodation? This cannot be undone.')) return
    await supabase.from('rooms').delete().eq('id', id)
    setSelected(null); load()
  }

  const typeInfo = (val: string) => ACCOMMODATION_TYPES.find(t => t.value === val)

  const SectionHeader = ({ num, label }: { num: string, label: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#2d6a4f' }}>{num}</div>
      <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">{label}</h3>
    </div>
  )

  const FieldGroup = ({ children, cols = 2 }: { children: React.ReactNode, cols?: number }) => (
    <div className={`grid gap-4 mb-5`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>{children}</div>
  )

  const Field = ({ label, sub, children }: { label: string, sub?: string, children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">{label}</label>
      {sub && <div className="text-xs text-gray-400 mb-1.5">{sub}</div>}
      {!sub && <div className="mb-1.5" />}
      {children}
    </div>
  )

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-gray-50 focus:bg-white transition-all"

  // ─── TYPE SELECTION STEP ────────────────────────────────────────────────────
  if (step === 'type-select') {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep('list')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">‹</button>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">What type of accommodation?</h2>
            <p className="text-sm text-gray-400">Choose the type that best describes what you're adding</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {ACCOMMODATION_TYPES.map(t => (
            <button key={t.value} onClick={() => { setPickedType(t.value); setNewRoom(n => ({ ...n, accommodation_type: t.value })); setStep('form') }}
              className={`text-left p-4 rounded-2xl border-2 transition-all hover:shadow-md ${pickedType === t.value ? 'border-green-400 shadow-sm' : 'border-gray-100 bg-white hover:border-green-200'}`}
              style={pickedType === t.value ? { background: 'linear-gradient(135deg,#f0faf2,#fff)' } : {}}>
              <div className="text-3xl mb-3">{t.icon}</div>
              <div className="font-bold text-gray-900 text-sm">{t.label}</div>
              <div className="text-xs text-gray-400 mt-1 leading-tight">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── ADD ACCOMMODATION FORM STEP ────────────────────────────────────────────
  if (step === 'form') {
    const t = typeInfo(newRoom.accommodation_type)
    return (
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('type-select')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">‹</button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{t?.icon}</span>
                <h2 className="font-bold text-gray-900 text-lg">New {t?.label}</h2>
              </div>
              <p className="text-sm text-gray-400">{t?.desc}</p>
            </div>
          </div>
          <button onClick={createAccommodation} disabled={!newRoom.name}
            className="px-5 py-2.5 rounded-xl font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#2d6a4f,#40916c)' }}>
            Create Accommodation
          </button>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-5">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionHeader num="1" label="Basic Information" />
              <FieldGroup cols={2}>
                <div className="col-span-2">
                  <Field label="Accommodation Name *">
                    <input value={newRoom.name} onChange={e => setNewRoom(n => ({ ...n, name: e.target.value }))}
                      className={inp} placeholder={`e.g. ${t?.label} A, Forest ${t?.label}`} />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Short Description" sub="Shown on booking page">
                    <input value={newRoom.description} onChange={e => setNewRoom(n => ({ ...n, description: e.target.value }))}
                      className={inp} placeholder={`e.g. Cozy ${t?.label?.toLowerCase()} with garden view · up to 2 guests`} />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Highlights / Tagline" sub="Short selling line">
                    <input value={newRoom.highlights} onChange={e => setNewRoom(n => ({ ...n, highlights: e.target.value }))}
                      className={inp} placeholder="e.g. Perfect for couples seeking a peaceful escape" />
                  </Field>
                </div>
                <Field label="Location Note" sub="Directions or landmark">
                  <input value={newRoom.location_note} onChange={e => setNewRoom(n => ({ ...n, location_note: e.target.value }))}
                    className={inp} placeholder="e.g. Left wing, second door" />
                </Field>
              </FieldGroup>
            </div>

            {/* Room Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionHeader num="2" label="Room Details" />
              <FieldGroup cols={3}>
                <Field label="Bedrooms">
                  <input type="number" min={0} value={newRoom.bedroom_count} onChange={e => setNewRoom(n => ({ ...n, bedroom_count: Number(e.target.value) }))} className={inp} />
                </Field>
                <Field label="Bathrooms">
                  <input type="number" min={0} value={newRoom.bathroom_count} onChange={e => setNewRoom(n => ({ ...n, bathroom_count: Number(e.target.value) }))} className={inp} />
                </Field>
                <Field label="Floor Area (sqm)">
                  <input type="number" value={newRoom.floor_area_sqm} onChange={e => setNewRoom(n => ({ ...n, floor_area_sqm: e.target.value }))} className={inp} placeholder="e.g. 25" />
                </Field>
                <Field label="Bed Type">
                  <select value={newRoom.bed_type} onChange={e => setNewRoom(n => ({ ...n, bed_type: e.target.value }))} className={inp}>
                    {BED_TYPES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Standard Guests">
                  <input type="number" min={1} value={newRoom.capacity} onChange={e => setNewRoom(n => ({ ...n, capacity: Number(e.target.value) }))} className={inp} />
                </Field>
                <Field label="Max Guests (with fee)">
                  <input type="number" min={1} value={newRoom.max_capacity} onChange={e => setNewRoom(n => ({ ...n, max_capacity: Number(e.target.value) }))} className={inp} />
                </Field>
              </FieldGroup>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionHeader num="3" label="Amenities" />
              <div className="flex flex-wrap gap-2 mb-3">
                {ALL_AMENITIES.map(a => {
                  const active = newRoom.amenities.includes(a)
                  return (
                    <button key={a} onClick={() => toggleAmenity(a, true)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-green-300'}`}
                      style={active ? { background: '#2d6a4f' } : {}}>
                      {active ? '✓ ' : ''}{a}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <input value={newAmenity} onChange={e => setNewAmenity(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newAmenity.trim()) { setNewRoom(n => ({ ...n, amenities: [...n.amenities, newAmenity.trim()] })); setNewAmenity('') } }}
                  placeholder="Add custom amenity..." className={`flex-1 ${inp}`} />
                <button onClick={() => { if (newAmenity.trim()) { setNewRoom(n => ({ ...n, amenities: [...n.amenities, newAmenity.trim()] })); setNewAmenity('') } }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#2d6a4f' }}>Add</button>
              </div>
            </div>
          </div>

          {/* Right panel — Pricing */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionHeader num="4" label="Pricing (₱)" />
              {[
                ['Weekday', 'Mon–Thu', 'price_weekday'],
                ['Weekend', 'Fri–Sun', 'price_weekend'],
                ['Holiday', 'Peak dates', 'price_holiday'],
              ].map(([label, sub, field]) => (
                <div key={field} className="mb-3">
                  <label className="block text-xs font-bold text-gray-500 mb-0.5">{label}</label>
                  <div className="text-xs text-gray-400 mb-1">{sub}</div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₱</span>
                    <input type="number" value={(newRoom as any)[field]}
                      onChange={e => setNewRoom(n => ({ ...n, [field]: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:border-green-400 bg-gray-50" />
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                <div className="text-xs font-bold text-gray-400 uppercase mb-2">Extra Fees</div>
                {[['Extra guest/night', 'fee_extra_guest'],['Pet fee', 'fee_pet'],['Late checkout', 'fee_late_checkout']].map(([label, field]) => (
                  <div key={field}>
                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₱</span>
                      <input type="number" value={(newRoom as any)[field]}
                        onChange={e => setNewRoom(n => ({ ...n, [field]: Number(e.target.value) }))}
                        className="w-full border border-gray-200 rounded-xl pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-gray-50" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-xs text-green-700">
              💡 After creating, go to <strong>Rules & Agreements</strong> and <strong>Welcome Messages</strong> to set up your guest flow for this accommodation.
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── MAIN LIST + EDIT VIEW ──────────────────────────────────────────────────
  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-400">Manage all accommodation types and their details</p>
        <button onClick={() => setStep('type-select')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg,#2d6a4f,#40916c)' }}>
          + Add Accommodation
        </button>
      </div>

      <div className="flex gap-5">
        {/* Accommodation list */}
        <div className="w-52 flex-shrink-0 space-y-2">
          {rooms.map(r => {
            const t = typeInfo(r.accommodation_type)
            const active = selected?.id === r.id
            return (
              <button key={r.id} onClick={() => selectRoom(r)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${active ? 'border-green-400 shadow-md' : 'border-gray-100 bg-white hover:border-green-200'}`}
                style={active ? { background: 'linear-gradient(135deg,#f0faf2,#fff)' } : {}}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{t?.icon || '🏠'}</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${r.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                </div>
                <div className="font-bold text-sm text-gray-900 leading-tight">{r.name}</div>
                <div className="text-xs text-green-700 font-semibold mt-0.5">{t?.label || 'Room'}</div>
                <div className="text-xs text-gray-400 mt-1 leading-tight">{r.description}</div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>🛏 {r.bedroom_count || 1}</span>
                  <span>🚿 {r.bathroom_count || 1}</span>
                  <span>👥 {r.capacity}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Edit panel */}
        {selected ? (
          <div className="flex-1 min-w-0 space-y-5">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4" style={{ background: 'linear-gradient(135deg,#f0faf2,#fff)' }}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{typeInfo(selected.accommodation_type)?.icon || '🏠'}</span>
                  <div>
                    <div className="font-bold text-gray-900 text-xl">{selected.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: '#2d6a4f' }}>{typeInfo(selected.accommodation_type)?.label || 'Accommodation'}</span>
                      <span className="text-xs text-gray-400">🛏 {selected.bedroom_count} br · 🚿 {selected.bathroom_count} ba · 👥 up to {selected.max_capacity || selected.capacity}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-gray-600">Active</span>
                    <div className="relative">
                      <input type="checkbox" checked={selected.is_active} onChange={e => updateSelected('is_active', e.target.checked)} className="sr-only peer" />
                      <div className="w-10 h-6 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                    </div>
                  </label>
                  <button onClick={() => deleteRoom(selected.id)} className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </button>
                  <button onClick={save} disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                    style={{ background: saved ? '#059669' : 'linear-gradient(135deg,#2d6a4f,#40916c)' }}>
                    {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div className="col-span-2 space-y-5">
                {/* Basic Info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <SectionHeader num="1" label="Basic Information" />
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Accommodation Name">
                        <input value={selected.name} onChange={e => updateSelected('name', e.target.value)} className={inp} />
                      </Field>
                      <Field label="Accommodation Type">
                        <select value={selected.accommodation_type || 'private_room'} onChange={e => updateSelected('accommodation_type', e.target.value)} className={inp}>
                          {ACCOMMODATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Short Description">
                      <input value={selected.description || ''} onChange={e => updateSelected('description', e.target.value)} className={inp} />
                    </Field>
                    <Field label="Highlights / Tagline">
                      <input value={selected.highlights || ''} onChange={e => updateSelected('highlights', e.target.value)} className={inp} />
                    </Field>
                    <Field label="Location Note" sub="Internal note for guests — where exactly this accommodation is">
                      <input value={selected.location_note || ''} onChange={e => updateSelected('location_note', e.target.value)} className={inp} placeholder="e.g. Left wing of main building, second door" />
                    </Field>
                  </div>
                </div>

                {/* Room Specs */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <SectionHeader num="2" label="Room Specifications" />
                  <div className="grid grid-cols-3 gap-4">
                    {[['Bedrooms', 'bedroom_count', 'number'],['Bathrooms', 'bathroom_count', 'number'],['Floor Area (sqm)', 'floor_area_sqm', 'number']].map(([l, f, t]) => (
                      <Field key={f} label={l}>
                        <input type={t} value={selected[f] || ''} onChange={e => updateSelected(f, t === 'number' ? Number(e.target.value) : e.target.value)} className={inp} />
                      </Field>
                    ))}
                    <Field label="Bed Type">
                      <select value={selected.bed_type || 'Double'} onChange={e => updateSelected('bed_type', e.target.value)} className={inp}>
                        {BED_TYPES.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </Field>
                    <Field label="Standard Guests">
                      <input type="number" min={1} value={selected.capacity} onChange={e => updateSelected('capacity', Number(e.target.value))} className={inp} />
                    </Field>
                    <Field label="Max Guests (with fee)">
                      <input type="number" min={1} value={selected.max_capacity || selected.capacity} onChange={e => updateSelected('max_capacity', Number(e.target.value))} className={inp} />
                    </Field>
                  </div>
                </div>

                {/* Amenities */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <SectionHeader num="3" label="Amenities" />
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ALL_AMENITIES.map(a => {
                      const active = (selected.amenities || []).includes(a)
                      return (
                        <button key={a} onClick={() => toggleAmenity(a, false)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-green-300'}`}
                          style={active ? { background: '#2d6a4f' } : {}}>
                          {active ? '✓ ' : ''}{a}
                        </button>
                      )
                    })}
                  </div>
                  {/* Custom amenities */}
                  {(selected.amenities || []).filter((a: string) => !ALL_AMENITIES.includes(a)).map((a: string) => (
                    <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white mr-2 mb-2" style={{ background: '#40916c' }}>
                      {a}
                      <button onClick={() => updateSelected('amenities', (selected.amenities || []).filter((x: string) => x !== a))} className="hover:opacity-70">×</button>
                    </span>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input value={newAmenity} onChange={e => setNewAmenity(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && newAmenity.trim()) { updateSelected('amenities', [...(selected.amenities || []), newAmenity.trim()]); setNewAmenity('') } }}
                      placeholder="Add custom amenity..." className={`flex-1 ${inp}`} />
                    <button onClick={() => { if (newAmenity.trim()) { updateSelected('amenities', [...(selected.amenities || []), newAmenity.trim()]); setNewAmenity('') } }}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: '#2d6a4f' }}>Add</button>
                  </div>
                </div>

                {/* Photos */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <SectionHeader num="4" label="Photo URLs" />
                  <p className="text-xs text-gray-400 mb-3">Paste direct image links. These will display on your booking page.</p>
                  <div className="space-y-2">
                    {(selected.images || []).map((img: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        {img && <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                        <input value={img} onChange={e => { const imgs = [...(selected.images || [])]; imgs[i] = e.target.value; updateSelected('images', imgs) }}
                          className={`flex-1 ${inp} font-mono text-xs`} placeholder="https://..." />
                        <button onClick={() => updateSelected('images', (selected.images || []).filter((_: any, j: number) => j !== i))} className="text-gray-300 hover:text-red-400 text-xl flex-shrink-0">×</button>
                      </div>
                    ))}
                    <button onClick={() => updateSelected('images', [...(selected.images || []), ''])}
                      className="text-xs text-green-700 font-semibold hover:underline mt-1">+ Add photo URL</button>
                  </div>
                </div>
              </div>

              {/* Pricing sidebar */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <SectionHeader num="5" label="Pricing (₱)" />
                  {[['Weekday', 'Mon–Thu', 'price_weekday'],['Weekend', 'Fri–Sun', 'price_weekend'],['Holiday', 'Peak dates', 'price_holiday']].map(([l, s, f]) => (
                    <div key={f} className="mb-3">
                      <label className="block text-xs font-bold text-gray-500 mb-0.5">{l}</label>
                      <div className="text-xs text-gray-400 mb-1">{s}</div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₱</span>
                        <input type="number" value={(selected as any)[f]}
                          onChange={e => updateSelected(f, Number(e.target.value))}
                          className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:border-green-400 bg-gray-50" />
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-3 mt-1 space-y-2">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">Extra Fees</div>
                    {[['Extra guest / night', 'fee_extra_guest'],['Pet fee (per stay)', 'fee_pet'],['Late checkout', 'fee_late_checkout']].map(([l, f]) => (
                      <div key={f}>
                        <label className="text-xs text-gray-500 mb-1 block">{l}</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₱</span>
                          <input type="number" value={(selected as any)[f]}
                            onChange={e => updateSelected(f, Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-xl pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-gray-50" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 space-y-1.5">
                  <div>📝 <a href="/admin/agreements" className="font-bold underline">Set Rules & Agreement</a></div>
                  <div>💌 <a href="/admin/messages" className="font-bold underline">Edit Welcome Message</a></div>
                  <div>🔑 <a href="/admin/messages" className="font-bold underline">Set Access Details</a></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🏡</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Select an accommodation to edit</h3>
            <p className="text-sm text-gray-400 mb-6">Or add a new one to get started</p>
            <button onClick={() => setStep('type-select')}
              className="px-5 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#2d6a4f,#40916c)' }}>
              + Add Accommodation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
