import type { BillingMonthDisplayFormat } from "@/services/billingMonthDisplayService";
import type { PropertyMarketing } from "@/services/propertyMarketingService";
import { normalizeLineChatUrl } from "@/services/technicianLineService";
import type {
  PropertyPaymentAccount,
  TechnicianContacts,
  TechnicianDept,
} from "@/services/types";

function maskDigits(value: string, visibleTail = 4): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/\s/g, "");
  if (digits.length <= visibleTail + 2) return trimmed;
  return `${digits.slice(0, 3)}…${digits.slice(-visibleTail)}`;
}

function maskBankAccount(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    const bank = parts[0];
    const account = parts.slice(1).join("");
    if (account.length <= 4) return trimmed;
    return `${bank} …${account.slice(-4)}`;
  }
  if (trimmed.length <= 6) return trimmed;
  return `…${trimmed.slice(-4)}`;
}

export function buildPaymentAccountSummary(
  account: PropertyPaymentAccount | null,
): string {
  if (!account) return "";
  const parts: string[] = [];
  if (account.prompt_pay?.trim()) {
    parts.push(`PromptPay ${maskDigits(account.prompt_pay)}`);
  }
  const activeBank = account.bank_account?.trim();
  if (activeBank) {
    parts.push(maskBankAccount(activeBank));
  }
  if (account.bank_accounts.length > 1) {
    parts.push(`${account.bank_accounts.length} บัญชี`);
  }
  if (parts.length === 0) {
    return account.receiver_name?.trim() || "";
  }
  return parts.join(" · ");
}

const MONTH_FORMAT_LABEL: Record<BillingMonthDisplayFormat, string> = {
  thaiBe: "settings.monthFormat.thaiBe",
  thaiCe: "settings.monthFormat.thaiCe",
  iso: "settings.monthFormat.iso",
};

export function buildDisplaySummaryParts(
  format: BillingMonthDisplayFormat,
  easyMode: boolean,
): { formatKey: string; easyOn: boolean } {
  return {
    formatKey: MONTH_FORMAT_LABEL[format],
    easyOn: easyMode,
  };
}

export function buildMarketingSummary(marketing: PropertyMarketing | null): string {
  if (!marketing) return "";
  const parts: string[] = [];
  const photoCount = marketing.gallery_urls?.length ?? 0;
  if (photoCount > 0) {
    parts.push(`${photoCount} รูป`);
  }
  const address = marketing.marketing_address?.trim();
  if (address) {
    parts.push(address.length > 24 ? `${address.slice(0, 24)}…` : address);
  }
  if (parts.length === 0 && marketing.marketing_description?.trim()) {
    const desc = marketing.marketing_description.trim();
    parts.push(desc.length > 32 ? `${desc.slice(0, 32)}…` : desc);
  }
  return parts.join(" · ");
}

export function buildContactSummary(account: PropertyPaymentAccount | null): string {
  if (!account) return "";
  const parts: string[] = [];
  if (account.contact_line_url?.trim() || account.contact_line_qr_url?.trim()) {
    parts.push("LINE ✓");
  }
  if (account.contact_phone?.trim()) {
    parts.push(maskDigits(account.contact_phone));
  }
  return parts.join(" · ");
}

export function buildNotifySummary(
  lineConnected: boolean,
  pushPermission: NotificationPermission | "unsupported",
): { lineConnected: boolean; pushEnabled: boolean; pushUnsupported: boolean } {
  return {
    lineConnected,
    pushEnabled: pushPermission === "granted",
    pushUnsupported: pushPermission === "unsupported",
  };
}

export function normalizeTechnicianContacts(
  raw: unknown,
  legacyPhone: string | null,
): TechnicianContacts {
  const contacts: TechnicianContacts = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const dept of ["electrical", "plumbing", "internet"] as const) {
      const entry = (raw as Record<string, unknown>)[dept];
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
      const phone =
        "phone" in entry && entry.phone != null
          ? String(entry.phone).trim() || null
          : null;
      const line_url =
        "line_url" in entry && entry.line_url != null
          ? normalizeLineChatUrl(String(entry.line_url))
          : null;
      const display_name =
        "display_name" in entry && entry.display_name != null
          ? String(entry.display_name).trim() || null
          : null;
      if (phone || line_url || display_name) {
        contacts[dept] = { phone, line_url, display_name };
      }
    }
  }
  if (
    !contacts.plumbing?.phone &&
    legacyPhone?.trim() &&
    Object.keys(contacts).length === 0
  ) {
    contacts.plumbing = {
      phone: legacyPhone.trim(),
      line_url: null,
      display_name: null,
    };
  }
  return contacts;
}

export function formatTechnicianSummaryEntry(
  deptLabel: string,
  contact: TechnicianContacts[TechnicianDept] | undefined,
): string | null {
  if (!contact) return null;
  const hasData =
    contact.phone?.trim() ||
    contact.line_url?.trim() ||
    contact.display_name?.trim();
  if (!hasData) return null;
  const name = contact.display_name?.trim();
  return name ? `${deptLabel}: ${name}` : deptLabel;
}
