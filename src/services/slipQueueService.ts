import type { MonthlyBillingRow } from "@/services/monthlyBillingService";

export type SlipQueueItem = {
  tenant_id: string;
  room_number: string;
  tenant_name: string;
  invoice_id: string;
  amount: number;
};

export function listSlipReviewQueue(rows: MonthlyBillingRow[]): SlipQueueItem[] {
  return rows
    .filter(
      (row): row is MonthlyBillingRow & { invoice_id: string } =>
        row.invoice_status === "scanning" && Boolean(row.invoice_id),
    )
    .map((row) => ({
      tenant_id: row.tenant_id,
      room_number: row.room_number,
      tenant_name: row.tenant_name,
      invoice_id: row.invoice_id,
      amount: row.invoice_total_amount ?? row.base_rent_price,
    }));
}
