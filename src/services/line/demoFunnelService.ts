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
  const { propertyUrl, tenantBoardUrl, propertySlug } = getDemoFunnelUrls();

  return [
    {
      type: "flex",
      altText: "RentChill Demo — ลองใช้ระบบบิลค่าเช่า",
      contents: {
        type: "bubble",
        size: "mega",
        header: {
          type: "box",
          layout: "vertical",
          backgroundColor: "#16a34a",
          paddingAll: "20px",
          contents: [
            {
              type: "text",
              text: "RentChill",
              color: "#ffffff",
              weight: "bold",
              size: "xl",
            },
            {
              type: "text",
              text: "Interactive Demo",
              color: "#dcfce7",
              size: "sm",
              margin: "sm",
            },
          ],
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          paddingAll: "20px",
          contents: [
            {
              type: "text",
              text: "ลองระบบบิลค่าเช่าได้ทันที",
              weight: "bold",
              size: "md",
              color: "#18181b",
            },
            {
              type: "text",
              text: "ไม่ต้องสมัคร · โปร่งใส · จ่ายผ่าน LINE",
              wrap: true,
              size: "sm",
              color: "#71717a",
            },
            {
              type: "text",
              text: "Try RentChill now — no signup required",
              wrap: true,
              size: "xs",
              color: "#a1a1aa",
              margin: "sm",
            },
            { type: "separator", margin: "md" },
            {
              type: "box",
              layout: "vertical",
              spacing: "sm",
              contents: [
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "●",
                      color: "#16a34a",
                      size: "xs",
                      flex: 0,
                    },
                    {
                      type: "text",
                      text: `ดูหน้าหอ ${propertySlug}`,
                      size: "sm",
                      color: "#3f3f46",
                      wrap: true,
                      flex: 1,
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "●",
                      color: "#16a34a",
                      size: "xs",
                      flex: 0,
                    },
                    {
                      type: "text",
                      text: "ลองบิลลูกบ้าน + ส่งสลิป",
                      size: "sm",
                      color: "#3f3f46",
                      wrap: true,
                      flex: 1,
                    },
                  ],
                },
              ],
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          paddingAll: "16px",
          contents: [
            {
              type: "button",
              style: "primary",
              color: "#16a34a",
              height: "sm",
              action: {
                type: "uri",
                label: "ลองบิลลูกบ้าน",
                uri: tenantBoardUrl,
              },
            },
            {
              type: "button",
              style: "link",
              height: "sm",
              action: {
                type: "uri",
                label: "ดูหน้าหอพัก",
                uri: propertyUrl,
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
