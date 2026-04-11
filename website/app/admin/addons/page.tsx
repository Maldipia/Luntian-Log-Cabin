'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase, Addon } from '@/lib/supabase'

const CATEGORIES = ['Photography','Celebration','Experience','Wellness','Other']

export default function AddonsPage() {
  const [items, setItems] = useState<Addon[]>([])
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', category: 'Photography', price: 0, description: '' })

  async function load() {
    const { data } = await supabase.from('addons').select('*').order('category').order('sort_order')
    setItems(data || [])
  }
  useEffect(() => { load() }, [])

  async function toggleAvail(id: string, val: boolean) {
    await supabase.from('addons').update({ is_available: val }).eq('id', id)
    setItems(i => i.map(x => x.id === id ? { ...x, is_available: val } : x))
  }

  async function updatePrice(id: string, price: number) {
    await supabase.from('addons').update({ price }).eq('id', id)
    setItems(i => i.map(x => x.id === id ? { ...x, price } : x))
  }

  async function addItem() {
    if (!newItem.name || !newItem.price) return
    await supabase.from('addons').insert([{ ...newItem, is_available: true }])
    setNewItem({ name: '', category: 'Photography', price: 0, description: '' })
    setAdding(false); load()
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this service?')) return
    await supabase.from('addons').delete().eq('id', id)
    setItems(i => i.filter(x => x.id !== id))
  }

  const catBadge: Record<string, string> = {
    Photography: 'bg-purple-50 text-purple-700',
    Celebration: 'bg-pink-50 text-pink-700',
    Experience: 'bg-orange-50 text-orange-700',
    Wellness: 'bg-green-50 text-green-700',
    Other: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setAdding(!adding)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          {adding ? 'Cancel' : '+ Add service'}
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-blue-100 rounded-xl p-5 space-y-3">
          <div className="text-sm font-medium">New add-on service</div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Name</label>
              <input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Price (₱)</label>
              <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
              <input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" /></div>
          </div>
          <button onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Add service</button>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
            {['Service','Category','Price (₱)','Available',''].map(h => <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>)}
          </tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  {item.description && <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${catBadge[item.category] || 'bg-gray-100 text-gray-600'}`}>{item.category}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">₱</span>
                    <input type="number" defaultValue={item.price}
                      onBlur={e => updatePrice(item.id, Number(e.target.value))}
                      className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:border-blue-400" />
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={item.is_available} onChange={e => toggleAvail(item.id, e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </label>
                </td>
                <td className="px-5 py-3.5">
                  <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
