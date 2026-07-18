import {
  calculateFromDialReadings,
  computeIssueAmounts,
} from "@/services/invoiceCalculator";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import {
  isFlatWaterBilling,
  type WaterBillingMode,
} from "@/services/propertyBillingSettingsService";

export type RoomRatesCurrentMonth = {
  rent: number;
  water: number | null;
  waterUnits: number | null;
  electric: number | null;
  electricUnits: number | null;
  total: number | null;
  status: "issued" | "draft" | "none";
};

export type RoomRatesSnapshot = {
  rentMonthly: number;
  waterRateLine: string | null;
  electricRateLine: string | null;
  currentMonth: RoomRatesCurrentMonth | null;
};

function resolveMeterValues(
  row: MonthlyBillingRow,
  meters: { water: string; electric: string },
) {
  const water =
    meters.water.trim() !== ""
      ? Number(meters.water)
      : row.water_curr ?? null;
  const electric =
    meters.electric.trim() !== ""
      ? Number(meters.electric)
      : row.electric_curr ?? null;

  return { water, electric };
}

export function buildRoomRatesSnapshot(input: {
  row: MonthlyBillingRow;
  includeUtilities: boolean;
  waterBillingMode: WaterBillingMode;
  defaultWaterFlatBaht: number;
  waterRate: number;
  electricRate: number;
  meters?: { water: string; electric: string };
}): RoomRatesSnapshot {
  const {
    row,
    includeUtilities,
    waterBillingMode,
    defaultWaterFlatBaht,
    waterRate,
    electricRate,
  } = input;
  const meters = input.meters ?? { water: "", electric: "" };

  const rentMonthly = row.base_rent_price;

  if (!includeUtilities) {
    return {
      rentMonthly,
      waterRateLine: null,
      electricRateLine: null,
      currentMonth: {
        rent: rentMonthly,
        water: null,
        waterUnits: null,
        electric: null,
        electricUnits: null,
        total: row.invoice_total_amount ?? rentMonthly,
        status: row.invoice_status ? "issued" : "none",
      },
    };
  }

  const waterRateLine = isFlatWaterBilling(waterBillingMode)
    ? `flat:${defaultWaterFlatBaht}`
    : `meter:${waterRate}`;
  const electricRateLine = `meter:${electricRate}`;

  let water: number | null = null;
  let waterUnits: number | null = row.water_unit;
  let electric: number | null = null;
  let electricUnits: number | null = row.electric_unit;
  let total: number | null = row.invoice_total_amount;
  let status: RoomRatesCurrentMonth["status"] = "none";

  if (row.invoice_status) {
    status = "issued";
    if (isFlatWaterBilling(waterBillingMode)) {
      water = defaultWaterFlatBaht;
      waterUnits = null;
      if (electricUnits != null) {
        electric = electricUnits * electricRate;
      }
    } else if (waterUnits != null && electricUnits != null) {
      water = waterUnits * waterRate;
      electric = electricUnits * electricRate;
    }
  } else {
    const { water: waterCurr, electric: electricCurr } = resolveMeterValues(
      row,
      meters,
    );

    if (isFlatWaterBilling(waterBillingMode)) {
      if (electricCurr != null && row.electric_prev) {
        try {
          const computed = computeIssueAmounts({
            baseRent: rentMonthly,
            waterFlatBaht: defaultWaterFlatBaht,
            electricPrev: row.electric_prev.value,
            electricCurr,
            electricRate,
          });
          water = computed.water_amount;
          electric = computed.electric_amount;
          electricUnits = computed.electric_unit;
          total = computed.total_amount;
          status = "draft";
        } catch {
          /* invalid readings */
        }
      }
    } else if (
      waterCurr != null &&
      electricCurr != null &&
      row.water_prev &&
      row.electric_prev
    ) {
      try {
        const computed = calculateFromDialReadings(
          rentMonthly,
          row.water_prev.value,
          waterCurr,
          row.electric_prev.value,
          electricCurr,
          waterRate,
          electricRate,
        );
        water = computed.water_amount;
        electric = computed.electric_amount;
        waterUnits = computed.water_unit;
        electricUnits = computed.electric_unit;
        total = computed.total_amount;
        status = "draft";
      } catch {
        /* invalid readings */
      }
    }
  }

  const currentMonth: RoomRatesCurrentMonth | null =
    status === "none" && total == null
      ? null
      : {
          rent: rentMonthly,
          water,
          waterUnits,
          electric,
          electricUnits,
          total: total ?? rentMonthly,
          status,
        };

  return {
    rentMonthly,
    waterRateLine,
    electricRateLine,
    currentMonth,
  };
}

export function formatBaht(amount: number, locale: "th" | "en") {
  return amount.toLocaleString(locale === "th" ? "th-TH" : "en-US");
}
