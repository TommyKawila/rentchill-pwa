import { buildBoardLiffUrl } from "@/services/line/liffUrls";
import type { LineReplyMessage } from "@/services/line/replyMessageService";
import { buildTenantInviteUrl } from "@/services/tenantLinkService";

const PRODUCTION_APP_URL = "https://rentchill-pwa.vercel.app";

function resolveAbsoluteAppBase() {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  if (fromEnv.startsWith("http://") || fromEnv.startsWith("https://")) {
    return fromEnv;
  }
  return PRODUCTION_APP_URL;
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const base = resolveAbsoluteAppBase();
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

export function getDemoFunnelUrls() {
  const base = resolveAbsoluteAppBase();
  const propertySlug = process.env.LINE_DEMO_PROPERTY_SLUG ?? "demo-apartment";
  const inviteCode = process.env.LINE_DEMO_INVITE_CODE ?? "RCDEMO1";
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  const propertyUrl = `${base}/${propertySlug}`;
  const tenantBoardUrl = toAbsoluteUrl(
    liffId
      ? buildBoardLiffUrl(liffId, { invite: inviteCode })
      : buildTenantInviteUrl(inviteCode),
  );

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
        "RentChill Demo",
        "ลองบิลค่าเช่าฟรี — ไม่ต้องสมัคร",
        "",
        "ลองบิลลูกบ้าน:",
        tenantBoardUrl,
        "",
        "ดูหน้าหอ:",
        propertyUrl,
      ].join("\n"),
    },
  ];
}

export function buildDemoWelcomeMessages(): LineReplyMessage[] {
  const { propertyUrl, tenantBoardUrl, propertySlug } = getDemoFunnelUrls();

  return [
    {
      type: "flex",
      altText: "RentChill Demo — ลองบิลค่าเช่าฟรี ไม่ต้องสมัคร",
      contents: {
        type: "bubble",
        size: "mega",
        styles: {
          header: { separator: true },
          footer: { separator: true },
        },
        header: {
          type: "box",
          layout: "vertical",
          backgroundColor: "#fafafa",
          paddingAll: "20px",
          contents: [
            {
              type: "box",
              layout: "baseline",
              spacing: "sm",
              contents: [
                {
                  type: "text",
                  text: "RentChill",
                  color: "#18181b",
                  weight: "bold",
                  size: "xl",
                  flex: 1,
                },
                {
                  type: "text",
                  text: "Demo",
                  color: "#16a34a",
                  size: "xs",
                  weight: "bold",
                  flex: 0,
                },
              ],
            },
            {
              type: "text",
              text: "ลองใช้ฟรี · ไม่ต้องสมัคร",
              color: "#71717a",
              size: "xs",
              margin: "sm",
            },
          ],
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          paddingAll: "20px",
          backgroundColor: "#ffffff",
          contents: [
            {
              type: "text",
              text: "ลองระบบบิลค่าเช่าได้ทันที",
              weight: "bold",
              size: "lg",
              color: "#18181b",
            },
            {
              type: "text",
              text: "ดูบิล ส่งสลิป ตรวจอัตโนมัติ — ทุกอย่างผ่าน LINE",
              wrap: true,
              size: "sm",
              color: "#71717a",
            },
            {
              type: "text",
              text: "Try free — no signup required",
              wrap: true,
              size: "xs",
              color: "#a1a1aa",
              margin: "sm",
            },
            { type: "separator", margin: "lg", color: "#f4f4f5" },
            {
              type: "box",
              layout: "vertical",
              spacing: "md",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  spacing: "xs",
                  contents: [
                    {
                      type: "text",
                      text: "หน้าหอ",
                      size: "xs",
                      color: "#a1a1aa",
                    },
                    {
                      type: "text",
                      text: propertySlug,
                      size: "sm",
                      weight: "bold",
                      color: "#18181b",
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "vertical",
                  spacing: "xs",
                  contents: [
                    {
                      type: "text",
                      text: "บิลลูกบ้าน",
                      size: "xs",
                      color: "#a1a1aa",
                    },
                    {
                      type: "text",
                      text: "เปิดบิล · ส่งสลิป · ตรวจอัตโนมัติ",
                      size: "sm",
                      color: "#3f3f46",
                      wrap: true,
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
          backgroundColor: "#fafafa",
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
                label: "ดูหน้าหอ",
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
  const base = resolveAbsoluteAppBase();
  return `${base}/api/line/webhook`;
}
