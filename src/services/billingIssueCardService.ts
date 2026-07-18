import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import {
  isRowReadyToBill,
  type BillingReadinessOptions,
  type WaterBillingMode,
} from "@/services/propertyBillingSettingsService";
import { buildRoomRatesSnapshot } from "@/services/roomRatesDisplayService";

export type BillingRoomIssueCard = {
  tenantId: string;
  roomNumber: string;
  tenantName: string;
  rent: number;
  water: number | null;
  electric: number | null;
  total: number;
};

export function buildBillingRoomIssueCards(input: {
  rows: MonthlyBillingRow[];
  meters: Record<string, { water: string; electric: string }>;
  includeUtilities: boolean;
  waterBillingMode: WaterBillingMode;
  defaultWaterFlatBaht: number;
  waterRate: number;
  electricRate: number;
  readinessOptions?: BillingReadinessOptions;
}): BillingRoomIssueCard[] {
  const {
    rows,
    meters,
    includeUtilities,
    waterBillingMode,
    defaultWaterFlatBaht,
    waterRate,
    electricRate,
    readinessOptions,
  } = input;

  const cards: BillingRoomIssueCard[] = [];

  for (const row of rows) {
    const rowMeters = meters[row.tenant_id] ?? { water: "", electric: "" };
    if (
      !isRowReadyToBill(
        row,
        rowMeters,
        includeUtilities,
        readinessOptions,
      )
    ) {
      continue;
    }

    const snapshot = buildRoomRatesSnapshot({
      row,
      includeUtilities,
      waterBillingMode,
      defaultWaterFlatBaht,
      waterRate,
      electricRate,
      meters: rowMeters,
    });
    const month = snapshot.currentMonth;
    cards.push({
      tenantId: row.tenant_id,
      roomNumber: row.room_number,
      tenantName: row.tenant_name,
      rent: month?.rent ?? row.base_rent_price,
      water: month?.water ?? null,
      electric: month?.electric ?? null,
      total: month?.total ?? row.base_rent_price,
    });
  }

  return cards;
}
