import { BRAND_NAME } from "@/config/brand";
import { buildBoardLiffUrl } from "@/services/line/liffUrls";
import type { MaintenanceTicketStatus } from "@/services/types";
import type { LineReplyMessage } from "@/services/line/replyMessageService";

export type MaintenanceFlexPayload = {
  roomNumber: string;
  categoryLabel: string;
  description: string;
  status: MaintenanceTicketStatus;
};

const STEPS = [
  { key: "waiting", label: "ส่งแล้ว" },
  { key: "in_progress", label: "กำลังซ่อม" },
  { key: "done", label: "เสร็จสิ้น" },
] as const;

function boardMaintenanceUrl() {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  const base = liffId
    ? buildBoardLiffUrl(liffId)
    : `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? ""}/board`;
  return `${base}#maintenance`;
}

function stepIndex(status: MaintenanceTicketStatus) {
  if (status === "waiting") return 0;
  if (status === "in_progress") return 1;
  return 2;
}

function timelineRow(label: string, active: boolean, done: boolean) {
  const color = done ? "#0d9488" : active ? "#0d9488" : "#d4d4d8";
  const textColor = done || active ? "#18181b" : "#a1a1aa";
  const weight = active || done ? "bold" : "regular";

  return {
    type: "box",
    layout: "horizontal",
    spacing: "sm",
    margin: "sm",
    contents: [
      {
        type: "text",
        text: done ? "●" : active ? "◉" : "○",
        color,
        size: "sm",
        flex: 0,
      },
      {
        type: "text",
        text: label,
        color: textColor,
        size: "sm",
        weight,
        flex: 1,
      },
    ],
  };
}

export function buildMaintenanceFlexMessage(
  input: MaintenanceFlexPayload,
): LineReplyMessage {
  const current = stepIndex(input.status);
  const url = boardMaintenanceUrl();

  return {
    type: "flex",
    altText: `แจ้งซ่อม ห้อง ${input.roomNumber} · ${input.categoryLabel}`,
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
            text: "แจ้งซ่อม",
            color: "#f0fdfa",
            size: "sm",
            margin: "sm",
          },
          {
            type: "text",
            text: `ห้อง ${input.roomNumber} · ${input.categoryLabel}`,
            color: "#ffffff",
            weight: "bold",
            size: "md",
            margin: "sm",
            wrap: true,
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        paddingAll: "16px",
        contents: [
          {
            type: "text",
            text: input.description.slice(0, 120),
            color: "#52525b",
            size: "sm",
            wrap: true,
          },
          {
            type: "separator",
            margin: "lg",
          },
          {
            type: "text",
            text: "สถานะงาน",
            color: "#18181b",
            weight: "bold",
            size: "sm",
            margin: "lg",
          },
          ...STEPS.map((step, index) =>
            timelineRow(step.label, index === current, index <= current),
          ),
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
            color: "#0d9488",
            action: {
              type: "uri",
              label: "ดูสถานะแจ้งซ่อม",
              uri: url,
            },
          },
        ],
      },
    },
  };
}

export function buildMaintenanceSubmittedLead(input: MaintenanceFlexPayload) {
  return `ส่งเรื่องแจ้งซ่อมแล้ว — ห้อง ${input.roomNumber} (${input.categoryLabel}) เจ้าของห้องได้รับแจ้งแล้ว`;
}

export function buildMaintenanceDoneLead(input: MaintenanceFlexPayload) {
  return `ซ่อมแซมเสร็จสิ้นแล้ว — ห้อง ${input.roomNumber} (${input.categoryLabel}) ขอบคุณที่แจ้งปัญหาค่ะ`;
}

export function buildMaintenanceStatusLead(
  input: MaintenanceFlexPayload,
  status: MaintenanceTicketStatus,
) {
  if (status === "done") return buildMaintenanceDoneLead(input);
  if (status === "in_progress") {
    return `กำลังดำเนินการซ่อม — ห้อง ${input.roomNumber} (${input.categoryLabel})`;
  }
  return buildMaintenanceSubmittedLead(input);
}
