import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/services/supabase/admin";

const DEMO_OWNER_ID = "00000000-0000-0000-0000-000000000010";

export type OwnerAccount = {
  id: string;
  email: string;
  name: string;
};

function hashMatches(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function authenticateOwner(email: string, password: string) {
  const supabase = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("owners")
    .select("id, email, name, password_hash")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) throw error;
  if (!data || !hashMatches(password, String(data.password_hash))) {
    return null;
  }

  return {
    id: String(data.id),
    email: String(data.email),
    name: String(data.name),
  } satisfies OwnerAccount;
}

export function getDemoOwnerId() {
  return DEMO_OWNER_ID;
}
