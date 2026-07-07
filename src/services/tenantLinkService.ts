import { createAdminClient } from "@/services/supabase/admin";

function normalizeInviteCode(code: string) {
  return code.trim().toUpperCase();
}

export function buildTenantInviteUrl(inviteCode: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const path = `/board?invite=${encodeURIComponent(inviteCode)}`;
  return base ? `${base}${path}` : path;
}

export async function linkTenantByInviteCode(
  inviteCode: string,
  lineUserId: string,
) {
  const code = normalizeInviteCode(inviteCode);
  if (!code) throw new Error("กรุณากรอกรหัสเชิญ");
  if (!lineUserId) throw new Error("ไม่พบ LINE User ID");

  const supabase = createAdminClient();

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, name, line_user_id")
    .eq("invite_code", code)
    .maybeSingle();

  if (error) throw error;
  if (!tenant) throw new Error("รหัสเชิญไม่ถูกต้อง");

  if (tenant.line_user_id && tenant.line_user_id !== lineUserId) {
    throw new Error("ห้องนี้ผูก LINE อื่นแล้ว");
  }

  const { data: otherTenant, error: otherError } = await supabase
    .from("tenants")
    .select("id")
    .eq("line_user_id", lineUserId)
    .neq("id", tenant.id)
    .maybeSingle();

  if (otherError) throw otherError;
  if (otherTenant) throw new Error("LINE นี้ผูกห้องอื่นแล้ว");

  if (tenant.line_user_id === lineUserId) {
    return {
      tenant_id: String(tenant.id),
      tenant_name: String(tenant.name),
      already_linked: true,
    };
  }

  const { error: updateError } = await supabase
    .from("tenants")
    .update({ line_user_id: lineUserId })
    .eq("id", tenant.id);

  if (updateError) throw updateError;

  return {
    tenant_id: String(tenant.id),
    tenant_name: String(tenant.name),
    already_linked: false,
  };
}
