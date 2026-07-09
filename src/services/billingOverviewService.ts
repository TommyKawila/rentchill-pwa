import type { MonthlyBillingRow } from "@/services/monthlyBillingService";

export type BillingOverview = {
  total: number;
  issued: number;
  notIssued: number;
  paid: number;
  unpaid: number;
  scanning: number;
};

export function computeBillingOverview(
  rows: MonthlyBillingRow[],
): BillingOverview {
  let issued = 0;
  let notIssued = 0;
  let paid = 0;
  let unpaid = 0;
  let scanning = 0;

  for (const row of rows) {
    if (row.invoice_id) {
      issued++;
      if (row.invoice_status === "paid") paid++;
      else if (row.invoice_status === "pending") unpaid++;
      else if (row.invoice_status === "scanning") scanning++;
    } else {
      notIssued++;
    }
  }

  return {
    total: rows.length,
    issued,
    notIssued,
    paid,
    unpaid,
    scanning,
  };
}
