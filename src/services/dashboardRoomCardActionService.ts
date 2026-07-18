import type { MonthlyBillingRow } from "@/services/monthlyBillingService";

export type DashboardRoomCardAction = "remind" | "review" | "manage_vacant";

export function resolveDashboardRoomCardAction(
  row: MonthlyBillingRow,
): DashboardRoomCardAction | null {
  if (row.invoice_status === "scanning") return "review";
  if (row.invoice_status === "pending" && row.reminder_can_send) return "remind";
  return null;
}

export function resolveDashboardRoomAmountDue(row: MonthlyBillingRow): number {
  return row.invoice_total_amount ?? row.base_rent_price;
}
