import { formatBillingMonth } from "@/services/billingMonthDisplayService";
import { buildBoardLiffUrl } from "@/services/line/liffUrls";
import type { ReminderTier } from "@/services/paymentReminderTier";

export const REMINDER_TEMPLATE_MAX_LENGTH = 800;

export type ReminderTemplateVars = {
  tenantName: string;
  propertyName: string;
  monthLabel: string;
  room: string;
  amount: string;
};

export const DEFAULT_REMINDER_TEMPLATES: Record<ReminderTier, string> = {
  soft: `สวัสดีค่ะคุณ {tenantName} ระบบ RentChill ขออนุญาตแจ้งเตือนกำหนดชำระค่าเช่าห้องพักประจำเดือน {monthLabel} คอนโด {propertyName} (ห้อง {room}) ซึ่งจะครบกำหนดในวันพรุ่งนี้ค่ะ`,
  firm: `สวัสดีค่ะคุณ {tenantName} ระบบ RentChill ตรวจสอบพบว่าบิลค่าเช่าห้องพักประจำเดือน {monthLabel} (ห้อง {room}) เกินกำหนดชำระมาแล้ว 3 วันค่ะ เพื่อป้องกันการระงับบริการหรือค่าปรับตามสัญญา รบกวนคุณ {tenantName} ตรวจสอบยอดเงินและแนบหลักฐานในลิงก์ด้านล่างนี้ได้เลยนะคะ`,
  final: `เรียนคุณ {tenantName} ระบบ RentChill ขอเรียนแจ้งให้ทราบว่า บิลค่าเช่าห้องพักประจำเดือน {monthLabel} (ห้อง {room}) ได้เกินกำหนดชำระมาแล้ว 7 วัน ขณะนี้ระบบได้ส่งรายงานข้อมูลไปยังเจ้าของห้องพักเรียบร้อยแล้ว เพื่อหลีกเลี่ยงการดำเนินการตามข้อกำหนดในสัญญาเช่า กรุณาชำระยอดเงินทันทีผ่านระบบค่ะ`,
};

function boardUrl() {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (liffId) return buildBoardLiffUrl(liffId);
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return base ? `${base}/board` : "/board";
}

export function formatBillingMonthForReminder(billingMonth: string) {
  return formatBillingMonth(billingMonth, "thaiBe", "th");
}

export function formatReminderAmount(amount: number): string {
  return amount.toLocaleString("th-TH");
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
    .replaceAll("{tenantName}", vars.tenantName)
    .replaceAll("{propertyName}", vars.propertyName)
    .replaceAll("{monthLabel}", vars.monthLabel)
    .replaceAll("{month}", vars.monthLabel)
    .replaceAll("{room}", vars.room)
    .replaceAll("{amount}", vars.amount);
}

export function buildDefaultReminderBody(input: {
  tier: ReminderTier;
  tenantName: string;
  propertyName: string;
  roomNumber: string;
  billingMonthLabel: string;
}) {
  return DEFAULT_REMINDER_TEMPLATES[input.tier]
    .replaceAll("{tenantName}", input.tenantName.trim() || "ลูกบ้าน")
    .replaceAll("{propertyName}", input.propertyName.trim() || "หอพัก")
    .replaceAll("{monthLabel}", input.billingMonthLabel)
    .replaceAll("{room}", input.roomNumber);
}

export function buildReminderLineText(input: {
  tier: ReminderTier;
  customTemplate?: string | null;
  tenantName: string;
  propertyName: string;
  roomNumber: string;
  billingMonth: string;
  totalAmount: number;
}): string {
  const monthLabel = formatBillingMonthForReminder(input.billingMonth);
  const template = getReminderTemplate(input.tier, input.customTemplate);
  const body = interpolateReminderTemplate(template, {
    tenantName: input.tenantName.trim() || "ลูกบ้าน",
    propertyName: input.propertyName.trim() || "หอพัก",
    monthLabel,
    room: input.roomNumber,
    amount: formatReminderAmount(input.totalAmount),
  });

  return `${body}\n\nยอดชำระสุทธิ: ฿${formatReminderAmount(input.totalAmount)}\n\nเปิดบิล / View bill:\n${boardUrl()}`;
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
    tenantName: "สมชาย",
    propertyName: "Ideomix",
    monthLabel: "กรกฎาคม 2569",
    room: "108",
    amount: "5,000",
  },
): string {
  return interpolateReminderTemplate(template, sample);
}
