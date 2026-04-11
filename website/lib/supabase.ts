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
}
export type Booking = {
  id: string; booking_ref: string; room_id: string; guest_name: string
  guest_email: string; guest_phone: string; check_in: string; check_out: string
  num_guests: number; has_pet: boolean; base_price: number; total_revenue: number
  status: string; special_requests: string; platform: string
}
