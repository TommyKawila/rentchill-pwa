export interface Property {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

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
}
