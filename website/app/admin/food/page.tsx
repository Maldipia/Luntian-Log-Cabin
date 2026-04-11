'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase, FoodItem } from '@/lib/supabase'

const CATEGORIES = ['Breakfast','Mains','Snacks','Drinks','Packages']

export default function FoodPage() {
  const [items, setItems] = useState<FoodItem[]>([])
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', category: 'Breakfast', price: 0, description: '' })

  async function load() {
    const { data } = await supabase.from('food_menu').select('*').order('category').order('sort_order')
    setItems(data || [])
  }
  useEffect(() => { load() }, [])

  async function toggleAvail(id: string, val: boolean) {
    await supabase.from('food_menu').update({ is_available: val }).eq('id', id)
    setItems(i => i.map(x => x.id === id ? { ...x, is_available: val } : x))
  }

  async function updatePrice(id: string, price: number) {
    await supabase.from('food_menu').update({ price }).eq('id', id)
    setItems(i => i.map(x => x.id === id ? { ...x, price } : x))
  }

  async function addItem() {
    if (!newItem.name || !newItem.price) return
    await supabase.from('food_menu').insert([{ ...newItem, is_available: true }])
    setNewItem({ name: '', category: 'Breakfast', price: 0, description: '' })
    setAdding(false); load()
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this item?')) return
    await supabase.from('food_menu').delete().eq('id', id)
    setItems(i => i.filter(x => x.id !== id))
  }

  const grouped = CATEGORIES.map(cat => ({ cat, items: items.filter(i => i.category === cat) })).filter(g => g.items.length > 0)

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setAdding(!adding)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          {adding ? 'Cancel' : '+ Add item'}
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-blue-100 rounded-xl p-5 space-y-3">
          <div className="text-sm font-medium text-gray-900">New menu item</div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Name</label>
              <input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" placeholder="e.g. Adobo Rice" /></div>
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
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" placeholder="Optional" /></div>
          </div>
          <button onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Add to menu</button>
        </div>
      )}

      {grouped.map(({ cat, items: catItems }) => (
        <div key={cat} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{cat}</span>
          </div>
          {catItems.map(item => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                {item.description && <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">₱</span>
                <input type="number" defaultValue={item.price}
                  onBlur={e => updatePrice(item.id, Number(e.target.value))}
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:border-blue-400" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={item.is_available} onChange={e => toggleAvail(item.id, e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </label>
              <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
