import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import type { VacantRoomRow } from "@/services/vacantRoomService";

export type DashboardRevenueMetrics = {
  collected: number;
  target: number;
  progress: number;
};

export type DashboardOccupancyMetrics = {
  occupied: number;
  total: number;
};

export type CashFlowBentoMetrics = {
  expectedRevenue: number;
  netCashFlow: number;
  rentalYieldPct: number | null;
};

export function computeRevenueMetrics(
  rows: MonthlyBillingRow[],
): DashboardRevenueMetrics {
  let collected = 0;
  let target = 0;

  for (const row of rows) {
    if (!row.invoice_id) continue;
    const amount = row.invoice_total_amount ?? 0;
    target += amount;
    if (row.invoice_status === "paid") collected += amount;
  }

  const progress = target > 0 ? Math.min(1, collected / target) : 0;
  return { collected, target, progress };
}

export function computeOccupancyMetrics(
  occupiedCount: number,
  vacantRooms: VacantRoomRow[],
): DashboardOccupancyMetrics {
  const vacant = vacantRooms.length;
  const total = occupiedCount + vacant;
  return { occupied: occupiedCount, total: total > 0 ? total : occupiedCount };
}

export function computeCashFlowBento(
  rows: MonthlyBillingRow[],
  monthlyExpenses: number,
  assetValue: number | null,
): CashFlowBentoMetrics {
  const revenue = computeRevenueMetrics(rows);
  const expectedRevenue = revenue.target;
  const netCashFlow = revenue.collected - monthlyExpenses;
  const rentalYieldPct =
    assetValue != null && assetValue > 0
      ? Math.round(((expectedRevenue * 12) / assetValue) * 1000) / 10
      : null;

  return { expectedRevenue, netCashFlow, rentalYieldPct };
}
