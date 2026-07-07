import { getLineAccessToken, lineFetch } from "@/services/line/lineApiClient";

const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";

export type LineTextMessage = { type: "text"; text: string };

export async function pushLineMessages(
  lineUserId: string,
  messages: LineTextMessage[],
) {
  const accessToken = getLineAccessToken();
  if (!accessToken) return { sent: false as const, reason: "no_token" as const };

  await lineFetch(LINE_PUSH_URL, accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: lineUserId, messages }),
  });

  return { sent: true as const };
}
