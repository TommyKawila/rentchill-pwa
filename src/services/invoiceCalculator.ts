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
