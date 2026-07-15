import { createAdminClient } from "@/services/supabase/admin";
import { safeNotifyMaintenanceReported } from "@/services/notificationService";
import type {
  MaintenanceTicketCategory,
  MaintenanceTicketRow,
  MaintenanceTicketStatus,
} from "@/services/types";

const MAINTENANCE_BUCKET = "maintenance";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const VALID_CATEGORIES = new Set<MaintenanceTicketCategory>([
  "ac",
  "plumbing",
  "electrical",
  "other",
]);

const VALID_STATUSES = new Set<MaintenanceTicketStatus>([
  "waiting",
  "in_progress",
  "done",
]);

function mapRow(row: Record<string, unknown>): MaintenanceTicketRow {
  const roomRaw = row.rooms as { room_number: string } | { room_number: string }[];
  const tenantRaw = row.tenants as { name: string } | { name: string }[];
  const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
  const tenant = Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw;

  return {
    id: String(row.id),
    property_id: String(row.property_id),
    room_id: String(row.room_id),
    tenant_id: String(row.tenant_id),
    category: row.category as MaintenanceTicketCategory,
    description: String(row.description),
    photo_url: row.photo_url ? String(row.photo_url) : null,
    status: row.status as MaintenanceTicketStatus,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    room_number: String(room?.room_number ?? ""),
    tenant_name: String(tenant?.name ?? ""),
  };
}

async function getPropertyId(propertySlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบหอพัก");
  return String(data.id);
}

export async function listPropertyMaintenanceTickets(
  propertySlug: string,
): Promise<MaintenanceTicketRow[]> {
  const propertyId = await getPropertyId(propertySlug);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("maintenance_tickets")
    .select(
      "*, rooms(room_number), tenants(name)",
    )
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function listTenantMaintenanceTickets(
  tenantId: string,
): Promise<MaintenanceTicketRow[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("maintenance_tickets")
    .select("*, rooms(room_number), tenants(name)")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function countWaitingMaintenanceTickets(
  propertySlug: string,
): Promise<number> {
  const propertyId = await getPropertyId(propertySlug);
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("maintenance_tickets")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId)
    .eq("status", "waiting");

  if (error) throw error;
  return count ?? 0;
}

export async function updateMaintenanceTicketStatus(input: {
  propertySlug: string;
  ticketId: string;
  status: MaintenanceTicketStatus;
}) {
  if (!VALID_STATUSES.has(input.status)) {
    throw new Error("สถานะไม่ถูกต้อง");
  }

  const propertyId = await getPropertyId(input.propertySlug);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("maintenance_tickets")
    .update({
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.ticketId)
    .eq("property_id", propertyId)
    .select(
      "*, rooms(room_number), tenants(name)",
    )
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบรายการแจ้งซ่อม");

  return mapRow(data as Record<string, unknown>);
}

export async function submitMaintenanceTicket(input: {
  tenantId: string;
  category: MaintenanceTicketCategory;
  description: string;
  photo?: File | null;
}) {
  if (!VALID_CATEGORIES.has(input.category)) {
    throw new Error("กรุณาเลือกหมวดปัญหา");
  }

  const description = input.description.trim();
  if (description.length < 3) {
    throw new Error("กรุณาอธิบายปัญหาสั้นๆ");
  }

  const supabase = createAdminClient();
  const { data: tenantRow, error: tenantError } = await supabase
    .from("tenants")
    .select("id, room_id")
    .eq("id", input.tenantId)
    .maybeSingle();

  if (tenantError) throw tenantError;
  if (!tenantRow) throw new Error("ไม่พบผู้เช่า");

  const roomId = String(tenantRow.room_id);
  const { data: roomRow, error: roomError } = await supabase
    .from("rooms")
    .select("property_id, properties(slug)")
    .eq("id", roomId)
    .maybeSingle();

  if (roomError) throw roomError;
  if (!roomRow) throw new Error("ไม่พบห้อง");

  const propertyId = String(roomRow.property_id);
  const propsRaw = roomRow.properties as { slug: string } | { slug: string }[] | null;
  const props = Array.isArray(propsRaw) ? propsRaw[0] : propsRaw;
  const propertySlug = String(props?.slug ?? "");

  let photoUrl: string | null = null;

  if (input.photo) {
    if (!input.photo.type.startsWith("image/")) {
      throw new Error("รองรับเฉพาะรูปภาพ");
    }
    if (input.photo.size > MAX_FILE_SIZE) {
      throw new Error("รูปใหญ่เกิน 5MB");
    }

    const extension = input.photo.name.split(".").pop() ?? "jpg";
    const path = `${propertySlug}/${roomId}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(MAINTENANCE_BUCKET)
      .upload(path, input.photo, {
        contentType: input.photo.type,
        upsert: false,
      });

    if (uploadError) throw new Error("อัปโหลดรูปไม่สำเร็จ");

    const { data: publicUrl } = supabase.storage
      .from(MAINTENANCE_BUCKET)
      .getPublicUrl(path);
    photoUrl = publicUrl.publicUrl;
  }

  const { data, error } = await supabase
    .from("maintenance_tickets")
    .insert({
      property_id: propertyId,
      room_id: roomId,
      tenant_id: input.tenantId,
      category: input.category,
      description,
      photo_url: photoUrl,
      status: "waiting",
    })
    .select(
      "*, rooms(room_number), tenants(name)",
    )
    .single();

  if (error) throw error;
  const ticket = mapRow(data as Record<string, unknown>);
  void safeNotifyMaintenanceReported(ticket.id);
  return ticket;
}
