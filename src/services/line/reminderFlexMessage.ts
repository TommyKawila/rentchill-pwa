import { buildBoardLiffUrl } from "@/services/line/liffUrls";
import {
  buildDefaultReminderBody,
  formatReminderAmount,
} from "@/services/paymentReminderMessageService";
import type { ReminderTier } from "@/services/paymentReminderTier";
import type { LineReplyMessage } from "@/services/line/replyMessageService";

export type ReminderFlexPayload = {
  tier: ReminderTier;
  tenantName: string;
  propertyName: string;
  roomNumber: string;
  billingMonthLabel: string;
  totalAmount: number;
  customBody?: string | null;
};

const TEAL = "#0d9488";
const URGENT_RED = "#dc2626";

function boardUrl() {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (liffId) return buildBoardLiffUrl(liffId);
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return base ? `${base}/board` : "/board";
}

function tierMeta(tier: ReminderTier) {
  if (tier === "soft") {
    return {
      headerBg: TEAL,
      headerTitle: "⏱️ แจ้งเตือนรอบบิลประจำเดือน",
      ctaLabel: "📄 ดูบิลเต็มรูปแบบ & จ่ายเงิน",
      buttonColor: TEAL,
    };
  }
  if (tier === "firm") {
    return {
      headerBg: TEAL,
      headerTitle: "🔔 ใบแจ้งหนี้เกินกำหนดชำระ",
      ctaLabel: "⚡ ชำระเงินและแนบสลิปทันที",
      buttonColor: TEAL,
    };
  }
  return {
    headerBg: URGENT_RED,
    headerTitle: "🚨 แจ้งเตือนด่วน: ระงับยอดค้างชำระ",
    ctaLabel: "💳 ชำระเงินด่วนที่สุด",
    buttonColor: URGENT_RED,
  };
}

export function buildReminderFlexMessage(
  input: ReminderFlexPayload,
): LineReplyMessage {
  const meta = tierMeta(input.tier);
  const amount = formatReminderAmount(input.totalAmount);
  const bodyText =
    input.customBody?.trim() ||
    buildDefaultReminderBody({
      tier: input.tier,
      tenantName: input.tenantName,
      propertyName: input.propertyName,
      roomNumber: input.roomNumber,
      billingMonthLabel: input.billingMonthLabel,
    });

  const url = boardUrl();

  return {
    type: "flex",
    altText: `แจ้งเตือนค่าเช่า ${input.billingMonthLabel} ห้อง ${input.roomNumber} ฿${amount}`,
    contents: {
      type: "bubble",
      styles: {
        header: { backgroundColor: meta.headerBg },
        footer: { separator: true },
      },
      header: {
        type: "box",
        layout: "vertical",
        paddingAll: "16px",
        contents: [
          {
            type: "text",
            text: meta.headerTitle,
            color: "#ffffff",
            weight: "bold",
            size: "md",
            wrap: true,
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        paddingAll: "16px",
        contents: [
          {
            type: "text",
            text: bodyText,
            color: "#18181b",
            size: "sm",
            wrap: true,
          },
          {
            type: "box",
            layout: "baseline",
            margin: "md",
            contents: [
              {
                type: "text",
                text: "ยอดชำระสุทธิ:",
                color: "#52525b",
                size: "sm",
                flex: 4,
              },
              {
                type: "text",
                text: `฿${amount}`,
                color: input.tier === "final" ? URGENT_RED : TEAL,
                weight: "bold",
                size: "lg",
                align: "end",
                flex: 3,
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "12px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: meta.buttonColor,
            action: {
              type: "uri",
              label: meta.ctaLabel,
              uri: url,
            },
          },
        ],
      },
    },
  };
}
