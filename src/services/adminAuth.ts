const SESSION_LABEL = "rentchill-admin-v1";
const COOKIE_NAME = "rc_admin";
const DEMO_OWNER_ID = "00000000-0000-0000-0000-000000000010";

function bufferToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signPayload(secret: string, payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bufferToHex(signature);
}

export async function createOwnerSessionToken(ownerId: string, secret: string) {
  const signature = await signPayload(secret, `owner:${ownerId}`);
  return `${ownerId}.${signature}`;
}

export async function createLegacyAdminSessionToken(secret: string) {
  return signPayload(secret, SESSION_LABEL);
}

export async function isValidLegacyAdminSession(
  secret: string | undefined,
  token: string | undefined,
) {
  if (!secret || !token || token.includes(".")) return false;
  const expected = await createLegacyAdminSessionToken(secret);
  return token === expected;
}

export async function resolveOwnerSession(
  secret: string | undefined,
  token: string | undefined,
): Promise<string | null> {
  if (!secret || !token) return null;

  const dotIndex = token.indexOf(".");
  if (dotIndex > 0) {
    const ownerId = token.slice(0, dotIndex);
    const signature = token.slice(dotIndex + 1);
    const expected = await signPayload(secret, `owner:${ownerId}`);
    if (signature === expected) return ownerId;
  }

  if (await isValidLegacyAdminSession(secret, token)) {
    return DEMO_OWNER_ID;
  }

  return null;
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
    pathname.startsWith("/billing") ||
    pathname.startsWith("/admin/line") ||
    pathname.startsWith("/admin/slips") ||
    pathname.startsWith("/api/import") ||
    pathname.startsWith("/api/billing") ||
    pathname.startsWith("/api/admin/platform-payments") ||
    pathname.startsWith("/api/override") ||
    pathname.startsWith("/api/properties") ||
    (pathname.startsWith("/api/line/") &&
      !pathname.startsWith("/api/line/webhook"))
  );
}
