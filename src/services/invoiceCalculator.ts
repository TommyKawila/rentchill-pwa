const WATER_RATE = 10;
const ELECTRIC_RATE = 7;

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

export function getCurrentBillingMonth() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export { WATER_RATE, ELECTRIC_RATE };
