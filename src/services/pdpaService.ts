import { createAdminClient } from "@/services/supabase/admin";

export async function recordPdpaConsent(tenantId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("tenants")
    .update({ pdpa_consented_at: new Date().toISOString() })
    .eq("id", tenantId)
    .is("pdpa_consented_at", null)
    .select("id, pdpa_consented_at")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("บันทึกความยินยอมไม่สำเร็จ");
  return data;
}
