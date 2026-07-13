export type TenantGender = "male" | "female" | "unknown";

export const TENANT_TITLE_OPTIONS = [
  { value: "นาย", gender: "male" as const },
  { value: "น.ส.", gender: "female" as const },
  { value: "นาง", gender: "female" as const },
  { value: "ด.ช.", gender: "male" as const },
  { value: "ด.ญ.", gender: "female" as const },
] as const;

const MALE_PREFIXES = new Set(["นาย", "ด.ช.", "mr", "mr."]);
const FEMALE_PREFIXES = new Set([
  "น.ส.",
  "นาง",
  "นางสาว",
  "ด.ญ.",
  "mrs",
  "mrs.",
  "ms",
  "ms.",
  "miss",
]);

function normalizePrefix(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function genderFromTitlePrefix(
  titlePrefix: string | null | undefined,
): TenantGender {
  const raw = titlePrefix?.trim();
  if (!raw) return "unknown";

  const key = normalizePrefix(raw);
  if (MALE_PREFIXES.has(key)) return "male";
  if (FEMALE_PREFIXES.has(key)) return "female";
  return "unknown";
}

export function formatTenantDisplayName(
  _titlePrefix: string | null | undefined,
  name: string,
) {
  return name.trim();
}
