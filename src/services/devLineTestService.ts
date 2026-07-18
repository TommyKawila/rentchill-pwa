import { assertDevToolsEnabled } from "@/services/devToolsGuard";
import { buildReminderFlexMessage } from "@/services/line/reminderFlexMessage";
import { formatBillingMonthForReminder } from "@/services/paymentReminderMessageService";
import {
  getLinePushMode,
  getLineTestRecipientId,
} from "@/services/line/linePushMode";
import type { LinePushType } from "@/services/linePushQuotaService";
import { pushWithQuota } from "@/services/linePushQuotaService";
import { createAdminClient } from "@/services/supabase/admin";

const SAMPLE = {
  propertySlug: "demo-property",
  roomNumber: "222",
  tenantName: "Tenant 222",
  billingMonth: "2026-07",
  totalAmount: 5350,
  note: "สลิปไม่ชัด",
};

function buildPreviewText(type: LinePushType): string {
  const s = SAMPLE;
  switch (type) {
    case "bill_issued":
    case "bill_reissued":
      return [
        `🏠 RentChill — บิลค่าเช่า ${s.billingMonth}`,
        `ห้อง ${s.roomNumber} · ยอดรวม ฿${s.totalAmount.toLocaleString("th-TH")}`,
        "",
        "เปิดบิล / View bill:",
        "/board",
      ].join("\n");
    case "payment_reminder":
      return [
        `⚠️ แจ้งเตือนชำระค่าเช่า — ${s.billingMonth}`,
        `ห้อง ${s.roomNumber} · ยอด ฿${s.totalAmount.toLocaleString("th-TH")}`,
        "กรุณาชำระโดยเร็วที่สุด",
      ].join("\n");
    case "slip_rejected":
      return ["❌ สลิปไม่ผ่านการตรวจสอบ", s.note].join("\n");
    case "payment_confirmed":
      return [
        `✅ ชำระเงินสำเร็จ — ${s.billingMonth}`,
        `ห้อง ${s.roomNumber} · ฿${s.totalAmount.toLocaleString("th-TH")}`,
      ].join("\n");
    case "owner_slip_submitted":
      return [
        "📩 ลูกบ้านส่งสลิปแล้ว — รอตรวจสอบ",
        `ห้อง ${s.roomNumber} · ${s.tenantName}`,
      ].join("\n");
    case "maintenance_reported":
      return [
        "🔧 ลูกบ้านแจ้งซ่อมใหม่",
        `ห้อง ${s.roomNumber} · ${s.tenantName}`,
        "หมวด: แอร์เสีย",
      ].join("\n");
    case "subscription_grace":
      return ["แผน micro หมดอายุแล้ว", "คุณยังใช้งานได้อีก 7 วัน"].join("\n");
    default:
      return "RentChill test message";
  }
}

export function getLineTestPreview(type: LinePushType) {
  return { type, text: buildPreviewText(type) };
}

export async function getLineModeStatus() {
  assertDevToolsEnabled();
  return {
    mode: getLinePushMode(),
    test_recipient_id: getLineTestRecipientId(),
  };
}

export async function getRecentLinePushLogs(limit = 20) {
  assertDevToolsEnabled();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("line_push_log")
    .select(
      "id, message_type, line_user_id, charged, created_at, property_id, properties(slug, name)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const propertyRaw = row.properties as
      | { slug: string; name: string }
      | { slug: string; name: string }[]
      | null;
    const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;
    const lineUserId = String(row.line_user_id);
    return {
      id: String(row.id),
      message_type: String(row.message_type),
      line_user_id: lineUserId,
      charged: Boolean(row.charged),
      simulated: lineUserId.startsWith("dry:"),
      created_at: String(row.created_at),
      property_slug: property?.slug ?? null,
      property_name: property?.name ?? null,
    };
  });
}

export async function sendTestLinePush(input: {
  line_user_id: string;
  message_type: LinePushType;
  property_slug?: string;
}) {
  assertDevToolsEnabled();

  const lineUserId = input.line_user_id.trim();
  if (!lineUserId) throw new Error("LINE_USER_ID_REQUIRED");

  const text = buildPreviewText(input.message_type);
  const propertySlug = input.property_slug?.trim() || SAMPLE.propertySlug;

  const messages =
    input.message_type === "payment_reminder"
      ? [
          buildReminderFlexMessage({
            tier: "firm",
            tenantName: SAMPLE.tenantName,
            propertyName: "Demo Property",
            roomNumber: SAMPLE.roomNumber,
            billingMonthLabel: formatBillingMonthForReminder(SAMPLE.billingMonth),
            totalAmount: SAMPLE.totalAmount,
          }),
        ]
      : [{ type: "text" as const, text }];

  let ownerId: string | undefined;
  if (input.message_type === "subscription_grace") {
    const supabase = createAdminClient();
    const { data: property } = await supabase
      .from("properties")
      .select("owner_id")
      .eq("slug", propertySlug)
      .maybeSingle();
    ownerId = property?.owner_id ? String(property.owner_id) : undefined;
  }

  return pushWithQuota({
    type: input.message_type,
    lineUserId,
    propertySlug:
      input.message_type === "subscription_grace" ? undefined : propertySlug,
    ownerId,
    messages,
  });
}

export const LINE_TEST_TYPES: LinePushType[] = [
  "bill_issued",
  "bill_reissued",
  "payment_reminder",
  "slip_rejected",
  "payment_confirmed",
  "owner_slip_submitted",
  "maintenance_reported",
  "subscription_grace",
];
