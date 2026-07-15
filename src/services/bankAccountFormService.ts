export function parseBankAccount(stored: string | null | undefined): {
  bankName: string;
  accountNumber: string;
} {
  const trimmed = stored?.trim() ?? "";
  if (!trimmed) {
    return { bankName: "", accountNumber: "" };
  }

  if (/^[\d-\s]+$/.test(trimmed)) {
    return { bankName: "", accountNumber: trimmed };
  }

  const match = trimmed.match(/^(.+?)\s+([\d][\d-\s]*)$/);
  if (match) {
    return {
      bankName: match[1].trim(),
      accountNumber: match[2].trim(),
    };
  }

  return { bankName: "", accountNumber: trimmed };
}

export function formatBankAccount(
  bankName: string,
  accountNumber: string,
): string | null {
  const bank = bankName.trim();
  const account = accountNumber.trim();
  if (!bank && !account) return null;
  if (!bank) return account;
  if (!account) return bank;
  return `${bank} ${account}`;
}

export function validatePaymentAccountInput(input: {
  bankName: string;
  accountNumber: string;
  receiverName: string;
}): "receiver" | "bankPair" | null {
  if (!input.receiverName.trim()) return "receiver";

  const hasBank = Boolean(input.bankName.trim());
  const hasAccount = Boolean(input.accountNumber.trim());
  if (hasBank !== hasAccount) return "bankPair";

  return null;
}
