export interface Property {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface PropertyPaymentAccount {
  property_id: string;
  property_name: string;
  property_slug: string;
  prompt_pay: string | null;
  bank_account: string | null;
  receiver_name: string | null;
  contact_line_url: string | null;
  contact_line_qr_url: string | null;
  contact_phone: string | null;
  owner_line_user_id: string | null;
  billing_day: number;
  meter_reminder_days_before: number;
  include_utilities: boolean;
  water_rate_per_unit: number;
  electric_rate_per_unit: number;
}

export type PropertyPaymentInput = {
  prompt_pay?: string | null;
  bank_account?: string | null;
  receiver_name?: string | null;
  contact_line_url?: string | null;
  contact_line_qr_url?: string | null;
  contact_phone?: string | null;
  owner_line_user_id?: string | null;
  billing_day?: number;
  meter_reminder_days_before?: number;
  include_utilities?: boolean;
  water_rate_per_unit?: number;
  electric_rate_per_unit?: number;
};

export type PropertyContact = {
  contact_line_url: string | null;
  contact_line_qr_url: string | null;
  contact_phone: string | null;
};

export type RoomStatus = "available" | "occupied" | "maintenance";

export interface Room {
  id: string;
  property_id: string;
  room_number: string;
  base_rent_price: number;
  status: RoomStatus;
}

export interface Tenant {
  id: string;
  room_id: string;
  line_user_id: string | null;
  phone_number: string;
  name: string;
  move_in_date: string;
  pdpa_consented_at: string | null;
  invite_code: string | null;
}

export type InvoiceStatus = "pending" | "scanning" | "paid";

export interface Invoice {
  id: string;
  property_id: string;
  tenant_id: string;
  room_id: string;
  billing_month: string;
  water_unit: number;
  electric_unit: number;
  base_rent_amount: number;
  water_amount: number;
  electric_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  slip_image_url: string | null;
  slip_rejection_note: string | null;
}
