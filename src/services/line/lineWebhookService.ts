import { buildDemoWelcomeMessages } from "@/services/line/demoFunnelService";
import { replyLineMessages } from "@/services/line/replyMessageService";

type LineWebhookEvent = {
  type: string;
  replyToken?: string;
  message?: { type: string; text?: string };
};

type LineWebhookPayload = {
  events?: LineWebhookEvent[];
};

function shouldSendDemoWelcome(event: LineWebhookEvent) {
  if (event.type === "follow") return true;
  if (event.type !== "message" || !event.replyToken) return false;
  if (event.message?.type === "text") return true;
  return event.message?.type === "sticker";
}

export async function handleLineWebhook(payload: LineWebhookPayload) {
  const events = payload.events ?? [];
  const results: Array<{ type: string; replied: boolean }> = [];

  for (const event of events) {
    if (!shouldSendDemoWelcome(event) || !event.replyToken) {
      results.push({ type: event.type, replied: false });
      continue;
    }

    try {
      await replyLineMessages(event.replyToken, buildDemoWelcomeMessages());
      results.push({ type: event.type, replied: true });
    } catch (error) {
      console.error("[lineWebhook]", event.type, error);
      results.push({ type: event.type, replied: false });
    }
  }

  return results;
}
