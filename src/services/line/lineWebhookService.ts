import {
  buildDemoPromptMessages,
  buildDemoWelcomeMessages,
  buildDemoWelcomeTextMessages,
  isDemoTriggerMessage,
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

async function sendDemoWelcome(replyToken: string) {
  try {
    await replyLineMessages(replyToken, buildDemoWelcomeMessages());
  } catch (flexError) {
    console.error("[lineWebhook] flex reply failed", flexError);
    await replyLineMessages(replyToken, buildDemoWelcomeTextMessages());
  }
}

export async function handleLineWebhook(payload: LineWebhookPayload) {
  const events = payload.events ?? [];
  const results: Array<{ type: string; replied: boolean }> = [];

  for (const event of events) {
    if (!event.replyToken) {
      results.push({ type: event.type, replied: false });
      continue;
    }

    try {
      if (event.type === "follow") {
        await replyLineMessages(event.replyToken, buildDemoPromptMessages());
        results.push({ type: event.type, replied: true });
        continue;
      }

      if (event.type !== "message" || event.message?.type !== "text") {
        results.push({ type: event.type, replied: false });
        continue;
      }

      const text = event.message.text ?? "";
      if (isDemoTriggerMessage(text)) {
        await sendDemoWelcome(event.replyToken);
        results.push({ type: event.type, replied: true });
        continue;
      }

      await replyLineMessages(event.replyToken, buildDemoPromptMessages());
      results.push({ type: event.type, replied: true });
    } catch (error) {
      console.error("[lineWebhook]", event.type, error);
      results.push({ type: event.type, replied: false });
    }
  }

  return results;
}
