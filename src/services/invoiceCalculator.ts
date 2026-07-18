const WATER_RATE = 10;
const ELECTRIC_RATE = 7;

export function calculateMeterUnits(prev: number, curr: number) {
  if (!Number.isFinite(prev) || !Number.isFinite(curr)) {
    throw new Error("INVALID_METER_READING");
  }
  if (curr < prev) throw new Error("METER_ROLLED_BACK");
  return Math.round((curr - prev) * 100) / 100;
}

export function calculateInvoiceAmounts(
  baseRent: number,
  waterUnit: number,
  electricUnit: number,
  waterRate = WATER_RATE,
  electricRate = ELECTRIC_RATE,
) {
  const water_amount = waterUnit * waterRate;
  const electric_amount = electricUnit * electricRate;
  const total_amount = baseRent + water_amount + electric_amount;

  return { water_amount, electric_amount, total_amount };
}

export function sumExtraItems(
  items: { amount: number }[] | undefined,
) {
  return (items ?? []).reduce(
    (sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0),
    0,
  );
}

export function totalWithExtras(
  baseTotal: number,
  items: { amount: number }[] | undefined,
) {
  return baseTotal + sumExtraItems(items);
}

export function computeIssueAmounts(input: {
  baseRent: number;
  waterFlatBaht: number;
  electricPrev: number;
  electricCurr: number;
  electricRate: number;
}) {
  const electric_unit = calculateMeterUnits(
    input.electricPrev,
    input.electricCurr,
  );
  const electric_amount = electric_unit * input.electricRate;
  const water_amount = Math.max(0, input.waterFlatBaht);
  const water_unit = 0;
  const total_amount = input.baseRent + water_amount + electric_amount;

  return { water_unit, electric_unit, water_amount, electric_amount, total_amount };
}

export function calculateFromDialReadings(
  baseRent: number,
  waterPrev: number,
  waterCurr: number,
  electricPrev: number,
  electricCurr: number,
  waterRate = WATER_RATE,
  electricRate = ELECTRIC_RATE,
) {
  const water_unit = calculateMeterUnits(waterPrev, waterCurr);
  const electric_unit = calculateMeterUnits(electricPrev, electricCurr);
  const amounts = calculateInvoiceAmounts(
    baseRent,
    water_unit,
    electric_unit,
    waterRate,
    electricRate,
  );
  return { water_unit, electric_unit, ...amounts };
}

export function getCurrentBillingMonth() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export { WATER_RATE, ELECTRIC_RATE };
