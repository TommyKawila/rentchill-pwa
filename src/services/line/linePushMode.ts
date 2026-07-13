export type LinePushMode = "dry_run" | "redirect" | "live";

export function getLinePushMode(): LinePushMode {
  const raw = process.env.LINE_PUSH_MODE?.trim().toLowerCase();
  if (raw === "redirect" || raw === "live") return raw;
  if (raw === "dry_run") return "dry_run";
  if (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_DEV_TOOLS === "true"
  ) {
    return "dry_run";
  }
  return "live";
}

export function getLineTestRecipientId() {
  return process.env.LINE_TEST_RECIPIENT_ID?.trim() || null;
}

export function formatDryRunLineUserId(lineUserId: string) {
  return lineUserId.startsWith("dry:") ? lineUserId : `dry:${lineUserId}`;
}
