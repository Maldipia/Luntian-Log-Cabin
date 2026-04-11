import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Room = {
  id: string; name: string; accommodation_type: string
  description: string; highlights: string; price_weekday: number
  price_weekend: number; price_holiday: number; capacity: number
  max_capacity: number; bedroom_count: number; bathroom_count: number
  bed_type: string; amenities: string[]; images: string[]; is_active: boolean
  sort_order: number; fee_extra_guest: number; fee_pet: number; fee_late_checkout: number
  location_note: string; floor_area_sqm: number; room_type: string
}

export type Booking = {
  id: string; booking_ref: string; room_id: string; guest_name: string
  guest_email: string; guest_phone: string; check_in: string; check_out: string
  nights: number; num_guests: number; has_pet: boolean; base_price: number
  food_total: number; addon_total: number; total_revenue: number
  status: string; special_requests: string; platform: string; notes: string
  created_at: string; updated_at: string; guest_id: string
  payment_verified: boolean; id_verified: boolean; deposit_paid: boolean
  rooms?: any
}

export type FoodItem = {
  id: string; name: string; category: string; price: number
  description: string; is_available: boolean; sort_order: number
}

export type Addon = {
  id: string; name: string; category: string; price: number
  description: string; is_available: boolean; sort_order: number
}

export type Staff = {
  id: string; email: string; full_name: string; role: string; is_active: boolean
}
