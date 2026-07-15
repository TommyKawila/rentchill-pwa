import { buildBoardLiffUrl } from "@/services/line/liffUrls";
import type { ReminderTier } from "@/services/paymentReminderTier";

export const REMINDER_TEMPLATE_MAX_LENGTH = 800;

export const DEFAULT_REMINDER_TEMPLATES: Record<ReminderTier, string> = {
  soft: `สวัสดีครับ แจ้งเตือนค่าเช่ารอบ {month}
ห้อง {room} · ยอด ฿{amount}
เมื่อสะดวกช่วยชำระได้ที่ลิงก์ด้านล่างครับ

Friendly reminder — rent {month}
Room {room} · ฿{amount}
Please pay when convenient via the link below.`,
  firm: `ยังไม่พบการชำระค่าเช่ารอบ {month}
ห้อง {room} · ยอด ฿{amount}
กรุณาชำระโดยเร็วที่สุดครับ

Payment reminder — {month}
Room {room} · ฿{amount}
Please pay as soon as possible.`,
  final: `โอกาสสุดท้าย: กรุณาชำระค่าเช่ารอบ {month}
ห้อง {room} · ยอด ฿{amount}
ภายในวันนี้ เพื่อไม่ให้กระทบการเช่าครับ

Final notice — rent {month}
Room {room} · ฿{amount}
Please pay today to avoid lease impact.`,
};

export type ReminderTemplateVars = {
  month: string;
  room: string;
  amount: string;
};

function boardUrl() {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (liffId) return buildBoardLiffUrl(liffId);
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return base ? `${base}/board` : "/board";
}

export function getReminderTemplate(
  tier: ReminderTier,
  custom: string | null | undefined,
): string {
  const trimmed = custom?.trim();
  if (trimmed) return trimmed;
  return DEFAULT_REMINDER_TEMPLATES[tier];
}

export function interpolateReminderTemplate(
  template: string,
  vars: ReminderTemplateVars,
): string {
  return template
    .replaceAll("{month}", vars.month)
    .replaceAll("{room}", vars.room)
    .replaceAll("{amount}", vars.amount);
}

export function formatReminderAmount(amount: number): string {
  return amount.toLocaleString("th-TH");
}

export function buildReminderLineText(input: {
  tier: ReminderTier;
  customTemplate?: string | null;
  roomNumber: string;
  billingMonth: string;
  totalAmount: number;
}): string {
  const template = getReminderTemplate(input.tier, input.customTemplate);
  const body = interpolateReminderTemplate(template, {
    month: input.billingMonth,
    room: input.roomNumber,
    amount: formatReminderAmount(input.totalAmount),
  });

  return `${body}\n\nเปิดบิล / View bill:\n${boardUrl()}`;
}

export function validateReminderTemplate(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.length > REMINDER_TEMPLATE_MAX_LENGTH) return false;
  return trimmed.includes("{room}");
}

export function sanitizeReminderTemplate(
  tier: ReminderTier,
  text: string | null | undefined,
): string | null {
  if (text === null || text === undefined) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (trimmed === DEFAULT_REMINDER_TEMPLATES[tier].trim()) return null;
  if (!validateReminderTemplate(trimmed)) {
    throw new Error("REMINDER_TEMPLATE_INVALID");
  }
  return trimmed.slice(0, REMINDER_TEMPLATE_MAX_LENGTH);
}

export function previewReminderTemplate(
  template: string,
  sample: ReminderTemplateVars = {
    month: "2026-07",
    room: "108",
    amount: "5,000",
  },
): string {
  return interpolateReminderTemplate(template, sample);
}
