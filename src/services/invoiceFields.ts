export const INVOICE_SELECT =
  "id, property_id, tenant_id, room_id, billing_month, water_unit, electric_unit, base_rent_amount, water_amount, electric_amount, total_amount, status, slip_image_url, slip_rejection_note, owner_payment_proof_url, owner_payment_note, water_prev, water_curr, water_recorded_at, electric_prev, electric_curr, electric_recorded_at, water_rate_locked, electric_rate_locked";

export function mapInvoiceRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    property_id: String(row.property_id),
    tenant_id: String(row.tenant_id),
    room_id: String(row.room_id),
    billing_month: String(row.billing_month),
    water_unit: Number(row.water_unit),
    electric_unit: Number(row.electric_unit),
    base_rent_amount: Number(row.base_rent_amount),
    water_amount: Number(row.water_amount),
    electric_amount: Number(row.electric_amount),
    total_amount: Number(row.total_amount),
    status: row.status as import("@/services/types").InvoiceStatus,
    slip_image_url: row.slip_image_url ? String(row.slip_image_url) : null,
    slip_rejection_note: row.slip_rejection_note
      ? String(row.slip_rejection_note)
      : null,
    owner_payment_proof_url: row.owner_payment_proof_url
      ? String(row.owner_payment_proof_url)
      : null,
    owner_payment_note: row.owner_payment_note
      ? String(row.owner_payment_note)
      : null,
    water_prev: row.water_prev != null ? Number(row.water_prev) : null,
    water_curr: row.water_curr != null ? Number(row.water_curr) : null,
    water_recorded_at: row.water_recorded_at
      ? String(row.water_recorded_at)
      : null,
    electric_prev: row.electric_prev != null ? Number(row.electric_prev) : null,
    electric_curr: row.electric_curr != null ? Number(row.electric_curr) : null,
    electric_recorded_at: row.electric_recorded_at
      ? String(row.electric_recorded_at)
      : null,
    water_rate_locked:
      row.water_rate_locked != null ? Number(row.water_rate_locked) : null,
    electric_rate_locked:
      row.electric_rate_locked != null ? Number(row.electric_rate_locked) : null,
  };
}
