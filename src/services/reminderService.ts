import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import { auditInvoiceRemind } from "@/services/auditLogService";
import { notifyPaymentReminder } from "@/services/notificationService";
import {
  DEFAULT_REMINDER_DAYS,
  canSendReminderTier,
  normalizeReminderDaySettings,
  resolveReminderState,
  type ReminderDaySettings,
  type ReminderTier,
} from "@/services/paymentReminderTier";
import {
  assertOwnerPropertyGated,
} from "@/services/planGateService";
import { getPropertyQuota } from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";

export type { ReminderTier } from "@/services/paymentReminderTier";

export type ReminderMessageTemplates = Record<ReminderTier, string | null>;

export type ReminderTarget = {
  invoice_id: string;
  tenant_id: string;
  tenant_name: string;
  property_name: string;
  room_id: string;
  room_number: string;
  total_amount: number;
  line_user_id: string;
  billing_month: string;
  issued_at: string | null;
  reminder_tier_sent: ReminderTier | null;
  recommended: ReminderTier | null;
  can_send: boolean;
  days_until_soft: number | null;
};

async function getPropertyReminderContext(propertySlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, owner_id, name, billing_day, reminder_soft_days, reminder_firm_days, reminder_final_days, reminder_template_soft, reminder_template_firm, reminder_template_final",
    )
    .eq("slug", propertySlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบหอพัก");

  const settings = normalizeReminderDaySettings({
    soft: Number(data.reminder_soft_days ?? DEFAULT_REMINDER_DAYS.soft),
    firm: Number(data.reminder_firm_days ?? DEFAULT_REMINDER_DAYS.firm),
    final: Number(data.reminder_final_days ?? DEFAULT_REMINDER_DAYS.final),
  });

  const templates: ReminderMessageTemplates = {
    soft: data.reminder_template_soft ? String(data.reminder_template_soft) : null,
    firm: data.reminder_template_firm ? String(data.reminder_template_firm) : null,
    final: data.reminder_template_final
      ? String(data.reminder_template_final)
      : null,
  };

  return {
    propertyId: String(data.id),
    ownerId: data.owner_id ? String(data.owner_id) : null,
    propertyName: String(data.name ?? propertySlug),
    billingDay: Number(data.billing_day ?? 1),
    settings,
    templates,
  };
}

function mapTierSent(value: unknown): ReminderTier | null {
  if (value === "soft" || value === "firm" || value === "final") return value;
  return null;
}

export async function getPendingReminderTargets(
  propertySlug: string,
): Promise<{ settings: ReminderDaySettings; targets: ReminderTarget[] }> {
  const billingMonth = getCurrentBillingMonth();
  const { propertyId, settings, propertyName, billingDay } =
    await getPropertyReminderContext(propertySlug);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, total_amount, tenant_id, room_id, issued_at, reminder_tier_sent, tenants!inner(id, name, line_user_id), rooms!inner(room_number)",
    )
    .eq("property_id", propertyId)
    .eq("billing_month", billingMonth)
    .eq("status", "pending");

  if (error) throw error;

  const targets = (data ?? [])
    .map((row) => {
      const tenantRaw = row.tenants as
        | { id: string; name: string; line_user_id: string | null }
        | { id: string; name: string; line_user_id: string | null }[];
      const roomRaw = row.rooms as { room_number: string } | { room_number: string }[];
      const tenant = Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw;
      const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
      if (!tenant?.line_user_id) return null;

      const tierSent = mapTierSent(row.reminder_tier_sent);
      const issuedAt = row.issued_at ? String(row.issued_at) : null;
      const state = resolveReminderState({
        billingMonth,
        billingDay,
        tierSent,
        settings,
      });

      return {
        invoice_id: String(row.id),
        tenant_id: String(tenant.id),
        tenant_name: String(tenant.name),
        property_name: propertyName,
        room_id: String(row.room_id),
        room_number: String(room.room_number),
        total_amount: Number(row.total_amount),
        line_user_id: String(tenant.line_user_id),
        billing_month: billingMonth,
        issued_at: issuedAt,
        reminder_tier_sent: tierSent,
        recommended: state.recommended,
        can_send: state.can_send,
        days_until_soft: state.days_until_soft,
      } satisfies ReminderTarget;
    })
    .filter((row): row is ReminderTarget => row !== null)
    .sort((a, b) => a.room_number.localeCompare(b.room_number, "th"));

  return { settings, targets };
}

export function countReminderTargetsByTier(targets: ReminderTarget[]) {
  const counts = { soft: 0, firm: 0, final: 0 };
  for (const target of targets) {
    if (!target.can_send || !target.recommended) continue;
    counts[target.recommended]++;
  }
  return counts;
}

export async function sendPaymentReminder(
  propertySlug: string,
  tenantId: string,
  tier?: ReminderTier,
  ownerId?: string,
) {
  const billingMonth = getCurrentBillingMonth();
  const { propertyId, ownerId: ctxOwnerId, templates, propertyName } =
    await getPropertyReminderContext(propertySlug);

  if (ownerId ?? ctxOwnerId) {
    await assertOwnerPropertyGated(
      ownerId ?? String(ctxOwnerId),
      propertySlug,
    );
  }
  const { targets } = await getPendingReminderTargets(propertySlug);
  const target = targets.find((row) => row.tenant_id === tenantId);

  if (!target) {
    throw new Error("ไม่พบบิลรอชำระสำหรับลูกบ้านนี้");
  }

  const sendTier = tier ?? target.recommended;
  if (!sendTier) {
    throw new Error(
      target.days_until_soft != null
        ? `ทวงได้ในอีก ${target.days_until_soft} วัน`
        : "ยังไม่ถึงกำหนดทวงบิล",
    );
  }

  if (tier && tier !== target.recommended) {
    throw new Error("โทนทวงไม่ตรงกับที่ระบบแนะนำตอนนี้");
  }

  if (!canSendReminderTier(sendTier, target.reminder_tier_sent)) {
    throw new Error("ส่งทวงระดับนี้ไปแล้ว");
  }

  await notifyPaymentReminder({
    propertySlug,
    lineUserId: target.line_user_id,
    tenantName: target.tenant_name,
    propertyName: target.property_name || propertyName,
    roomNumber: target.room_number,
    billingMonth,
    totalAmount: target.total_amount,
    tier: sendTier,
    customTemplate: templates[sendTier],
  });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("invoices")
    .update({
      reminder_tier_sent: sendTier,
      reminder_sent_at: new Date().toISOString(),
    })
    .eq("id", target.invoice_id);

  if (error) {
    console.error("[reminderService.sendPaymentReminder]", {
      invoiceId: target.invoice_id,
      tier: sendTier,
    }, error);
    throw error;
  }

  if (ctxOwnerId) {
    await auditInvoiceRemind({
      propertyId,
      roomId: target.room_id,
      tenantId: target.tenant_id,
      ownerId: ownerId ?? String(ctxOwnerId),
      invoiceId: target.invoice_id,
      billingMonth,
      totalAmount: target.total_amount,
      tier: sendTier,
    });
  }

  const quota = await getPropertyQuota(propertySlug);
  return {
    sent: true as const,
    tenant_name: target.tenant_name,
    tier: sendTier,
    quota,
  };
}

export async function sendPaymentReminderBulk(
  propertySlug: string,
  tier: ReminderTier,
  ownerId?: string,
) {
  const { ownerId: ctxOwnerId } = await getPropertyReminderContext(propertySlug);
  const resolvedOwnerId = ownerId ?? ctxOwnerId;
  if (resolvedOwnerId) {
    await assertOwnerPropertyGated(String(resolvedOwnerId), propertySlug);
  }

  const { targets } = await getPendingReminderTargets(propertySlug);
  const eligible = targets.filter(
    (row) => row.can_send && row.recommended === tier,
  );

  let sent = 0;
  const errors: string[] = [];

  for (const target of eligible) {
    try {
      await sendPaymentReminder(
        propertySlug,
        target.tenant_id,
        tier,
        ownerId ?? (resolvedOwnerId ? String(resolvedOwnerId) : undefined),
      );
      sent++;
    } catch (error) {
      if (error instanceof Error && error.message === "QUOTA_EXCEEDED") {
        throw error;
      }
      console.error("[reminderService.sendPaymentReminderBulk]", {
        tenantId: target.tenant_id,
        tier,
      }, error);
      errors.push(target.room_number);
    }
  }

  const quota = await getPropertyQuota(propertySlug);
  return {
    sent,
    skipped: eligible.length - sent,
    failed_rooms: errors,
    quota,
  };
}

export type { ReminderDaySettings };
