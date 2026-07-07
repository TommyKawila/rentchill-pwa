const SESSION_LABEL = "rentchill-admin-v1";
const COOKIE_NAME = "rc_admin";

function bufferToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createAdminSessionToken(secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(SESSION_LABEL),
  );
  return bufferToHex(signature);
}

export async function isValidAdminSession(
  secret: string | undefined,
  token: string | undefined,
) {
  if (!secret || !token) return false;
  const expected = await createAdminSessionToken(secret);
  return token === expected;
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function isAdminProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/import") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/override") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin/line") ||
    pathname.startsWith("/api/import") ||
    pathname.startsWith("/api/billing") ||
    pathname.startsWith("/api/override") ||
    pathname.startsWith("/api/properties") ||
    pathname.startsWith("/api/line/")
  );
}
