import { getLineAccessToken, lineFetch } from "@/services/line/lineApiClient";
import {
  getLinePushMode,
  getLineTestRecipientId,
  type LinePushMode,
} from "@/services/line/linePushMode";

const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";

export type LineTextMessage = { type: "text"; text: string };

export type LinePushResult =
  | { sent: true; simulated?: boolean; mode: LinePushMode; recipient: string }
  | { sent: false; reason: "no_token" | "no_recipient" };

export function resolveLinePushRecipient(
  lineUserId: string,
  messages: LineTextMessage[],
  roomLabel?: string,
): { recipient: string; messages: LineTextMessage[]; simulated: boolean } {
  const mode = getLinePushMode();

  if (mode === "dry_run") {
    return { recipient: lineUserId, messages, simulated: true };
  }

  if (mode === "redirect") {
    const testId = getLineTestRecipientId();
    if (!testId) {
      return { recipient: lineUserId, messages, simulated: false };
    }
    const prefix = roomLabel ? `[TEST ${roomLabel}] ` : "[TEST] ";
    return {
      recipient: testId,
      messages: messages.map((msg) => ({
        ...msg,
        text: `${prefix}${msg.text}`,
      })),
      simulated: false,
    };
  }

  return { recipient: lineUserId, messages, simulated: false };
}

export async function pushLineMessages(
  lineUserId: string,
  messages: LineTextMessage[],
  options?: { roomLabel?: string },
): Promise<LinePushResult> {
  if (!lineUserId) {
    return { sent: false, reason: "no_recipient" };
  }

  const mode = getLinePushMode();
  const resolved = resolveLinePushRecipient(
    lineUserId,
    messages,
    options?.roomLabel,
  );

  if (mode === "dry_run") {
    return {
      sent: true,
      simulated: true,
      mode,
      recipient: resolved.recipient,
    };
  }

  const accessToken = getLineAccessToken();
  if (!accessToken) return { sent: false, reason: "no_token" };

  await lineFetch(LINE_PUSH_URL, accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: resolved.recipient, messages: resolved.messages }),
  });

  return {
    sent: true,
    simulated: false,
    mode,
    recipient: resolved.recipient,
  };
}
