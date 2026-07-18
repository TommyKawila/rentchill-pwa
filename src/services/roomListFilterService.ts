import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import {
  isRowEditable,
  isRowReadyToBill,
  isElectricDialComplete,
} from "@/services/propertyBillingSettingsService";

export type RoomListFilter =
  | "all"
  | "todo"
  | "notBilled"
  | "pendingMeter"
  | "unpaid"
  | "paid"
  | "scanning"
  | "vacant";

export type DashboardQuickFilter = "all" | "unpaid" | "scanning" | "vacant";

export const DASHBOARD_QUICK_FILTERS: DashboardQuickFilter[] = [
  "all",
  "unpaid",
  "scanning",
  "vacant",
];

export const ROOM_LIST_FILTERS: RoomListFilter[] = [
  "all",
  "todo",
  "notBilled",
  "pendingMeter",
  "unpaid",
  "paid",
  "scanning",
  "vacant",
];

export const ROOM_LIST_PAGE_SIZE = 20;
export const ROOM_LIST_TOOLBAR_MIN = 8;

export type RoomListFilterContext = {
  meters: Record<string, { water: string; electric: string }>;
  includeUtilities: boolean;
};

function rowMeters(ctx: RoomListFilterContext, tenantId: string) {
  return ctx.meters[tenantId] ?? { water: "", electric: "" };
}

export function isRoomTodo(
  row: MonthlyBillingRow,
  ctx: RoomListFilterContext,
): boolean {
  if (!row.invoice_id) return true;
  if (row.invoice_status === "scanning") return true;
  if (
    isRowEditable(row) &&
    !isRowReadyToBill(row, rowMeters(ctx, row.tenant_id), ctx.includeUtilities)
  ) {
    return true;
  }
  return false;
}

export function isPendingMeter(row: MonthlyBillingRow, ctx: RoomListFilterContext) {
  if (row.invoice_id) return false;
  if (!isRowEditable(row)) return false;
  if (!ctx.includeUtilities) return false;
  if (!row.electric_prev) return true;
  return !isElectricDialComplete(rowMeters(ctx, row.tenant_id).electric);
}

function matchesFilter(
  row: MonthlyBillingRow,
  filter: RoomListFilter,
  ctx: RoomListFilterContext,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "todo":
      return isRoomTodo(row, ctx);
    case "notBilled":
      return !row.invoice_id;
    case "pendingMeter":
      return isPendingMeter(row, ctx);
    case "unpaid":
      return row.invoice_status === "pending";
    case "paid":
      return row.invoice_status === "paid";
    case "scanning":
      return row.invoice_status === "scanning";
    case "vacant":
      return false;
    default:
      return true;
  }
}

export function matchesRoomQuery(
  row: MonthlyBillingRow,
  query: string,
  propertyName?: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    row.room_number.toLowerCase().includes(q) ||
    row.tenant_name.trim().toLowerCase().includes(q) ||
    (propertyName?.trim().toLowerCase().includes(q) ?? false)
  );
}

export function matchesVacantRoomQuery(
  roomNumber: string,
  query: string,
  propertyName?: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    roomNumber.toLowerCase().includes(q) ||
    (propertyName?.trim().toLowerCase().includes(q) ?? false)
  );
}

export function dashboardQuickCounts(
  rows: MonthlyBillingRow[],
  ctx: RoomListFilterContext,
  vacantCount: number,
): Record<DashboardQuickFilter, number> {
  const full = countByFilter(rows, ctx);
  return {
    all: full.all,
    unpaid: full.unpaid,
    scanning: full.scanning,
    vacant: vacantCount,
  };
}

export function filterRoomRows<T extends MonthlyBillingRow>(
  rows: T[],
  filter: RoomListFilter,
  query: string,
  ctx: RoomListFilterContext,
  propertyName?: string,
): T[] {
  return rows.filter(
    (row) =>
      matchesFilter(row, filter, ctx) &&
      matchesRoomQuery(row, query, propertyName),
  );
}

export function countByFilter<T extends MonthlyBillingRow>(
  rows: T[],
  ctx: RoomListFilterContext,
): Record<RoomListFilter, number> {
  return {
    all: rows.length,
    todo: rows.filter((row) => isRoomTodo(row, ctx)).length,
    notBilled: rows.filter((row) => !row.invoice_id).length,
    pendingMeter: rows.filter((row) => isPendingMeter(row, ctx)).length,
    unpaid: rows.filter((row) => row.invoice_status === "pending").length,
    paid: rows.filter((row) => row.invoice_status === "paid").length,
    scanning: rows.filter((row) => row.invoice_status === "scanning").length,
    vacant: 0,
  };
}

export function defaultRoomListFilter(
  counts: Record<RoomListFilter, number>,
): RoomListFilter {
  return counts.todo > 0 ? "todo" : "all";
}

export function roomFilterFromHash(hash: string): RoomListFilter | null {
  if (hash === "#billing-notBilled") return "notBilled";
  if (hash === "#billing-pendingMeter") return "pendingMeter";
  if (hash === "#billing-unpaid") return "unpaid";
  return null;
}

export function isRoomListScrollHash(hash: string): boolean {
  return (
    hash === "#billing" ||
    hash === "#billing-notBilled" ||
    hash === "#billing-pendingMeter" ||
    hash === "#billing-unpaid" ||
    hash === "#rooms" ||
    hash === "#owner-rooms"
  );
}

export function getFirstPendingMeterRoom<T extends MonthlyBillingRow>(
  rows: T[],
  ctx: RoomListFilterContext,
): T | null {
  const sorted = [...rows].sort((a, b) =>
    a.room_number.localeCompare(b.room_number, undefined, { numeric: true }),
  );

  for (const row of sorted) {
    if (isPendingMeter(row, ctx)) return row;
  }

  return null;
}

export function getNextPendingMeterRoom<T extends MonthlyBillingRow>(
  rows: T[],
  currentTenantId: string,
  ctx: RoomListFilterContext,
): T | null {
  const sorted = [...rows].sort((a, b) =>
    a.room_number.localeCompare(b.room_number, undefined, { numeric: true }),
  );
  const currentIndex = sorted.findIndex((row) => row.tenant_id === currentTenantId);
  const start = currentIndex < 0 ? 0 : currentIndex + 1;

  for (let i = start; i < sorted.length; i++) {
    const row = sorted[i];
    if (isPendingMeter(row, ctx)) return row;
  }

  return null;
}
