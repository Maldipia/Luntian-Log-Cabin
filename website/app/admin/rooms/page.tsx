'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase, Room } from '@/lib/supabase'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { supabase.from('rooms').select('*').order('sort_order').then(({ data }) => setRooms(data || [])) }, [])

  function update(id: string, field: keyof Room, value: number) {
    setRooms(r => r.map(room => room.id === id ? { ...room, [field]: value } : room))
  }

  async function save() {
    setSaving(true)
    for (const room of rooms) {
      await supabase.from('rooms').update({
        price_weekday: room.price_weekday,
        price_weekend: room.price_weekend,
        price_holiday: room.price_holiday,
        fee_extra_guest: room.fee_extra_guest,
        fee_pet: room.fee_pet,
        fee_late_checkout: room.fee_late_checkout,
      }).eq('id', room.id)
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  const PriceInput = ({ roomId, field, label }: { roomId: string, field: keyof Room, label: string }) => {
    const room = rooms.find(r => r.id === roomId)
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-gray-500">{label}</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">₱</span>
          <input type="number" value={room ? Number(room[field]) : 0}
            onChange={e => update(roomId, field, Number(e.target.value))}
            className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right font-medium focus:outline-none focus:border-blue-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Set nightly rates per room type</p>
        <button onClick={save} disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all">
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {rooms.map(room => (
          <div key={room.id} className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="font-medium text-gray-900 mb-0.5">{room.name}</div>
            <div className="text-xs text-gray-400 mb-4">{room.description}</div>
            <div className="space-y-0.5 border-b border-gray-100 pb-4 mb-4">
              <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Nightly rates</div>
              <PriceInput roomId={room.id} field="price_weekday" label="Weekday (Mon–Thu)" />
              <PriceInput roomId={room.id} field="price_weekend" label="Weekend (Fri–Sun)" />
              <PriceInput roomId={room.id} field="price_holiday" label="Holiday" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Extra fees</div>
              <PriceInput roomId={room.id} field="fee_extra_guest" label="Extra guest / night" />
              <PriceInput roomId={room.id} field="fee_pet" label="Pet fee (per stay)" />
              <PriceInput roomId={room.id} field="fee_late_checkout" label="Late checkout" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
