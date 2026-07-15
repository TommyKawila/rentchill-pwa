import type { AuditLogRow } from "@/services/auditLogService";

export type AuditLogCategory = "all" | "billing" | "payment" | "meter";

const BILLING_ACTIONS = new Set(["invoice.issue"]);
const PAYMENT_ACTIONS = new Set([
  "invoice.approve",
  "invoice.reject",
  "invoice.remind",
]);
const METER_ACTIONS = new Set(["meter.draft", "meter.baseline", "meter.upload"]);

export function getAuditLogCategory(action: string): AuditLogCategory | "other" {
  if (BILLING_ACTIONS.has(action)) return "billing";
  if (PAYMENT_ACTIONS.has(action)) return "payment";
  if (METER_ACTIONS.has(action)) return "meter";
  return "other";
}

export function filterAuditByCategory(
  entries: AuditLogRow[],
  category: AuditLogCategory,
): AuditLogRow[] {
  if (category === "all") return entries;
  return entries.filter((entry) => getAuditLogCategory(entry.action) === category);
}

export function countAuditByCategory(
  entries: AuditLogRow[],
): Record<AuditLogCategory, number> {
  const counts: Record<AuditLogCategory, number> = {
    all: entries.length,
    billing: 0,
    payment: 0,
    meter: 0,
  };

  for (const entry of entries) {
    const category = getAuditLogCategory(entry.action);
    if (category !== "other") counts[category]++;
  }

  return counts;
}

const SLIP_APPROVE_METHODS = new Set([
  "manual_slip",
  "slip_review_manual",
  "slip_review_auto",
]);

export function canShowAuditEvidence(entry: AuditLogRow): boolean {
  const detail = entry.detail;
  const invoiceId = detail?.invoice_id;
  if (typeof invoiceId !== "string" || !invoiceId.trim()) return false;

  if (entry.action === "invoice.reject") {
    const note = detail?.note;
    return typeof note === "string" && note.trim().length > 0;
  }

  if (entry.action === "invoice.approve") {
    const method = detail?.method;
    if (typeof method === "string" && SLIP_APPROVE_METHODS.has(method)) return true;
    if (detail?.has_proof === true) return true;
    const note = detail?.note;
    return typeof note === "string" && note.trim().length > 0;
  }

  return false;
}

export function getAuditEvidenceInvoiceId(entry: AuditLogRow): string | null {
  const invoiceId = entry.detail?.invoice_id;
  return typeof invoiceId === "string" && invoiceId.trim() ? invoiceId : null;
}

export function getAuditEvidenceTransRef(entry: AuditLogRow): string | null {
  const transRef = entry.detail?.trans_ref;
  return typeof transRef === "string" && transRef.trim() ? transRef.trim() : null;
}

export function getAuditEvidenceNote(entry: AuditLogRow): string | null {
  const note = entry.detail?.note;
  return typeof note === "string" && note.trim() ? note.trim() : null;
}
