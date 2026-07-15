export function normalizeLineChatUrl(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  let url = trimmed;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("line.me")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function isValidLineChatUrl(raw: string | null | undefined): boolean {
  const trimmed = raw?.trim();
  if (!trimmed) return true;
  return normalizeLineChatUrl(trimmed) !== null;
}

export function validateTechnicianContactsLineUrls(
  contacts: Record<string, { line_url?: string | null } | undefined>,
): boolean {
  for (const entry of Object.values(contacts)) {
    if (!entry?.line_url?.trim()) continue;
    if (!isValidLineChatUrl(entry.line_url)) return false;
  }
  return true;
}
