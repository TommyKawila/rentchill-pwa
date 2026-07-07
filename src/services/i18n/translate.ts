import { messages, type Locale, type MessageKey } from "@/services/i18n/messages";

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
) {
  let text = messages[locale][key] ?? messages.th[key] ?? key;

  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(`{${name}}`, String(value));
    }
  }

  return text;
}

export function statusMessageKey(status: string): MessageKey {
  if (status === "pending") return "status.pending";
  if (status === "scanning") return "status.scanning";
  if (status === "paid") return "status.paid";
  return "status.pending";
}
