/** Requires `NEXT_PUBLIC_PLATFORM_LINE_OA_URL` in .env / Vercel (e.g. https://line.me/ti/p/@YOUR_OA_ID). */
export function buildOverflowContactLineUrl(input: {
  ownerId: string;
  propertySlug?: string;
}): string | null {
  const base = process.env.NEXT_PUBLIC_PLATFORM_LINE_OA_URL?.trim().replace(/\/$/, "");
  if (!base) return null;

  const slugPart = input.propertySlug ? ` · โครงการ: ${input.propertySlug}` : "";
  const message = `สวัสดีครับ ต้องการขยายโควต้าเกิน 20 ห้อง — Owner ID: ${input.ownerId}${slugPart}`;

  if (base.includes("line.me/R/oaMessage/")) {
    return `${base}/?${encodeURIComponent(message)}`;
  }

  return `https://line.me/R/share?text=${encodeURIComponent(message)}`;
}
