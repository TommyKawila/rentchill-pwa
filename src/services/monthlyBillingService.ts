import { createAdminClient } from "@/services/supabase/admin";
import {
  calculateInvoiceAmounts,
  getCurrentBillingMonth,
} from "@/services/invoiceCalculator";
import { safeNotifyBillIssued } from "@/services/notificationService";
import type { PropertyBillingSettings } from "@/services/propertyBillingSettingsService";
import { buildTenantInviteUrl } from "@/services/tenantLinkService";
import type { InvoiceStatus } from "@/services/types";

export type MonthlyBillingRow = {
  tenant_id: string;
  tenant_name: string;
  room_id: string;
  room_number: string;
  base_rent_price: number;
  invoice_id: string | null;
  invoice_status: InvoiceStatus | null;
  water_unit: number | null;
  electric_unit: number | null;
  invite_code: string;
  line_linked: boolean;
  invite_url: string;
};

export type BillingEntry = {
  tenant_id: string;
  water_unit: number;
  electric_unit: number;
};

async function getPropertyContext(propertySlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, billing_day, meter_reminder_days_before, include_utilities, water_rate_per_unit, electric_rate_per_unit",
    )
    .eq("slug", propertySlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบหอพัก");

  const settings: PropertyBillingSettings = {
    billing_day: Number(data.billing_day ?? 1),
    meter_reminder_days_before: Number(data.meter_reminder_days_before ?? 3),
    include_utilities: data.include_utilities !== false,
    water_rate_per_unit: Number(data.water_rate_per_unit ?? 10),
    electric_rate_per_unit: Number(data.electric_rate_per_unit ?? 7),
  };

  return { propertyId: String(data.id), settings };
}

export async function getMonthlyBillingRows(propertySlug: string) {
  const { propertyId, settings } = await getPropertyContext(propertySlug);
  const billingMonth = getCurrentBillingMonth();
  const supabase = createAdminClient();

  const { data: tenants, error } = await supabase
    .from("tenants")
    .select(
      "id, name, room_id, line_user_id, invite_code, rooms!inner(id, room_number, base_rent_price, status, property_id)",
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
        water_unit: invoice ? invoice.water_unit : null,
        electric_unit: invoice ? invoice.electric_unit : null,
        invite_code: String(row.invite_code ?? ""),
        line_linked: Boolean(row.line_user_id),
        invite_url: row.invite_code
          ? buildTenantInviteUrl(String(row.invite_code))
          : "",
      };
    })
    .sort((a, b) => a.room_number.localeCompare(b.room_number, "th"));

  return { billingMonth, rows, settings };
}

export async function generateMonthlyInvoices(
  propertySlug: string,
  entries: BillingEntry[],
) {
  const { propertyId, settings } = await getPropertyContext(propertySlug);
  const billingMonth = getCurrentBillingMonth();
  const supabase = createAdminClient();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const entry of entries) {
    const waterUnit = settings.include_utilities ? entry.water_unit : 0;
    const electricUnit = settings.include_utilities ? entry.electric_unit : 0;

    if (settings.include_utilities) {
      if (
        entry.water_unit === undefined ||
        entry.electric_unit === undefined ||
        entry.water_unit < 0 ||
        entry.electric_unit < 0 ||
        Number.isNaN(entry.water_unit) ||
        Number.isNaN(entry.electric_unit)
      ) {
        const error = new Error("METER_REQUIRED");
        throw error;
      }
    }

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, line_user_id, room_id, rooms!inner(property_id, base_rent_price, room_number)")
      .eq("id", entry.tenant_id)
      .eq("rooms.property_id", propertyId)
      .maybeSingle();

    if (tenantError) throw tenantError;
    if (!tenant) continue;

    const roomRaw = tenant.rooms as
      | { base_rent_price: number; room_number: string }
      | { base_rent_price: number; room_number: string }[];
    const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
    const baseRent = Number(room.base_rent_price);
    const amounts = calculateInvoiceAmounts(
      baseRent,
      waterUnit,
      electricUnit,
      settings.water_rate_per_unit,
      settings.electric_rate_per_unit,
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
          water_unit: waterUnit,
          electric_unit: electricUnit,
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
      water_unit: waterUnit,
      electric_unit: electricUnit,
      base_rent_amount: baseRent,
      ...amounts,
      status: "pending",
    });

    if (error) throw error;
    created++;
    void notifyBillIssued({
      propertySlug,
      lineUserId: tenant.line_user_id ? String(tenant.line_user_id) : null,
      roomNumber: room.room_number,
      billingMonth,
      totalAmount: amounts.total_amount,
    });
  }

  return { billingMonth, created, updated, skipped };
}

async function notifyBillIssued(input: {
  propertySlug: string;
  lineUserId: string | null;
  roomNumber: string;
  billingMonth: string;
  totalAmount: number;
}) {
  if (!input.lineUserId) return;
  await safeNotifyBillIssued({
    propertySlug: input.propertySlug,
    lineUserId: input.lineUserId,
    roomNumber: input.roomNumber,
    billingMonth: input.billingMonth,
    totalAmount: input.totalAmount,
  });
}
