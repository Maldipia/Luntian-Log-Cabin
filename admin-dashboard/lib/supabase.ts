import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Room = {
  id: string
  name: string
  description: string
  capacity: number
  price_weekday: number
  price_weekend: number
  price_holiday: number
  fee_extra_guest: number
  fee_pet: number
  fee_late_checkout: number
  is_active: boolean
  sort_order: number
}

export type Booking = {
  id: string
  booking_ref: string
  room_id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  platform: string
  platform_booking_id: string
  check_in: string
  check_out: string
  nights: number
  num_guests: number
  has_pet: boolean
  base_price: number
  food_total: number
  addon_total: number
  total_revenue: number
  status: string
  special_requests: string
  notes: string
  created_at: string
  rooms?: Room
}

export type FoodItem = {
  id: string
  name: string
  category: string
  price: number
  description: string
  is_available: boolean
  sort_order: number
}

export type Addon = {
  id: string
  name: string
  category: string
  price: number
  description: string
  is_available: boolean
  sort_order: number
}

export type Staff = {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
}
