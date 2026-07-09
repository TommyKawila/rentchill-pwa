import { hashPassword } from "@/services/ownerAuthService";
import { createAdminClient } from "@/services/supabase/admin";

export type SignupOwnerInput = {
  name: string;
  email: string;
  password: string;
};

export async function signupOwner({ name, email, password }: SignupOwnerInput) {
  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!trimmedName) throw new Error("NAME_REQUIRED");
  if (!normalizedEmail) throw new Error("EMAIL_REQUIRED");
  if (password.length < 8) throw new Error("PASSWORD_TOO_SHORT");

  const supabase = createAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("owners")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) throw new Error("EMAIL_EXISTS");

  const { data, error } = await supabase
    .from("owners")
    .insert({
      email: normalizedEmail,
      name: trimmedName,
      password_hash: hashPassword(password),
      plan_tier: "starter",
      status: "active",
    })
    .select("id, email, name")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "สมัครไม่สำเร็จ");
  }

  return {
    id: String(data.id),
    email: String(data.email),
    name: String(data.name),
  };
}
