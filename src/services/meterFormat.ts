export function formatMeterDate(iso: string | null | undefined, locale = "th-TH") {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMeterNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "-";
  return value.toLocaleString("th-TH");
}
