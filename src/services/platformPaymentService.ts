import { createAdminClient } from "@/services/supabase/admin";
import type { PlanTier } from "@/services/propertyQuotaService";
import type { UpgradeTier } from "@/services/planTierService";

const SLIP_BUCKET = "slips";

export type OwnerSubscription = {
  plan_tier: PlanTier;
  status: "active" | "expired";
  expires_at: string | null;
  pending_payment: boolean;
};

export type PlatformPaymentRow = {
  id: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  plan_requested: UpgradeTier;
  slip_url: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export function getPlatformPaymentAccount() {
  return {
    prompt_pay: process.env.PLATFORM_PROMPTPAY ?? "0812345678",
    bank_account: process.env.PLATFORM_BANK_ACCOUNT ?? "123-4-56789-0",
    receiver_name: process.env.PLATFORM_RECEIVER_NAME ?? "RentChill Co., Ltd.",
  };
}

export async function getOwnerSubscription(ownerId: string): Promise<OwnerSubscription> {
  const supabase = createAdminClient();

  const { data: owner, error } = await supabase
    .from("owners")
    .select("plan_tier, status, expires_at")
    .eq("id", ownerId)
    .maybeSingle();

  if (error) throw error;
  if (!owner) throw new Error("ไม่พบบัญชีเจ้าของ");

  const { count } = await supabase
    .from("platform_payments")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .eq("status", "pending");

  return {
    plan_tier: String(owner.plan_tier) as PlanTier,
    status: String(owner.status) as OwnerSubscription["status"],
    expires_at: owner.expires_at ? String(owner.expires_at) : null,
    pending_payment: (count ?? 0) > 0,
  };
}

export async function submitPlatformPayment(
  ownerId: string,
  planRequested: UpgradeTier,
  file: File,
) {
  const supabase = createAdminClient();

  const { data: pending } = await supabase
    .from("platform_payments")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("status", "pending")
    .maybeSingle();

  if (pending) throw new Error("มีสลิปรอตรวจสอบอยู่แล้ว");

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `platform/${ownerId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(SLIP_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) throw new Error("อัปโหลดสลิปไม่สำเร็จ");

  const { data: publicUrl } = supabase.storage.from(SLIP_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from("platform_payments")
    .insert({
      owner_id: ownerId,
      plan_requested: planRequested,
      slip_url: publicUrl.publicUrl,
      status: "pending",
    })
    .select("id, plan_requested, status, created_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "บันทึกการชำระไม่สำเร็จ");

  return {
    id: String(data.id),
    plan_requested: String(data.plan_requested) as UpgradeTier,
    status: String(data.status),
    created_at: String(data.created_at),
  };
}

export async function listPendingPlatformPayments(): Promise<PlatformPaymentRow[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("platform_payments")
    .select(
      "id, owner_id, plan_requested, slip_url, status, created_at, owners(name, email)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const ownerRaw = row.owners as
      | { name: string; email: string }
      | { name: string; email: string }[]
      | null;
    const owner = Array.isArray(ownerRaw) ? ownerRaw[0] : ownerRaw;
    return {
      id: String(row.id),
      owner_id: String(row.owner_id),
      owner_name: owner?.name ?? "—",
      owner_email: owner?.email ?? "—",
      plan_requested: String(row.plan_requested) as UpgradeTier,
      slip_url: String(row.slip_url),
      status: String(row.status) as PlatformPaymentRow["status"],
      created_at: String(row.created_at),
    };
  });
}

export async function approvePlatformPayment(paymentId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("approve_platform_payment", {
    payment_id: paymentId,
  });

  if (error) {
    if (error.message.includes("PAYMENT_NOT_FOUND")) {
      throw new Error("ไม่พบรายการหรืออนุมัติแล้ว");
    }
    throw error;
  }
}
