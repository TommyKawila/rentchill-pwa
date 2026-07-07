import { NextResponse } from "next/server";
import { handleLineWebhook } from "@/services/line/lineWebhookService";
import { verifyLineSignature } from "@/services/line/lineSignature";

export async function POST(request: Request) {
  const body = await request.text();
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (channelSecret) {
    const signature = request.headers.get("x-line-signature");
    if (
      !signature ||
      !verifyLineSignature(body, signature, channelSecret)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "LINE_CHANNEL_SECRET not configured" },
      { status: 503 },
    );
  }

  let payload: Parameters<typeof handleLineWebhook>[0];
  try {
    payload = JSON.parse(body) as Parameters<typeof handleLineWebhook>[0];
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await handleLineWebhook(payload);
  return NextResponse.json({ ok: true });
}