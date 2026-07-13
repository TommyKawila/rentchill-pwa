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

export type OverviewSegmentKey = "notIssued" | "paid" | "unpaid" | "scanning";

export const OVERVIEW_SEGMENT_ORDER: OverviewSegmentKey[] = [
  "notIssued",
  "paid",
  "unpaid",
  "scanning",
];

export type OverviewSegment = {
  key: OverviewSegmentKey;
  value: number;
  ratio: number;
};

export function getOverviewSegments(overview: BillingOverview): OverviewSegment[] {
  const total = overview.total;
  return OVERVIEW_SEGMENT_ORDER.map((key) => ({
    key,
    value: overview[key],
    ratio: total > 0 ? overview[key] / total : 0,
  }));
}

export function getOverviewSummary(
  overview: BillingOverview,
  labels: Record<OverviewSegmentKey, string>,
): string {
  return getOverviewSegments(overview)
    .filter((s) => s.value > 0)
    .map((s) => `${labels[s.key]} ${s.value}`)
    .join(", ");
}
