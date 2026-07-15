export interface Property {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export type TechnicianDept = "electrical" | "plumbing" | "internet";

export interface TechnicianDeptContact {
  phone: string | null;
  line_url: string | null;
  display_name: string | null;
}

export type TechnicianContacts = Partial<
  Record<TechnicianDept, TechnicianDeptContact>
>;

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
  technician_phone: string | null;
  technician_contacts: TechnicianContacts;
  owner_line_user_id: string | null;
  billing_day: number;
  meter_reminder_days_before: number;
  reminder_soft_days: number;
  reminder_firm_days: number;
  reminder_final_days: number;
  reminder_template_soft: string | null;
  reminder_template_firm: string | null;
  reminder_template_final: string | null;
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
  technician_phone?: string | null;
  technician_contacts?: TechnicianContacts;
  owner_line_user_id?: string | null;
  billing_day?: number;
  meter_reminder_days_before?: number;
  reminder_soft_days?: number;
  reminder_firm_days?: number;
  reminder_final_days?: number;
  reminder_template_soft?: string | null;
  reminder_template_firm?: string | null;
  reminder_template_final?: string | null;
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
  title_prefix: string | null;
  move_in_date: string;
  pdpa_consented_at: string | null;
  invite_code: string | null;
}

export type InvoiceStatus = "pending" | "scanning" | "paid";

export type MeterKind = "water" | "electric";
export type MeterReadingSource = "move_in" | "billing" | "override";

export interface MeterReading {
  id: string;
  property_id: string;
  room_id: string;
  tenant_id: string | null;
  kind: MeterKind;
  reading_value: number;
  recorded_at: string;
  source: MeterReadingSource;
  billing_month: string | null;
  invoice_id: string | null;
  photo_media_id: string | null;
}

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
  owner_payment_proof_url: string | null;
  owner_payment_note: string | null;
  water_prev: number | null;
  water_curr: number | null;
  water_recorded_at: string | null;
  electric_prev: number | null;
  electric_curr: number | null;
  electric_recorded_at: string | null;
  water_rate_locked: number | null;
  electric_rate_locked: number | null;
}

export type MaintenanceTicketCategory = "ac" | "plumbing" | "electrical" | "other";
export type MaintenanceTicketStatus = "waiting" | "in_progress" | "done";

export interface MaintenanceTicket {
  id: string;
  property_id: string;
  room_id: string;
  tenant_id: string;
  category: MaintenanceTicketCategory;
  description: string;
  photo_url: string | null;
  status: MaintenanceTicketStatus;
  created_at: string;
  updated_at: string;
}

export type MaintenanceTicketRow = MaintenanceTicket & {
  room_number: string;
  tenant_name: string;
};
