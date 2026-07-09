import type { MessageKey } from "@/services/i18n/messages";

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "board",
  "settings",
  "dashboard",
  "billing",
  "import",
  "override",
  "login",
  "signup",
]);

export type SlugValidationError = "SLUG_FORMAT" | "SLUG_LENGTH" | "SLUG_RESERVED";

export function slugifyAscii(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugifyUnicode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateRandomSlugBase() {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `p-${suffix}`;
}

/** Client-side preview — server uses autoSlugFromNameServer for persistence. */
export function autoSlugFromName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "";

  const ascii = slugifyAscii(trimmed);
  if (ascii) return ascii;

  const unicode = slugifyUnicode(trimmed);
  if (unicode) return unicode;

  return generateRandomSlugBase();
}

/** Server-side auto slug with random fallback. */
export function autoSlugFromNameServer(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return generateRandomSlugBase();

  const ascii = slugifyAscii(trimmed);
  if (ascii) return ascii;

  const unicode = slugifyUnicode(trimmed);
  if (unicode) return unicode;

  return generateRandomSlugBase();
}

/** @deprecated use autoSlugFromName */
export function slugify(value: string) {
  return slugifyAscii(value);
}

/** @deprecated use autoSlugFromName */
export function slugFromPropertyName(name: string) {
  return autoSlugFromName(name);
}

export function normalizeManualSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function validateManualSlug(slug: string): SlugValidationError | null {
  const normalized = normalizeManualSlug(slug);
  if (normalized.length < 3 || normalized.length > 48) return "SLUG_LENGTH";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) return "SLUG_FORMAT";
  if (RESERVED_SLUGS.has(normalized)) return "SLUG_RESERVED";
  return null;
}

export function slugValidationMessageKey(
  code: SlugValidationError | "SLUG_TAKEN",
): MessageKey {
  switch (code) {
    case "SLUG_TAKEN":
      return "settings.projectSlugTaken";
    case "SLUG_RESERVED":
      return "settings.projectSlugReserved";
    case "SLUG_LENGTH":
      return "settings.projectSlugInvalidLength";
    default:
      return "settings.projectSlugInvalid";
  }
}
