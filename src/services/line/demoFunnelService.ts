import { buildBoardLiffUrl } from "@/services/line/liffUrls";
import type { LineReplyMessage } from "@/services/line/replyMessageService";
import { buildTenantInviteUrl } from "@/services/tenantLinkService";

export function getDemoFunnelUrls() {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const propertySlug = process.env.LINE_DEMO_PROPERTY_SLUG ?? "demo-apartment";
  const inviteCode = process.env.LINE_DEMO_INVITE_CODE ?? "RCDEMO1";
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  const propertyUrl = base ? `${base}/${propertySlug}` : `/${propertySlug}`;
  const tenantBoardUrl = liffId
    ? buildBoardLiffUrl(liffId, { invite: inviteCode })
    : buildTenantInviteUrl(inviteCode);

  return { propertyUrl, tenantBoardUrl, propertySlug, inviteCode };
}

function normalizeDemoKeyword(text: string) {
  return text.trim().toLowerCase();
}

export function isDemoTriggerMessage(text: string) {
  const normalized = normalizeDemoKeyword(text);
  return normalized === "demo" || normalized.startsWith("demo ");
}

export function buildDemoPromptMessages(): LineReplyMessage[] {
  return [
    {
      type: "text",
      text: "พิมพ์ demo เพื่อลองใช้ระบบ\nType demo to start the demo",
    },
  ];
}

export function buildDemoWelcomeTextMessages(): LineReplyMessage[] {
  const { propertyUrl, tenantBoardUrl } = getDemoFunnelUrls();

  return [
    {
      type: "text",
      text: [
        "🏠 RentChill Demo",
        "ลองระบบบิลค่าเช่าได้ทันที — ไม่ต้องสมัคร",
        "Try RentChill now — no signup required",
        "",
        "ดูหน้าหอ / Property:",
        propertyUrl,
        "",
        "ลองบิลลูกบ้าน / Tenant bill:",
        tenantBoardUrl,
      ].join("\n"),
    },
  ];
}

export function buildDemoWelcomeMessages(): LineReplyMessage[] {
  const { propertyUrl, tenantBoardUrl } = getDemoFunnelUrls();

  return [
    {
      type: "flex",
      altText: "RentChill Demo — ลองใช้ระบบได้ทันที",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "RentChill",
              color: "#16a34a",
              weight: "bold",
              size: "sm",
            },
            {
              type: "text",
              text: "ยินดีต้อนรับ!",
              weight: "bold",
              size: "xl",
              margin: "md",
            },
            {
              type: "text",
              text: "ลองระบบบิลค่าเช่าได้ทันที — ไม่ต้องสมัคร",
              wrap: true,
              size: "sm",
              color: "#52525b",
              margin: "md",
            },
            {
              type: "text",
              text: "Try RentChill now — no signup required",
              wrap: true,
              size: "sm",
              color: "#52525b",
              margin: "sm",
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "primary",
              color: "#16a34a",
              height: "sm",
              action: {
                type: "uri",
                label: "ดูหน้าหอ / Property",
                uri: propertyUrl,
              },
            },
            {
              type: "button",
              style: "link",
              height: "sm",
              action: {
                type: "uri",
                label: "ลองบิล / Tenant bill",
                uri: tenantBoardUrl,
              },
            },
          ],
        },
      },
    },
  ];
}

export function buildWebhookUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return base ? `${base}/api/line/webhook` : "/api/line/webhook";
}
