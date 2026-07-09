import { buildBoardLiffUrl } from "@/services/line/liffUrls";
import { pushLineMessages } from "@/services/line/pushMessageService";
import { createAdminClient } from "@/services/supabase/admin";

function formatAmount(amount: number) {
  return amount.toLocaleString("th-TH");
}

function boardUrl() {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (liffId) return buildBoardLiffUrl(liffId);
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return base ? `${base}/board` : "/board";
}

export async function notifyBillIssued(input: {
  lineUserId: string;
  roomNumber: string;
  billingMonth: string;
  totalAmount: number;
}) {
  const total = formatAmount(input.totalAmount);
  const text = [
    `🏠 RentChill — บิลค่าเช่า ${input.billingMonth}`,
    `ห้อง ${input.roomNumber} · ยอดรวม ฿${total}`,
    "",
    `RentChill — Rent bill ${input.billingMonth}`,
    `Room ${input.roomNumber} · Total ฿${total}`,
    "",
    "เปิดบิล / View bill:",
    boardUrl(),
  ].join("\n");

  return pushLineMessages(input.lineUserId, [{ type: "text", text }]);
}

export async function notifySlipRejected(input: {
  lineUserId: string;
  roomNumber: string;
  billingMonth: string;
  note: string;
}) {
  const text = [
    "❌ สลิปไม่ผ่านการตรวจสอบ",
    input.note,
    "",
    "Slip verification failed",
    input.note,
    "",
    "ส่งใหม่ / Resubmit:",
    boardUrl(),
  ].join("\n");

  return pushLineMessages(input.lineUserId, [{ type: "text", text }]);
}

export async function notifyPaymentReminder(input: {
  lineUserId: string;
  roomNumber: string;
  billingMonth: string;
  totalAmount: number;
}) {
  const total = formatAmount(input.totalAmount);
  const text = [
    `⚠️ แจ้งเตือนชำระค่าเช่า — ${input.billingMonth}`,
    `ห้อง ${input.roomNumber} · ยอด ฿${total}`,
    "กรุณาชำระโดยเร็วที่สุด",
    "",
    `Payment reminder — ${input.billingMonth}`,
    `Room ${input.roomNumber} · ฿${total}`,
    "Please pay as soon as possible.",
    "",
    "เปิดบิล / View bill:",
    boardUrl(),
  ].join("\n");

  return pushLineMessages(input.lineUserId, [{ type: "text", text }]);
}

function billingUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return base ? `${base}/billing` : "/billing";
}

export async function notifySubscriptionGrace(input: {
  lineUserId: string;
  planTier: string;
  graceDaysRemaining: number;
  billingUrl?: string;
}) {
  const renewUrl = input.billingUrl ?? billingUrl();
  const text = [
    `แผน ${input.planTier} หมดอายุแล้ว`,
    `คุณยังใช้งานได้อีก ${input.graceDaysRemaining} วัน — ต่ออายุเพื่อไม่ให้โควต้าห้องลดลง`,
    "",
    `Your ${input.planTier} plan has expired`,
    `You can still use it for ${input.graceDaysRemaining} more day(s) — renew to keep your room quota`,
    "",
    "ต่ออายุ / Renew:",
    renewUrl,
  ].join("\n");

  return pushLineMessages(input.lineUserId, [{ type: "text", text }]);
}

export async function safeNotifySubscriptionGrace(
  input: Parameters<typeof notifySubscriptionGrace>[0],
) {
  try {
    await notifySubscriptionGrace(input);
    return { sent: true as const };
  } catch (error) {
    console.error("[notifySubscriptionGrace]", error);
    return { sent: false as const, reason: "error" as const };
  }
}

export async function notifyPaymentConfirmed(input: {
  lineUserId: string;
  roomNumber: string;
  billingMonth: string;
  totalAmount: number;
}) {
  const total = formatAmount(input.totalAmount);
  const text = [
    `✅ ชำระเงินสำเร็จ — ${input.billingMonth}`,
    `ห้อง ${input.roomNumber} · ฿${total}`,
    "บิลนี้ชำระแล้ว ขอบคุณค่ะ",
    "",
    `Payment confirmed — ${input.billingMonth}`,
    `Room ${input.roomNumber} · ฿${total}`,
    "This bill is paid. Thank you!",
    "",
    "เปิดบิล / View bill:",
    boardUrl(),
  ].join("\n");

  return pushLineMessages(input.lineUserId, [{ type: "text", text }]);
}

function dashboardUrl(propertySlug: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const path = `/dashboard?property=${encodeURIComponent(propertySlug)}`;
  return base ? `${base}${path}` : path;
}

export async function notifyOwnerSlipSubmitted(input: {
  lineUserId: string;
  tenantName: string;
  roomNumber: string;
  billingMonth: string;
  totalAmount: number;
  propertySlug: string;
}) {
  const total = formatAmount(input.totalAmount);
  const text = [
    "📩 ลูกบ้านส่งสลิปแล้ว — รอตรวจสอบ",
    `ห้อง ${input.roomNumber} · ${input.tenantName}`,
    `เดือน ${input.billingMonth} · ฿${total}`,
    "",
    "Tenant submitted a payment slip",
    `Room ${input.roomNumber} · ฿${total}`,
    "",
    "เปิดแดชบอร์ด / Open dashboard:",
    dashboardUrl(input.propertySlug),
  ].join("\n");

  return pushLineMessages(input.lineUserId, [{ type: "text", text }]);
}

export async function safeNotifyOwnerSlipSubmitted(invoiceId: string) {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("invoices")
      .select(
        "billing_month, total_amount, tenants(name), rooms(room_number), properties(owner_line_user_id, slug)",
      )
      .eq("id", invoiceId)
      .maybeSingle();

    if (error || !data?.properties) return { sent: false as const, reason: "not_found" as const };

    const propertyRaw = data.properties as
      | { owner_line_user_id: string | null; slug: string }
      | { owner_line_user_id: string | null; slug: string }[];
    const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;
    if (!property?.owner_line_user_id) {
      return { sent: false as const, reason: "no_owner_line" as const };
    }

    const tenantRaw = data.tenants as { name: string } | { name: string }[] | null;
    const roomRaw = data.rooms as { room_number: string } | { room_number: string }[] | null;
    const tenant = Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw;
    const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;

    return await notifyOwnerSlipSubmitted({
      lineUserId: property.owner_line_user_id,
      tenantName: tenant?.name ?? "-",
      roomNumber: room?.room_number ?? "-",
      billingMonth: String(data.billing_month),
      totalAmount: Number(data.total_amount),
      propertySlug: property.slug,
    });
  } catch (error) {
    console.error("[notifyOwnerSlipSubmitted]", error);
    return { sent: false as const, reason: "error" as const };
  }
}

export async function safeNotifyBillIssued(
  input: Parameters<typeof notifyBillIssued>[0],
) {
  try {
    return await notifyBillIssued(input);
  } catch (error) {
    console.error("[notifyBillIssued]", error);
    return { sent: false as const, reason: "error" as const };
  }
}

export async function safeNotifySlipRejected(
  input: Parameters<typeof notifySlipRejected>[0],
) {
  try {
    return await notifySlipRejected(input);
  } catch (error) {
    console.error("[notifySlipRejected]", error);
    return { sent: false as const, reason: "error" as const };
  }
}

export async function safeNotifyPaymentConfirmed(invoiceId: string) {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("invoices")
      .select(
        "billing_month, total_amount, tenants(line_user_id), rooms(room_number)",
      )
      .eq("id", invoiceId)
      .maybeSingle();

    if (error || !data) return { sent: false as const, reason: "not_found" as const };

    const tenantRaw = data.tenants as
      | { line_user_id: string | null }
      | { line_user_id: string | null }[]
      | null;
    const roomRaw = data.rooms as { room_number: string } | { room_number: string }[] | null;
    const tenant = Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw;
    const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;

    if (!tenant?.line_user_id) {
      return { sent: false as const, reason: "no_tenant_line" as const };
    }

    return await notifyPaymentConfirmed({
      lineUserId: tenant.line_user_id,
      roomNumber: room?.room_number ?? "-",
      billingMonth: String(data.billing_month),
      totalAmount: Number(data.total_amount),
    });
  } catch (error) {
    console.error("[notifyPaymentConfirmed]", error);
    return { sent: false as const, reason: "error" as const };
  }
}
