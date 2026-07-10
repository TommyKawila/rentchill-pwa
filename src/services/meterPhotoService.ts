import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import {
  canBrowseMeterHistory,
  canTenantViewMeterPhotos,
  canUploadMeterPhoto,
  meterHistoryMonthLimit,
} from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";

const METER_BUCKET = "meters";

export type MeterUtilityType = "water" | "electric";
export type MeterPhotoRow = {
  id: string;
  utility_type: MeterUtilityType;
  billing_month: string;
  public_url: string;
  uploaded_by: "owner" | "tenant";
  created_at: string;
};

function monthKeyOffset(month: string, offset: number) {
  const [year, mon] = month.split("-").map(Number);
  const date = new Date(year, mon - 1 + offset, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function earliestAllowedMonth(tier: PlanTier, currentMonth: string) {
  const limit = meterHistoryMonthLimit(tier);
  if (limit === null) return null;
  return monthKeyOffset(currentMonth, -(limit - 1));
}

async function getPropertyContext(propertySlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, plan_tier")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบหอพัก");

  return {
    propertyId: String(data.id),
    planTier: String(data.plan_tier) as PlanTier,
  };
}

async function assertRoomInProperty(propertyId: string, roomId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id")
    .eq("id", roomId)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบห้อง");
}

function mapRow(row: Record<string, unknown>): MeterPhotoRow {
  return {
    id: String(row.id),
    utility_type: row.utility_type as MeterUtilityType,
    billing_month: String(row.billing_month),
    public_url: String(row.public_url),
    uploaded_by: row.uploaded_by as "owner" | "tenant",
    created_at: String(row.created_at),
  };
}

export async function uploadRoomMeterPhoto(input: {
  propertySlug: string;
  roomId: string;
  tenantId?: string | null;
  billingMonth: string;
  utilityType: MeterUtilityType;
  file: File;
  uploadedBy: "owner" | "tenant";
}) {
  const { propertyId, planTier } = await getPropertyContext(input.propertySlug);

  if (input.uploadedBy === "owner" && !canUploadMeterPhoto(planTier)) {
    throw new Error("PLAN_METER_PHOTO");
  }
  if (input.uploadedBy === "tenant" && !canTenantViewMeterPhotos(planTier)) {
    throw new Error("PLAN_METER_PHOTO");
  }

  await assertRoomInProperty(propertyId, input.roomId);

  const currentMonth = getCurrentBillingMonth();
  const earliest = earliestAllowedMonth(planTier, currentMonth);
  if (earliest && input.billingMonth < earliest) {
    throw new Error("METER_HISTORY_LIMIT");
  }
  if (!canBrowseMeterHistory(planTier) && input.billingMonth !== currentMonth) {
    throw new Error("METER_CURRENT_ONLY");
  }

  const extension = input.file.name.split(".").pop() ?? "jpg";
  const path = `${input.propertySlug}/${input.roomId}/${input.billingMonth}/${input.utilityType}/${Date.now()}.${extension}`;

  const supabase = createAdminClient();
  const { error: uploadError } = await supabase.storage
    .from(METER_BUCKET)
    .upload(path, input.file, { contentType: input.file.type, upsert: false });

  if (uploadError) throw new Error("อัปโหลดรูปมิเตอร์ไม่สำเร็จ");

  const { data: publicUrl } = supabase.storage.from(METER_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from("room_meter_media")
    .insert({
      property_id: propertyId,
      room_id: input.roomId,
      tenant_id: input.tenantId ?? null,
      billing_month: input.billingMonth,
      utility_type: input.utilityType,
      storage_path: path,
      public_url: publicUrl.publicUrl,
      uploaded_by: input.uploadedBy,
    })
    .select("id, utility_type, billing_month, public_url, uploaded_by, created_at")
    .single();

  if (error || !data) throw error ?? new Error("บันทึกรูปมิเตอร์ไม่สำเร็จ");
  return mapRow(data);
}

export async function listRoomMeterPhotos(input: {
  propertySlug: string;
  roomId: string;
  billingMonth?: string;
  forTenant?: boolean;
}) {
  const { propertyId, planTier } = await getPropertyContext(input.propertySlug);

  if (input.forTenant && !canTenantViewMeterPhotos(planTier)) {
    return [];
  }

  await assertRoomInProperty(propertyId, input.roomId);

  const currentMonth = getCurrentBillingMonth();
  const earliest = earliestAllowedMonth(planTier, currentMonth);

  const supabase = createAdminClient();
  let query = supabase
    .from("room_meter_media")
    .select("id, utility_type, billing_month, public_url, uploaded_by, created_at")
    .eq("room_id", input.roomId)
    .order("created_at", { ascending: false });

  if (input.billingMonth) {
    query = query.eq("billing_month", input.billingMonth);
  } else if (!canBrowseMeterHistory(planTier)) {
    query = query.eq("billing_month", currentMonth);
  } else if (earliest) {
    query = query.gte("billing_month", earliest);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getTenantMeterPhotos(input: {
  roomId: string;
  propertyId: string;
  billingMonth: string;
}) {
  const supabase = createAdminClient();
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("plan_tier")
    .eq("id", input.propertyId)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property) return [];

  const planTier = String(property.plan_tier) as PlanTier;
  if (!canTenantViewMeterPhotos(planTier)) return [];

  const { data, error } = await supabase
    .from("room_meter_media")
    .select("id, utility_type, billing_month, public_url, uploaded_by, created_at")
    .eq("room_id", input.roomId)
    .eq("billing_month", input.billingMonth)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}
