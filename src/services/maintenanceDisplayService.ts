import type { Locale } from "@/services/i18n/messages";

const THAI_PHONE_RE = /(?:\+66|0)\d[\d\s-]{7,12}\d/;

function bangkokYmd(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${m}-${d}`;
}

function formatTime(iso: string, locale: Locale) {
  return new Date(iso).toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
}

export function formatMaintenanceReportedAt(iso: string, locale: Locale) {
  const date = new Date(iso);
  const today = bangkokYmd(new Date());
  const ticketDay = bangkokYmd(date);
  const time = formatTime(iso, locale);

  if (ticketDay === today) {
    return locale === "th" ? `วันนี้, ${time} น.` : `Today, ${time}`;
  }

  return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
}

export function joinTechnicianContact(
  name: string | null | undefined,
  phone: string | null | undefined,
) {
  const parts = [name?.trim(), phone?.trim()].filter(Boolean);
  return parts.join(" ");
}

export function splitTechnicianContact(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return { name: null as string | null, phone: null as string | null };
  }

  const match = trimmed.match(THAI_PHONE_RE);
  if (!match) {
    return { name: trimmed, phone: null as string | null };
  }

  const phone = match[0].replace(/\s/g, "");
  const name = trimmed.replace(match[0], "").replace(/\s+/g, " ").trim();
  return {
    name: name || null,
    phone,
  };
}
