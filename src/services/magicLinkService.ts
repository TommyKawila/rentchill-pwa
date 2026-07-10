import { randomBytes } from "crypto";
import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import { shareLinkExpiresMs } from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";
import type { InvoiceStatus } from "@/services/types";

export type ShareInvoiceRow = {
  room_number: string;
  tenant_name: string;
  total_amount: number;
  status: InvoiceStatus;
};

export type ShareViewData = {
  property_name: string;
  property_slug: string;
  billing_month: string;
  expires_at: string | null;
  is_expired: boolean;
  rows: ShareInvoiceRow[];
};

function shareBaseUrl(origin?: string) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return origin?.replace(/\/$/, "") || fromEnv;
}

function buildShareUrl(token: string, origin?: string) {
  const base = shareBaseUrl(origin);
  const path = `/share/${token}`;
  return base ? `${base}${path}` : path;
}

function newShareToken() {
  return randomBytes(24).toString("hex");
}

async function getPropertyBySlug(propertySlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, name, slug, plan_tier, share_token, share_expires_at")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบหอพัก");
  return data;
}

export async function createPropertyShareLink(
  propertySlug: string,
  origin?: string,
) {
  const property = await getPropertyBySlug(propertySlug);
  const tier = String(property.plan_tier) as PlanTier;
  const token = newShareToken();
  const ttlMs = shareLinkExpiresMs(tier);
  const expiresAt =
    ttlMs === null ? null : new Date(Date.now() + ttlMs).toISOString();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("properties")
    .update({
      share_token: token,
      share_expires_at: expiresAt,
    })
    .eq("id", property.id);

  if (error) throw error;

  return {
    url: buildShareUrl(token, origin),
    expires_at: expiresAt,
    is_permanent: expiresAt === null,
  };
}

export async function getPropertyShareLink(
  propertySlug: string,
  origin?: string,
) {
  const property = await getPropertyBySlug(propertySlug);
  if (!property.share_token) return null;

  const expiresAt = property.share_expires_at
    ? String(property.share_expires_at)
    : null;
  const isExpired =
    expiresAt !== null && new Date(expiresAt).getTime() <= Date.now();

  return {
    url: buildShareUrl(String(property.share_token), origin),
    expires_at: expiresAt,
    is_permanent: expiresAt === null,
    is_expired: isExpired,
  };
}

export async function getShareViewByToken(token: string): Promise<ShareViewData | null> {
  const supabase = createAdminClient();
  const { data: property, error } = await supabase
    .from("properties")
    .select("id, name, slug, share_expires_at")
    .eq("share_token", token)
    .maybeSingle();

  if (error) throw error;
  if (!property) return null;

  const expiresAt = property.share_expires_at
    ? String(property.share_expires_at)
    : null;
  const isExpired =
    expiresAt !== null && new Date(expiresAt).getTime() <= Date.now();

  const billingMonth = getCurrentBillingMonth();
  let rows: ShareInvoiceRow[] = [];

  if (!isExpired) {
    const { data: invoices, error: invoiceError } = await supabase
      .from("invoices")
      .select("total_amount, status, tenants(name), rooms(room_number)")
      .eq("property_id", property.id)
      .eq("billing_month", billingMonth);

    if (invoiceError) throw invoiceError;

    rows = (invoices ?? [])
      .map((row) => {
        const tenantRaw = row.tenants as { name: string } | { name: string }[] | null;
        const roomRaw = row.rooms as { room_number: string } | { room_number: string }[] | null;
        const tenant = Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw;
        const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;

        return {
          room_number: room?.room_number ?? "-",
          tenant_name: tenant?.name ?? "-",
          total_amount: Number(row.total_amount),
          status: row.status as InvoiceStatus,
        };
      })
      .sort((a, b) => a.room_number.localeCompare(b.room_number, "th"));
  }

  return {
    property_name: String(property.name),
    property_slug: String(property.slug),
    billing_month: billingMonth,
    expires_at: expiresAt,
    is_expired: isExpired,
    rows,
  };
}
