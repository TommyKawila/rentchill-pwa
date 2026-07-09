import { createAdminClient } from "@/services/supabase/admin";

const TOKEN_TTL_MS = 15 * 60 * 1000;

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

function getConnectSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET not configured");
  return secret;
}

export async function createOwnerLineConnectToken(
  ownerId: string,
  propertySlug: string,
) {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `owner_connect:${ownerId}:${propertySlug}:${expiresAt}`;
  const signature = await signPayload(getConnectSecret(), payload);
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export async function verifyOwnerLineConnectToken(token: string) {
  const dotIndex = token.indexOf(".");
  if (dotIndex <= 0) return null;

  const encoded = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const payload = Buffer.from(encoded, "base64url").toString("utf8");
  const expected = await signPayload(getConnectSecret(), payload);
  if (signature !== expected) return null;

  const match = /^owner_connect:([^:]+):([^:]+):(\d+)$/.exec(payload);
  if (!match) return null;

  const [, ownerId, propertySlug, expiresAtRaw] = match;
  if (Date.now() > Number(expiresAtRaw)) return null;

  return { ownerId, propertySlug };
}

export async function linkOwnerLineUserId(
  propertySlug: string,
  ownerId: string,
  lineUserId: string,
) {
  const supabase = createAdminClient();

  const { data: property, error: readError } = await supabase
    .from("properties")
    .select("id, owner_id")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (readError) throw readError;
  if (!property) throw new Error("ไม่พบโครงการ");
  if (String(property.owner_id) !== ownerId) throw new Error("ไม่มีสิทธิ์");

  const { error: updateError } = await supabase
    .from("properties")
    .update({ owner_line_user_id: lineUserId.trim() })
    .eq("id", property.id);

  if (updateError) throw updateError;

  return { linked: true };
}
