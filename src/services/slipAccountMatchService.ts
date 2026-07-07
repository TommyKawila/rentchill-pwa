import type { PropertyPaymentAccount } from "@/services/types";

export type SlipReceiver = {
  accountNumbers: string[];
  name: string | null;
  nameCandidates: string[];
};

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function accountsMatch(expected: string, slipAccount: string) {
  const expectedDigits = normalizeDigits(expected);
  const slipDigits = normalizeDigits(slipAccount);
  if (!expectedDigits || !slipDigits) return false;
  if (expectedDigits === slipDigits) return true;

  const tailLength = Math.min(6, expectedDigits.length, slipDigits.length);
  if (tailLength < 4) return false;

  return (
    expectedDigits.slice(-tailLength) === slipDigits.slice(-tailLength) ||
    expectedDigits.endsWith(slipDigits) ||
    slipDigits.endsWith(expectedDigits)
  );
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function namesMatch(expected: string, slipName: string) {
  const expectedName = normalizeName(expected);
  const actualName = normalizeName(slipName);
  if (!expectedName || !actualName) return false;
  if (expectedName === actualName) return true;
  return expectedName.includes(actualName) || actualName.includes(expectedName);
}

export function hasPaymentAccountConfigured(account: PropertyPaymentAccount) {
  return Boolean(account.prompt_pay?.trim() || account.bank_account?.trim());
}

export function matchSlipReceiver(
  account: PropertyPaymentAccount,
  receiver: SlipReceiver,
): { matched: boolean; message: string } {
  if (!hasPaymentAccountConfigured(account)) {
    return { matched: true, message: "ไม่ได้ตั้งบัญชีรับเงิน — ข้ามการเช็คผู้รับ" };
  }

  const expectedAccounts = [account.prompt_pay, account.bank_account].filter(
    (value): value is string => Boolean(value?.trim()),
  );

  const accountMatched = expectedAccounts.some((expected) =>
    receiver.accountNumbers.some((slipAccount) => accountsMatch(expected, slipAccount)),
  );

  if (!accountMatched) {
    return { matched: false, message: "บัญชีผู้รับไม่ตรงกับหอพัก" };
  }

  if (account.receiver_name?.trim()) {
    const candidates =
      receiver.nameCandidates.length > 0
        ? receiver.nameCandidates
        : receiver.name
          ? [receiver.name]
          : [];

    if (
      candidates.length > 0 &&
      !candidates.some((candidate) => namesMatch(account.receiver_name!, candidate))
    ) {
      return { matched: false, message: "ชื่อผู้รับไม่ตรงกับหอพัก" };
    }
  }

  return { matched: true, message: "บัญชีผู้รับตรงกับหอพัก" };
}
