import {
  buildDemoWelcomeMessages,
  buildDemoWelcomeTextMessages,
} from "@/services/line/demoFunnelService";
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
  return Boolean(event.message?.type);
}

async function sendDemoWelcome(replyToken: string) {
  try {
    await replyLineMessages(replyToken, buildDemoWelcomeMessages());
    return true;
  } catch (flexError) {
    console.error("[lineWebhook] flex reply failed", flexError);
    await replyLineMessages(replyToken, buildDemoWelcomeTextMessages());
    return true;
  }
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
      await sendDemoWelcome(event.replyToken);
      results.push({ type: event.type, replied: true });
    } catch (error) {
      console.error("[lineWebhook]", event.type, error);
      results.push({ type: event.type, replied: false });
    }
  }

  return results;
}
