import {
  formatBankAccount,
  parseBankAccount,
  validatePaymentAccountInput,
} from "@/services/bankAccountFormService";
import type { PropertyBankAccount } from "@/services/types";

export function createBankAccountId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `bank-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function sanitizeBankAccountEntry(raw: unknown): PropertyBankAccount | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const bank_account =
    typeof row.bank_account === "string" ? row.bank_account.trim() : "";
  const receiver_name =
    typeof row.receiver_name === "string" ? row.receiver_name.trim() : "";
  const id = typeof row.id === "string" && row.id.trim() ? row.id.trim() : createBankAccountId();
  const label =
    typeof row.label === "string" && row.label.trim() ? row.label.trim() : null;

  if (!bank_account && !receiver_name) return null;

  return {
    id,
    bank_account,
    receiver_name,
    label,
  };
}

export function normalizePaymentBankAccounts(
  raw: unknown,
  legacyBank: string | null,
  legacyReceiver: string | null,
): PropertyBankAccount[] {
  if (Array.isArray(raw)) {
    const parsed = raw
      .map(sanitizeBankAccountEntry)
      .filter((entry): entry is PropertyBankAccount => Boolean(entry));
    if (parsed.length > 0) return parsed;
  }

  const bank = legacyBank?.trim() ?? "";
  const receiver = legacyReceiver?.trim() ?? "";
  if (!bank && !receiver) return [];

  return [
    {
      id: createBankAccountId(),
      bank_account: bank,
      receiver_name: receiver,
      label: null,
    },
  ];
}

export function resolveActiveBankAccountId(
  accounts: PropertyBankAccount[],
  activeId: string | null | undefined,
): string | null {
  if (accounts.length === 0) return null;
  if (activeId && accounts.some((entry) => entry.id === activeId)) return activeId;
  return accounts[0]?.id ?? null;
}

export function getActiveBankAccount(
  accounts: PropertyBankAccount[],
  activeId: string | null | undefined,
): PropertyBankAccount | null {
  const id = resolveActiveBankAccountId(accounts, activeId);
  if (!id) return null;
  return accounts.find((entry) => entry.id === id) ?? null;
}

export function legacyPaymentFromActive(
  accounts: PropertyBankAccount[],
  activeId: string | null | undefined,
): { bank_account: string | null; receiver_name: string | null; active_bank_account_id: string | null } {
  const active = getActiveBankAccount(accounts, activeId);
  return {
    bank_account: active?.bank_account?.trim() || null,
    receiver_name: active?.receiver_name?.trim() || null,
    active_bank_account_id: resolveActiveBankAccountId(accounts, activeId),
  };
}

export function validateBankAccountEntry(input: {
  bankName: string;
  accountNumber: string;
  receiverName: string;
}): "receiver" | "bankPair" | null {
  return validatePaymentAccountInput(input);
}

export function validateBankAccountsList(
  accounts: PropertyBankAccount[],
  activeId: string | null | undefined,
): "receiver" | "bankPair" | "emptyActive" | null {
  if (accounts.length === 0) return null;

  for (const entry of accounts) {
    const parsed = parseBankAccount(entry.bank_account);
    const issue = validatePaymentAccountInput({
      bankName: parsed.bankName,
      accountNumber: parsed.accountNumber,
      receiverName: entry.receiver_name,
    });
    if (issue) return issue;
  }

  if (!resolveActiveBankAccountId(accounts, activeId)) return "emptyActive";
  return null;
}

export function buildBankAccountEntry(input: {
  id?: string;
  bankName: string;
  accountNumber: string;
  receiverName: string;
  label?: string | null;
}): PropertyBankAccount | null {
  const bank_account = formatBankAccount(input.bankName, input.accountNumber);
  const receiver_name = input.receiverName.trim();
  if (!bank_account && !receiver_name) return null;

  return {
    id: input.id ?? createBankAccountId(),
    bank_account: bank_account ?? "",
    receiver_name,
    label: input.label?.trim() || null,
  };
}

export function summarizeBankAccount(entry: PropertyBankAccount): string {
  const bank = entry.bank_account.trim();
  const receiver = entry.receiver_name.trim();
  if (bank && receiver) return `${bank} · ${receiver}`;
  return bank || receiver;
}
