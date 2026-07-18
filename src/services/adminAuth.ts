const SESSION_LABEL = "rentchill-admin-v1";
const COOKIE_NAME = "rc_admin";
import { getSuperadminOwnerId } from "@/services/superadminGuard";

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
    return getSuperadminOwnerId();
  }

  return null;
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

const OWNER_ONLY_PREFIXES = [
  "/dashboard",
  "/import",
  "/override",
  "/settings",
  "/billing",
  "/maintenance",
  "/analytics",
  "/api/import",
  "/api/billing",
  "/api/override",
  "/api/properties",
  "/api/owner",
  "/api/analytics",
  "/api/rooms",
  "/api/trial/set-plan",
  "/api/trial/status",
  "/api/push",
] as const;

const SUPERADMIN_ONLY_PREFIXES = [
  "/admin/slips",
  "/admin/line",
  "/admin/qa",
  "/api/admin/stats",
  "/api/admin/platform-payments",
  "/api/admin/dev",
] as const;

export function isSuperadminOnlyPath(pathname: string) {
  if (pathname === "/admin") return true;
  return SUPERADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isOwnerOnlyPath(pathname: string) {
  if (/^\/api\/tenants\/[^/]+\/profile$/.test(pathname)) return true;
  return OWNER_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function getLoginPathForProtectedRoute(pathname: string) {
  if (isSuperadminOnlyPath(pathname)) return "/admin/platform/login";
  return "/admin/login";
}

export function isAdminProtectedPath(pathname: string) {
  if (pathname === "/admin/login") return false;
  if (pathname === "/admin/platform/login") return false;
  if (pathname === "/admin/signup") return false;
  if (pathname === "/admin") return true;

  return (
    isOwnerOnlyPath(pathname) ||
    isSuperadminOnlyPath(pathname) ||
    (pathname.startsWith("/api/line/") &&
      !pathname.startsWith("/api/line/webhook"))
  );
}
