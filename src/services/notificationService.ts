import { buildBoardLiffUrl } from "@/services/line/liffUrls";
import { pushLineMessages } from "@/services/line/pushMessageService";

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
