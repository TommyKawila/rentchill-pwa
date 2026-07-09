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

  const salesPageUrl = `${base}/`;
  const signupUrl = `${base}/admin/signup`;
  const propertyUrl = `${base}/${propertySlug}`;
  const tenantBoardUrl = toAbsoluteUrl(
    liffId
      ? buildBoardLiffUrl(liffId, { invite: inviteCode })
      : buildTenantInviteUrl(inviteCode),
  );

  return {
    salesPageUrl,
    signupUrl,
    propertyUrl,
    tenantBoardUrl,
    propertySlug,
    inviteCode,
  };
}

function normalizeDemoKeyword(text: string) {
  return text.trim().toLowerCase();
}

export function isDemoTriggerMessage(text: string) {
  const normalized = normalizeDemoKeyword(text);
  return normalized === "demo" || normalized.startsWith("demo ");
}

export function buildDemoPromptMessages(): LineReplyMessage[] {
  const { salesPageUrl } = getDemoFunnelUrls();

  return [
    {
      type: "text",
      text: [
        "สวัสดี — RentChill ระบบบริหารห้องเช่า",
        "ดูรายละเอียดและราคา:",
        salesPageUrl,
        "",
        "หรือพิมพ์ demo เพื่อลองใช้",
      ].join("\n"),
    },
  ];
}

export function buildDemoWelcomeTextMessages(): LineReplyMessage[] {
  const { signupUrl, tenantBoardUrl } = getDemoFunnelUrls();

  return [
    {
      type: "text",
      text: [
        "RentChill",
        "บริหารห้องเช่าให้เป็นเรื่องชิล — เริ่มฟรี 3 ห้อง",
        "",
        "สมัครใช้งาน:",
        signupUrl,
        "",
        "ตัวอย่างบิลลูกบ้าน:",
        tenantBoardUrl,
      ].join("\n"),
    },
  ];
}

export function buildDemoWelcomeMessages(): LineReplyMessage[] {
  const { signupUrl, tenantBoardUrl } = getDemoFunnelUrls();

  return [
    {
      type: "flex",
      altText: "RentChill — เริ่มใช้ฟรี 3 ห้อง บริหารห้องเช่าใน LINE",
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
                  text: "Starter",
                  color: "#16a34a",
                  size: "xs",
                  weight: "bold",
                  flex: 0,
                },
              ],
            },
            {
              type: "text",
              text: "ฟรี 3 ห้อง · ไม่ต้องบัตรเครดิต",
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
              text: "บริหารห้องเช่าให้เป็นเรื่องชิล",
              weight: "bold",
              size: "lg",
              color: "#18181b",
            },
            {
              type: "text",
              text: "ออกบิล ตรวจสลิป ดูภาพรวมทุกห้อง — จากแดชบอร์ดผู้ดูแล",
              wrap: true,
              size: "sm",
              color: "#71717a",
            },
            {
              type: "text",
              text: "ลูกบ้านจ่ายผ่าน LINE ไม่ต้องโหลดแอป",
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
                      text: "แผน Starter",
                      size: "xs",
                      color: "#a1a1aa",
                    },
                    {
                      type: "text",
                      text: "ฟรี · สูงสุด 3 ห้อง",
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
                      text: "ตัวอย่างฝั่งลูกบ้าน",
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
                label: "เริ่มใช้ฟรี 3 ห้อง",
                uri: signupUrl,
              },
            },
            {
              type: "button",
              style: "link",
              height: "sm",
              action: {
                type: "uri",
                label: "ตัวอย่างบิลลูกบ้าน",
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
  const base = resolveAbsoluteAppBase();
  return `${base}/api/line/webhook`;
}
