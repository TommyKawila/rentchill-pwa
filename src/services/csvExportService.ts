import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import {
  consumeCsvQuota,
  getPropertyQuota,
} from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";
import type { InvoiceStatus } from "@/services/types";

export type CsvExportRow = {
  billing_month: string;
  room_number: string;
  tenant_name: string;
  base_rent_amount: number;
  water_unit: number;
  electric_unit: number;
  water_amount: number;
  electric_amount: number;
  total_amount: number;
  status: InvoiceStatus;
};

const CSV_HEADERS = [
  "billing_month",
  "room_number",
  "tenant_name",
  "base_rent_amount",
  "water_unit",
  "electric_unit",
  "water_amount",
  "electric_amount",
  "total_amount",
  "status",
] as const;

function csvCell(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function buildCsv(rows: CsvExportRow[]) {
  const lines = [
    CSV_HEADERS.join(","),
    ...rows.map((row) =>
      [
        row.billing_month,
        row.room_number,
        row.tenant_name,
        row.base_rent_amount,
        row.water_unit,
        row.electric_unit,
        row.water_amount,
        row.electric_amount,
        row.total_amount,
        row.status,
      ]
        .map(csvCell)
        .join(","),
    ),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

async function getExportRows(propertySlug: string, billingMonth: string) {
  const supabase = createAdminClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, name")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property) throw new Error("ไม่พบหอพัก");

  const { data, error } = await supabase
    .from("invoices")
    .select(
      "billing_month, base_rent_amount, water_unit, electric_unit, water_amount, electric_amount, total_amount, status, tenants(name), rooms(room_number)",
    )
    .eq("property_id", property.id)
    .eq("billing_month", billingMonth);

  if (error) throw error;

  const rows = (data ?? []).map((row) => {
    const tenantRaw = row.tenants as { name: string } | { name: string }[] | null;
    const roomRaw = row.rooms as { room_number: string } | { room_number: string }[] | null;
    const tenant = Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw;
    const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;

    return {
      billing_month: String(row.billing_month),
      room_number: room?.room_number ?? "-",
      tenant_name: tenant?.name ?? "-",
      base_rent_amount: Number(row.base_rent_amount),
      water_unit: Number(row.water_unit),
      electric_unit: Number(row.electric_unit),
      water_amount: Number(row.water_amount),
      electric_amount: Number(row.electric_amount),
      total_amount: Number(row.total_amount),
      status: row.status as InvoiceStatus,
    } satisfies CsvExportRow;
  });

  return {
    propertyName: String(property.name),
    rows: rows.sort((a, b) => a.room_number.localeCompare(b.room_number, "th")),
  };
}

export async function exportPropertyCsv(propertySlug: string) {
  const billingMonth = getCurrentBillingMonth();
  const { propertyName, rows } = await getExportRows(propertySlug, billingMonth);

  if (rows.length === 0) {
    throw new Error("NO_DATA");
  }

  await consumeCsvQuota(propertySlug);

  const quota = await getPropertyQuota(propertySlug);
  const csv = buildCsv(rows);
  const filename = `rentchill-${propertySlug}-${billingMonth}.csv`;

  return { csv, filename, billingMonth, propertyName, rowCount: rows.length, quota };
}
