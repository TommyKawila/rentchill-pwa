import { BRAND_NAME } from "@/config/brand";
import { buildBoardLiffUrl } from "@/services/line/liffUrls";
import type { LineReplyMessage } from "@/services/line/replyMessageService";

export type ReceiptLinePayload = {
  roomNumber: string;
  billingMonth: string;
  totalAmount: number;
};

export const RECEIPT_FLEX_CTA = "ดูใบเสร็จรับเงิน";

function formatAmount(amount: number) {
  return amount.toLocaleString("th-TH");
}

function boardUrl() {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (liffId) return buildBoardLiffUrl(liffId);
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return base ? `${base}/board` : "/board";
}

export function buildReceiptFlexMessage(input: ReceiptLinePayload): LineReplyMessage {
  const url = boardUrl();

  return {
    type: "flex",
    altText: `ใบเสร็จรับเงิน ${input.billingMonth} ห้อง ${input.roomNumber}`,
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
            text: "ใบเสร็จรับเงิน",
            color: "#f0fdfa",
            size: "sm",
            margin: "sm",
          },
          {
            type: "text",
            text: `ห้อง ${input.roomNumber} · ${input.billingMonth}`,
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
        contents: [
          {
            type: "box",
            layout: "baseline",
            contents: [
              {
                type: "text",
                text: "ยอดชำระ",
                color: "#52525b",
                size: "sm",
                flex: 1,
              },
              {
                type: "text",
                text: `฿${formatAmount(input.totalAmount)}`,
                color: "#0d9488",
                weight: "bold",
                size: "lg",
                align: "end",
              },
            ],
          },
          {
            type: "text",
            text: "เจ้าของห้องยืนยันการชำระเงินเรียบร้อยแล้ว",
            color: "#52525b",
            size: "sm",
            wrap: true,
            margin: "md",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "12px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#0d9488",
            action: {
              type: "uri",
              label: RECEIPT_FLEX_CTA,
              uri: url,
            },
          },
        ],
      },
    },
  };
}

export function buildReceiptLeadText(input: ReceiptLinePayload) {
  const total = formatAmount(input.totalAmount);
  return `เจ้าของห้องได้ยืนยันยอดเงิน ฿${total} เรียบร้อยแล้ว — ${input.billingMonth} ห้อง ${input.roomNumber}`;
}
