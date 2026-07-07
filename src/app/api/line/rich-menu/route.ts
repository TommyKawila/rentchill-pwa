import { NextResponse } from "next/server";
import { lineFetch } from "@/services/line/lineApiClient";
import {
  deployTenantRichMenu,
  listRichMenus,
} from "@/services/line/richMenuService";
import { buildWebhookUrl } from "@/services/line/demoFunnelService";
import { buildBoardLiffUrl } from "@/services/line/liffUrls";

function lineStatusExtras() {
  return {
    webhookUrl: buildWebhookUrl(),
    webhookConfigured: Boolean(process.env.LINE_CHANNEL_SECRET),
  };
}

async function getBotInfo(accessToken: string) {
  try {
    const info = (await lineFetch("https://api.line.me/v2/bot/info", accessToken)) as {
      displayName?: string;
      userId?: string;
    };
    return {
      botReady: true as const,
      botName: info.displayName ?? null,
    };
  } catch (error) {
    return {
      botReady: false as const,
      botTokenError: error instanceof Error ? error.message : "Invalid token",
    };
  }
}

export async function GET() {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  if (!liffId) {
    return NextResponse.json({ error: "NEXT_PUBLIC_LIFF_ID not configured" }, { status: 503 });
  }

  if (!accessToken) {
    return NextResponse.json({
      ok: true,
      configured: false,
      botReady: false,
      liffUrl: buildBoardLiffUrl(liffId),
      endpointUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/board`,
      message: "Set LINE_CHANNEL_ACCESS_TOKEN to deploy rich menu via API",
      ...lineStatusExtras(),
    });
  }

  const botInfo = await getBotInfo(accessToken);

  try {
    const menus = await listRichMenus(accessToken);
    return NextResponse.json({
      ok: true,
      configured: true,
      ...botInfo,
      liffUrl: buildBoardLiffUrl(liffId),
      endpointUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/board`,
      richmenus: menus.richmenus ?? [],
      ...lineStatusExtras(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message, ...botInfo }, { status: 400 });
  }
}

export async function POST() {
  try {
    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

    if (!accessToken) {
      return NextResponse.json(
        { error: "LINE_CHANNEL_ACCESS_TOKEN not configured" },
        { status: 503 },
      );
    }

    if (!liffId) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_LIFF_ID not configured" },
        { status: 503 },
      );
    }

    const result = await deployTenantRichMenu({ accessToken, liffId });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deploy failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
