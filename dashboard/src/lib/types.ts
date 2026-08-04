export const WEBHOOK_DEAL_CLOSED =
  'https://api.deltarentalsdubai.com/webhook/deal-closed-vanguard-whatsapp'

export type LeadFilter = 'all' | 'today' | '30' | 'date'

export type WhatsAppLead = {
  id: string | number
  inquiry_time: string
  gclid: string | null
  vipcode?: string | null
  utm_source: string | null
  utm_campaign: string | null
  country: string
  country_code: string
  city: string
  region: string
  lead_value?: string | number | null
  whatsapp_number?: string | null
  closed_time?: string | null
}

export function parseLeadValue(value: WhatsAppLead['lead_value']): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = parseFloat(String(value))
  return Number.isNaN(parsed) ? null : parsed
}

/** Saved when Supabase has both phone and deal amount on the lead row. */
export function isLeadSaved(lead: WhatsAppLead): boolean {
  const phone = lead.whatsapp_number?.trim()
  const amount = parseLeadValue(lead.lead_value)
  return Boolean(phone) && amount !== null && amount > 0
}

export type DealClosedPayload = {
  event: 'deal_closed'
  closed_at: string
  click_id: string | number
  inquiry_time: string
  gclid: string | null
  vipcode: string | null
  utm_source: string | null
  utm_campaign: string | null
  country: string
  country_code: string
  city: string
  region: string
  phone: string
  deal_amount: number
  deal_amount_currency: 'AED'
}

export type Booking = {
  car_name?: string
  car_model?: string
  fleet_name?: string
  revenue?: number
  car_plate?: string
  booking_days?: number | string
  booking_start_date?: string
  booking_end_date?: string
  inquiry_start_date?: string
  inquiry_end_date?: string
  external_notes?: string
}

export type WatiContact = {
  id?: string | number
  first_name?: string
  last_name?: string
  phone?: string
  created_at: string
  lead_icon?: string
  lead_stage?: string
  lead_source?: string
  lead_value?: number
  lead_notes_report?: string
  bookings?: Booking[] | string
}

export function parseBookings(raw: Booking[] | string | undefined): Booking[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
