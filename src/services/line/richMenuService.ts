import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildBoardLiffUrl } from "@/services/line/liffUrls";

const LINE_API = "https://api.line.me/v2/bot";
const LINE_DATA_API = "https://api-data.line.me/v2/bot";

type LineError = { message?: string; details?: unknown };

async function lineFetch(
  url: string,
  accessToken: string,
  init?: RequestInit,
) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as Record<string, unknown>) : {};

  if (!response.ok) {
    const error = payload as LineError;
    throw new Error(error.message ?? `LINE API error (${response.status})`);
  }

  return payload;
}

export async function createTenantRichMenu(accessToken: string, liffId: string) {
  return lineFetch(`${LINE_API}/richmenu`, accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      size: { width: 2500, height: 843 },
      selected: true,
      name: "RentChill Tenant",
      chatBarText: "ดูบิล",
      areas: [
        {
          bounds: { x: 0, y: 0, width: 2500, height: 843 },
          action: {
            type: "uri",
            label: "ดูบิลค่าเช่า",
            uri: buildBoardLiffUrl(liffId),
          },
        },
      ],
    }),
  }) as Promise<{ richMenuId: string }>;
}

export async function uploadRichMenuImage(
  accessToken: string,
  richMenuId: string,
  imageBuffer: Buffer,
  contentType = "image/jpeg",
) {
  const response = await fetch(
    `${LINE_DATA_API}/richmenu/${richMenuId}/content`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": contentType,
      },
      body: new Uint8Array(imageBuffer),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Upload rich menu image failed");
  }
}

export async function setDefaultRichMenu(accessToken: string, richMenuId: string) {
  await lineFetch(`${LINE_API}/user/all/richmenu/${richMenuId}`, accessToken, {
    method: "POST",
  });
}

export async function listRichMenus(accessToken: string) {
  return lineFetch(`${LINE_API}/richmenu/list`, accessToken) as Promise<{
    richmenus: Array<{ richMenuId: string; name: string; chatBarText: string }>;
  }>;
}

export async function deployTenantRichMenu(options: {
  accessToken: string;
  liffId: string;
  imagePath?: string;
}) {
  const imagePath =
    options.imagePath ??
    path.join(process.cwd(), "public/line/rich-menu-tenant.jpg");

  const imageBuffer = await readFile(imagePath);
  const { richMenuId } = await createTenantRichMenu(
    options.accessToken,
    options.liffId,
  );

  await uploadRichMenuImage(options.accessToken, richMenuId, imageBuffer);
  await setDefaultRichMenu(options.accessToken, richMenuId);

  return {
    richMenuId,
    liffUrl: buildBoardLiffUrl(options.liffId),
  };
}
