import {
  buildDemoPromptMessages,
  buildDemoWelcomeTextMessages,
  isDemoTriggerMessage,
} from "@/services/line/demoFunnelService";
import { pushLineMessages } from "@/services/line/pushMessageService";
import {
  replyLineMessages,
  type LineReplyMessage,
} from "@/services/line/replyMessageService";

type LineWebhookEvent = {
  type: string;
  replyToken?: string;
  source?: { userId?: string; type?: string };
  message?: { type: string; text?: string };
};

type LineWebhookPayload = {
  events?: LineWebhookEvent[];
};

async function deliverMessages(
  replyToken: string,
  lineUserId: string | undefined,
  messages: LineReplyMessage[],
) {
  try {
    await replyLineMessages(replyToken, messages);
    return;
  } catch (replyError) {
    console.error("[lineWebhook] reply failed", replyError);
    if (!lineUserId) throw replyError;

    const textMessages = messages.flatMap((message) =>
      message.type === "text" ? [message] : [],
    );
    if (textMessages.length === 0) {
      throw replyError;
    }

    await pushLineMessages(lineUserId, textMessages);
  }
}

export async function handleLineWebhook(payload: LineWebhookPayload) {
  const events = payload.events ?? [];
  const results: Array<{ type: string; replied: boolean; error?: string }> = [];

  for (const event of events) {
    if (!event.replyToken) {
      results.push({ type: event.type, replied: false });
      continue;
    }

    const lineUserId = event.source?.userId;

    try {
      if (event.type === "follow") {
        await deliverMessages(
          event.replyToken,
          lineUserId,
          buildDemoPromptMessages(),
        );
        results.push({ type: event.type, replied: true });
        continue;
      }

      if (event.type !== "message" || event.message?.type !== "text") {
        results.push({ type: event.type, replied: false });
        continue;
      }

      const text = event.message.text ?? "";
      if (isDemoTriggerMessage(text)) {
        await deliverMessages(
          event.replyToken,
          lineUserId,
          buildDemoWelcomeTextMessages(),
        );
        results.push({ type: event.type, replied: true });
        continue;
      }

      await deliverMessages(
        event.replyToken,
        lineUserId,
        buildDemoPromptMessages(),
      );
      results.push({ type: event.type, replied: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "reply failed";
      console.error("[lineWebhook]", event.type, message);
      results.push({ type: event.type, replied: false, error: message });
    }
  }

  return results;
}
