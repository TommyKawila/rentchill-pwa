import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import { notifyPaymentReminder } from "@/services/notificationService";
import { getPropertyQuota } from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";

export type ReminderTarget = {
  tenant_id: string;
  tenant_name: string;
  room_number: string;
  total_amount: number;
  line_user_id: string;
};

export async function getPendingReminderTargets(propertySlug: string) {
  const billingMonth = getCurrentBillingMonth();
  const supabase = createAdminClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property) throw new Error("ไม่พบหอพัก");

  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, total_amount, tenant_id, tenants!inner(id, name, line_user_id), rooms!inner(room_number)",
    )
    .eq("property_id", property.id)
    .eq("billing_month", billingMonth)
    .eq("status", "pending");

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const tenantRaw = row.tenants as
        | { id: string; name: string; line_user_id: string }
        | { id: string; name: string; line_user_id: string }[];
      const roomRaw = row.rooms as { room_number: string } | { room_number: string }[];
      const tenant = Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw;
      const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
      if (!tenant?.line_user_id) return null;

      return {
        tenant_id: String(tenant.id),
        tenant_name: String(tenant.name),
        room_number: String(room.room_number),
        total_amount: Number(row.total_amount),
        line_user_id: String(tenant.line_user_id),
      } satisfies ReminderTarget;
    })
    .filter((row): row is ReminderTarget => row !== null)
    .sort((a, b) => a.room_number.localeCompare(b.room_number, "th"));
}

export async function sendPaymentReminder(
  propertySlug: string,
  tenantId: string,
) {
  const billingMonth = getCurrentBillingMonth();
  const targets = await getPendingReminderTargets(propertySlug);
  const target = targets.find((row) => row.tenant_id === tenantId);

  if (!target) {
    throw new Error("ไม่พบบิลรอชำระสำหรับลูกบ้านนี้");
  }

  await notifyPaymentReminder({
    propertySlug,
    lineUserId: target.line_user_id,
    roomNumber: target.room_number,
    billingMonth,
    totalAmount: target.total_amount,
  });

  const quota = await getPropertyQuota(propertySlug);
  return { sent: true as const, tenant_name: target.tenant_name, quota };
}
