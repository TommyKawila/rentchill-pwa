import { createAdminClient } from "@/services/supabase/admin";
import {
  calculateInvoiceAmounts,
  getCurrentBillingMonth,
} from "@/services/invoiceCalculator";
import type { InvoiceStatus } from "@/services/types";

export type MonthlyBillingRow = {
  tenant_id: string;
  tenant_name: string;
  room_id: string;
  room_number: string;
  base_rent_price: number;
  invoice_id: string | null;
  invoice_status: InvoiceStatus | null;
  water_unit: number;
  electric_unit: number;
};

export type BillingEntry = {
  tenant_id: string;
  water_unit: number;
  electric_unit: number;
};

async function getPropertyId(propertySlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบหอพัก");
  return data.id as string;
}

export async function getMonthlyBillingRows(propertySlug: string) {
  const propertyId = await getPropertyId(propertySlug);
  const billingMonth = getCurrentBillingMonth();
  const supabase = createAdminClient();

  const { data: tenants, error } = await supabase
    .from("tenants")
    .select(
      "id, name, room_id, rooms!inner(id, room_number, base_rent_price, status, property_id)",
    )
    .eq("rooms.property_id", propertyId)
    .eq("rooms.status", "occupied");

  if (error) throw error;

  const tenantIds = (tenants ?? []).map((row) => String(row.id));
  const invoicesByTenant = new Map<
    string,
    { id: string; status: InvoiceStatus; water_unit: number; electric_unit: number }
  >();

  if (tenantIds.length > 0) {
    const { data: invoices, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, tenant_id, status, water_unit, electric_unit")
      .eq("billing_month", billingMonth)
      .in("tenant_id", tenantIds);

    if (invoiceError) throw invoiceError;

    for (const invoice of invoices ?? []) {
      invoicesByTenant.set(String(invoice.tenant_id), {
        id: String(invoice.id),
        status: invoice.status as InvoiceStatus,
        water_unit: Number(invoice.water_unit),
        electric_unit: Number(invoice.electric_unit),
      });
    }
  }

  const rows: MonthlyBillingRow[] = (tenants ?? [])
    .map((row) => {
      const roomRaw = row.rooms as
        | { id: string; room_number: string; base_rent_price: number }
        | { id: string; room_number: string; base_rent_price: number }[];
      const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
      const invoice = invoicesByTenant.get(String(row.id));

      return {
        tenant_id: String(row.id),
        tenant_name: String(row.name),
        room_id: room.id,
        room_number: room.room_number,
        base_rent_price: Number(room.base_rent_price),
        invoice_id: invoice?.id ?? null,
        invoice_status: invoice?.status ?? null,
        water_unit: invoice?.water_unit ?? 0,
        electric_unit: invoice?.electric_unit ?? 0,
      };
    })
    .sort((a, b) => a.room_number.localeCompare(b.room_number, "th"));

  return { billingMonth, rows };
}

export async function generateMonthlyInvoices(
  propertySlug: string,
  entries: BillingEntry[],
) {
  const propertyId = await getPropertyId(propertySlug);
  const billingMonth = getCurrentBillingMonth();
  const supabase = createAdminClient();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (entry.water_unit < 0 || entry.electric_unit < 0) {
      throw new Error("หน่วยมิเตอร์ต้องไม่ติดลบ");
    }

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, room_id, rooms!inner(property_id, base_rent_price)")
      .eq("id", entry.tenant_id)
      .eq("rooms.property_id", propertyId)
      .maybeSingle();

    if (tenantError) throw tenantError;
    if (!tenant) continue;

    const roomRaw = tenant.rooms as { base_rent_price: number } | { base_rent_price: number }[];
    const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
    const baseRent = Number(room.base_rent_price);
    const amounts = calculateInvoiceAmounts(
      baseRent,
      entry.water_unit,
      entry.electric_unit,
    );

    const { data: existing, error: existingError } = await supabase
      .from("invoices")
      .select("id, status")
      .eq("tenant_id", entry.tenant_id)
      .eq("billing_month", billingMonth)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing?.status === "paid" || existing?.status === "scanning") {
      skipped++;
      continue;
    }

    if (existing) {
      const { error } = await supabase
        .from("invoices")
        .update({
          water_unit: entry.water_unit,
          electric_unit: entry.electric_unit,
          ...amounts,
        })
        .eq("id", existing.id);

      if (error) throw error;
      updated++;
      continue;
    }

    const { error } = await supabase.from("invoices").insert({
      property_id: propertyId,
      tenant_id: entry.tenant_id,
      room_id: tenant.room_id,
      billing_month: billingMonth,
      water_unit: entry.water_unit,
      electric_unit: entry.electric_unit,
      base_rent_amount: baseRent,
      ...amounts,
      status: "pending",
    });

    if (error) throw error;
    created++;
  }

  return { billingMonth, created, updated, skipped };
}
