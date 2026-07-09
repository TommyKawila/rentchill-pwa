import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import {
  pushLineMessages,
  type LineTextMessage,
} from "@/services/line/pushMessageService";
import type { PlanTier } from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";

export type LinePushType =
  | "bill_issued"
  | "bill_reissued"
  | "payment_reminder"
  | "slip_rejected"
  | "owner_slip_submitted"
  | "payment_confirmed"
  | "subscription_grace"
  | "webhook_fallback";

export type LineLogType = LinePushType;

export const LINE_PUSH_LIMITS: Record<PlanTier, number> = {
  starter: 12,
  micro: 80,
  growth: 200,
  pro: 400,
};

const OWNER_GRACE_LIMIT = 7;
const WEBHOOK_PUSH_LIMIT = Number(process.env.LINE_WEBHOOK_PUSH_LIMIT ?? 50);

const CHARGED_TYPES = new Set<LinePushType>([
  "bill_reissued",
  "payment_reminder",
  "slip_rejected",
  "owner_slip_submitted",
]);

export function getLinePushLimit(tier: PlanTier) {
  return LINE_PUSH_LIMITS[tier];
}

export function isChargedLinePush(type: LinePushType) {
  return CHARGED_TYPES.has(type);
}

function monthStartIso() {
  const month = getCurrentBillingMonth();
  return `${month}-01T00:00:00.000Z`;
}

async function getPropertyRow(propertySlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, owner_id, plan_tier, quota_month, line_push_used_this_month",
    )
    .eq("slug", propertySlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบหอพัก");
  return data;
}

async function resetPropertyQuotaIfNewMonth(
  propertyId: string,
  quotaMonth: string | null,
  currentMonth: string,
) {
  if (quotaMonth === currentMonth) return;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("properties")
    .update({
      quota_month: currentMonth,
      reminder_used_this_month: 0,
      csv_used_this_month: 0,
      line_push_used_this_month: 0,
    })
    .eq("id", propertyId);

  if (error) throw error;
}

async function logLinePush(input: {
  propertyId?: string | null;
  ownerId?: string | null;
  messageType: LineLogType;
  lineUserId: string;
  charged: boolean;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("line_push_log").insert({
    property_id: input.propertyId ?? null,
    owner_id: input.ownerId ?? null,
    message_type: input.messageType,
    line_user_id: input.lineUserId,
    charged: input.charged,
  });

  if (error) console.error("[linePushLog]", error);
}

async function countOwnerGracePushes(ownerId: string) {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("line_push_log")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .eq("message_type", "subscription_grace")
    .gte("created_at", monthStartIso());

  if (error) throw error;
  return count ?? 0;
}

async function assertPropertyPushQuota(propertySlug: string) {
  const currentMonth = getCurrentBillingMonth();
  const row = await getPropertyRow(propertySlug);
  await resetPropertyQuotaIfNewMonth(
    String(row.id),
    row.quota_month ? String(row.quota_month) : null,
    currentMonth,
  );

  const refreshed = await getPropertyRow(propertySlug);
  const tier = String(refreshed.plan_tier) as PlanTier;
  const limit = getLinePushLimit(tier);
  const used = Number(refreshed.line_push_used_this_month);

  if (used >= limit) {
    throw new Error("QUOTA_EXCEEDED");
  }

  return {
    propertyId: String(refreshed.id),
    ownerId: refreshed.owner_id ? String(refreshed.owner_id) : null,
  };
}

async function consumePropertyPushQuota(propertyId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("line_push_used_this_month")
    .eq("id", propertyId)
    .maybeSingle();

  if (error || !data) throw error ?? new Error("ไม่พบหอพัก");

  const { error: updateError } = await supabase
    .from("properties")
    .update({
      line_push_used_this_month: Number(data.line_push_used_this_month) + 1,
    })
    .eq("id", propertyId);

  if (updateError) throw updateError;
}

async function assertOwnerGraceQuota(ownerId: string) {
  const used = await countOwnerGracePushes(ownerId);
  if (used >= OWNER_GRACE_LIMIT) {
    throw new Error("OWNER_GRACE_QUOTA_EXCEEDED");
  }
}

export async function pushWithQuota(input: {
  type: LinePushType;
  lineUserId: string;
  messages: LineTextMessage[];
  propertySlug?: string;
  propertyId?: string;
  ownerId?: string;
}) {
  if (!input.lineUserId) {
    return { sent: false as const, reason: "no_recipient" as const };
  }

  let propertyId = input.propertyId ?? null;
  let ownerId = input.ownerId ?? null;
  let charged = false;

  if (input.type === "subscription_grace") {
    if (!ownerId) {
      return { sent: false as const, reason: "no_owner" as const };
    }
    await assertOwnerGraceQuota(ownerId);
    charged = true;
  } else if (isChargedLinePush(input.type)) {
    if (!input.propertySlug) {
      throw new Error("propertySlug required for charged push");
    }
    const ctx = await assertPropertyPushQuota(input.propertySlug);
    propertyId = ctx.propertyId;
    ownerId = ownerId ?? ctx.ownerId;
    await consumePropertyPushQuota(propertyId);
    charged = true;
  } else if (input.propertySlug) {
    const row = await getPropertyRow(input.propertySlug);
    propertyId = String(row.id);
    ownerId = row.owner_id ? String(row.owner_id) : ownerId;
  }

  const result = await pushLineMessages(input.lineUserId, input.messages);

  if (result.sent) {
    await logLinePush({
      propertyId,
      ownerId,
      messageType: input.type,
      lineUserId: input.lineUserId,
      charged,
    });
  }

  return result;
}

async function countWebhookFallbackPushes() {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("line_push_log")
    .select("id", { count: "exact", head: true })
    .eq("message_type", "webhook_fallback")
    .gte("created_at", monthStartIso());

  if (error) throw error;
  return count ?? 0;
}

export async function pushPlatformFallback(input: {
  lineUserId: string;
  messages: LineTextMessage[];
}) {
  if (!input.lineUserId) {
    return { sent: false as const, reason: "no_recipient" as const };
  }

  const used = await countWebhookFallbackPushes();
  if (used >= WEBHOOK_PUSH_LIMIT) {
    console.warn("[pushPlatformFallback] monthly limit reached", used);
    return { sent: false as const, reason: "platform_limit" as const };
  }

  const result = await pushLineMessages(input.lineUserId, input.messages);

  if (result.sent) {
    await logLinePush({
      messageType: "webhook_fallback",
      lineUserId: input.lineUserId,
      charged: false,
    });
  }

  return result;
}

export async function getLinePushDailyStats() {
  const supabase = createAdminClient();
  const monthStart = monthStartIso();

  const { data, error } = await supabase
    .from("line_push_log")
    .select("created_at, charged")
    .gte("created_at", monthStart)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const byDate = new Map<string, { total: number; charged: number }>();

  for (const row of data ?? []) {
    const date = String(row.created_at).slice(0, 10);
    const current = byDate.get(date) ?? { total: 0, charged: 0 };
    current.total += 1;
    if (row.charged) current.charged += 1;
    byDate.set(date, current);
  }

  return [...byDate.entries()].map(([date, counts]) => ({
    date,
    total: counts.total,
    charged: counts.charged,
  }));
}

export async function getLinePushByType() {
  const supabase = createAdminClient();
  const monthStart = monthStartIso();

  const { data, error } = await supabase
    .from("line_push_log")
    .select("message_type")
    .gte("created_at", monthStart);

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const type = String(row.message_type);
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([message_type, count]) => ({ message_type, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getLinePushStatsForMonth() {
  const supabase = createAdminClient();
  const monthStart = monthStartIso();

  const { count: totalPushes, error: totalError } = await supabase
    .from("line_push_log")
    .select("id", { count: "exact", head: true })
    .gte("created_at", monthStart);

  if (totalError) throw totalError;

  const { count: chargedPushes, error: chargedError } = await supabase
    .from("line_push_log")
    .select("id", { count: "exact", head: true })
    .eq("charged", true)
    .gte("created_at", monthStart);

  if (chargedError) throw chargedError;

  const { data: topRows, error: topError } = await supabase
    .from("line_push_log")
    .select("property_id, properties(name, slug)")
    .eq("charged", true)
    .gte("created_at", monthStart)
    .not("property_id", "is", null);

  if (topError) throw topError;

  const usageByProperty = new Map<
    string,
    { name: string; slug: string; count: number }
  >();

  for (const row of topRows ?? []) {
    const propertyId = String(row.property_id);
    const propertyRaw = row.properties as
      | { name: string; slug: string }
      | { name: string; slug: string }[]
      | null;
    const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;
    if (!property) continue;

    const current = usageByProperty.get(propertyId) ?? {
      name: property.name,
      slug: property.slug,
      count: 0,
    };
    current.count += 1;
    usageByProperty.set(propertyId, current);
  }

  const topProperties = [...usageByProperty.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total_pushes: totalPushes ?? 0,
    charged_pushes: chargedPushes ?? 0,
    top_properties: topProperties,
  };
}
