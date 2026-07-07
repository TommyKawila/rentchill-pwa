import { getLineAccessToken, lineFetch } from "@/services/line/lineApiClient";

const LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";

export type LineReplyMessage =
  | { type: "text"; text: string }
  | { type: "flex"; altText: string; contents: Record<string, unknown> };

export async function replyLineMessages(
  replyToken: string,
  messages: LineReplyMessage[],
) {
  const accessToken = getLineAccessToken();
  if (!accessToken) throw new Error("LINE_CHANNEL_ACCESS_TOKEN not configured");

  await lineFetch(LINE_REPLY_URL, accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ replyToken, messages }),
  });
}
