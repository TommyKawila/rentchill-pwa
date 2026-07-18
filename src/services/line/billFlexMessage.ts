import { BRAND_NAME } from "@/config/brand";
import { buildBoardLiffUrl } from "@/services/line/liffUrls";
import type { InvoiceExtraItem } from "@/services/types";
import type { LineReplyMessage } from "@/services/line/replyMessageService";

export type BillLinePayload = {
  roomNumber: string;
  billingMonth: string;
  totalAmount: number;
  baseRentAmount: number;
  waterAmount: number;
  electricAmount: number;
  extraItems?: InvoiceExtraItem[];
};

export const BILL_FLEX_PAY_CTA = "ดูบิลเต็มรูปแบบและจ่ายเงิน";

function formatAmount(amount: number) {
  return amount.toLocaleString("th-TH");
}

function boardUrl() {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (liffId) return buildBoardLiffUrl(liffId);
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return base ? `${base}/board` : "/board";
}

function lineItem(label: string, amount: number) {
  return {
    type: "box",
    layout: "baseline",
    spacing: "sm",
    contents: [
      {
        type: "text",
        text: label,
        color: "#52525b",
        size: "sm",
        flex: 4,
        wrap: true,
      },
      {
        type: "text",
        text: `฿${formatAmount(amount)}`,
        color: "#18181b",
        size: "sm",
        align: "end",
        flex: 2,
      },
    ],
  };
}

export function buildBillPlainText(input: BillLinePayload) {
  const lines = [
    `บิลค่าเช่า ${input.billingMonth}`,
    `ห้อง ${input.roomNumber}`,
    `ค่าเช่า ฿${formatAmount(input.baseRentAmount)}`,
  ];
  if (input.waterAmount > 0) {
    lines.push(`ค่าน้ำ ฿${formatAmount(input.waterAmount)}`);
  }
  if (input.electricAmount > 0) {
    lines.push(`ค่าไฟ ฿${formatAmount(input.electricAmount)}`);
  }
  for (const item of input.extraItems ?? []) {
    lines.push(`${item.label} ฿${formatAmount(item.amount)}`);
  }
  lines.push(`ยอดรวม ฿${formatAmount(input.totalAmount)}`, "", "เปิดบิล:", boardUrl());
  return lines.join("\n");
}

export function buildBillFlexMessage(input: BillLinePayload): LineReplyMessage {
  const bodyRows = [
    lineItem("ค่าเช่า", input.baseRentAmount),
  ];
  if (input.waterAmount > 0) bodyRows.push(lineItem("ค่าน้ำ", input.waterAmount));
  if (input.electricAmount > 0) bodyRows.push(lineItem("ค่าไฟ", input.electricAmount));
  for (const item of input.extraItems ?? []) {
    bodyRows.push(lineItem(item.label, item.amount));
  }

  const url = boardUrl();

  return {
    type: "flex",
    altText: `บิลค่าเช่า ${input.billingMonth} ห้อง ${input.roomNumber}`,
    contents: {
      type: "bubble",
      styles: {
        header: { backgroundColor: "#0d9488" },
        footer: { separator: true },
      },
      header: {
        type: "box",
        layout: "vertical",
        paddingAll: "16px",
        contents: [
          {
            type: "text",
            text: BRAND_NAME,
            color: "#ffffff",
            weight: "bold",
            size: "lg",
          },
          {
            type: "text",
            text: `บิลค่าเช่า ${input.billingMonth}`,
            color: "#f0fdfa",
            size: "sm",
            margin: "sm",
          },
          {
            type: "text",
            text: `ห้อง ${input.roomNumber} · ฿${formatAmount(input.totalAmount)}`,
            color: "#ffffff",
            weight: "bold",
            size: "md",
            margin: "sm",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "16px",
        contents: bodyRows,
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "12px",
        contents: [
          {
            type: "box",
            layout: "baseline",
            contents: [
              {
                type: "text",
                text: "ยอดรวม",
                weight: "bold",
                color: "#18181b",
                flex: 1,
              },
              {
                type: "text",
                text: `฿${formatAmount(input.totalAmount)}`,
                weight: "bold",
                color: "#0d9488",
                align: "end",
              },
            ],
          },
          {
            type: "button",
            style: "primary",
            color: "#0d9488",
            action: {
              type: "uri",
              label: BILL_FLEX_PAY_CTA,
              uri: url,
            },
          },
        ],
      },
    },
  };
}

export function buildLineTextShareUrl(text: string) {
  return `https://line.me/R/share?text=${encodeURIComponent(text)}`;
}
