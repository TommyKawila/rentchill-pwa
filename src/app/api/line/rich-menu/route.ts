import { NextResponse } from "next/server";
import {
  deployTenantRichMenu,
  listRichMenus,
} from "@/services/line/richMenuService";
import { buildBoardLiffUrl } from "@/services/line/liffUrls";

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
      liffUrl: buildBoardLiffUrl(liffId),
      endpointUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/board`,
      message: "Set LINE_CHANNEL_ACCESS_TOKEN to deploy rich menu via API",
    });
  }

  try {
    const menus = await listRichMenus(accessToken);
    return NextResponse.json({
      ok: true,
      configured: true,
      liffUrl: buildBoardLiffUrl(liffId),
      endpointUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/board`,
      richmenus: menus.richmenus ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message }, { status: 400 });
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
