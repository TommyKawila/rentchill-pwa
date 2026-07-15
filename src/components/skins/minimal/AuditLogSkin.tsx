"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  filterAuditEntriesForDisplay,
  type AuditLogRow,
} from "@/services/auditLogService";
import {
  countAuditByCategory,
  filterAuditByCategory,
  getAuditLogCategory,
  canShowAuditEvidence,
  getAuditEvidenceInvoiceId,
  getAuditEvidenceTransRef,
  getAuditEvidenceNote,
  type AuditLogCategory,
} from "@/services/auditLogCategories";
import { canUseAuditLog } from "@/services/planLimits";
import type { MessageKey } from "@/services/i18n/messages";
import type { PlanTier } from "@/services/propertyQuotaService";
import { AuditEvidenceSheetSkin } from "@/components/skins/minimal/AuditEvidenceSheetSkin";

interface AuditLogSkinProps {
  planTier: PlanTier;
  entries: AuditLogRow[];
  loading?: boolean;
  error?: string | null;
}

const ACTION_KEYS: Record<string, MessageKey> = {
  "meter.upload": "owner.audit.meterUpload",
  "meter.baseline": "owner.audit.meterBaseline",
  "meter.draft": "owner.audit.meterDraft",
  "document.upload": "owner.audit.documentUpload",
  "document.delete": "owner.audit.documentDelete",
  "deposit.update": "owner.audit.depositUpdate",
  "invoice.approve": "owner.audit.invoiceApprove",
  "invoice.issue": "owner.audit.invoiceIssue",
  "invoice.reject": "owner.audit.invoiceReject",
  "invoice.remind": "owner.audit.invoiceRemind",
  "invoice.meters": "owner.audit.invoiceMeters",
};

const FILTER_CHIPS: Array<{ id: AuditLogCategory; labelKey: MessageKey }> = [
  { id: "all", labelKey: "owner.audit.filterAll" },
  { id: "billing", labelKey: "owner.audit.filterBilling" },
  { id: "payment", labelKey: "owner.audit.filterPayment" },
  { id: "meter", labelKey: "owner.audit.filterMeter" },
];

const VISIBLE_LIMIT = 8;

function formatEntryTime(createdAt: string) {
  return new Date(createdAt).toLocaleString("th-TH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function categoryBadgeKey(
  category: ReturnType<typeof getAuditLogCategory>,
): MessageKey | null {
  if (category === "billing") return "owner.audit.categoryBilling";
  if (category === "payment") return "owner.audit.categoryPayment";
  if (category === "meter") return "owner.audit.categoryMeter";
  return null;
}

function formatAuditDetail(
  entry: AuditLogRow,
  t: ReturnType<typeof useLocale>["t"],
) {
  const detail = entry.detail;
  if (!detail) return null;

  if (entry.action === "invoice.approve" || entry.action === "invoice.issue") {
    const parts: string[] = [];
    const month = detail.billing_month;
    if (typeof month === "string" && month.trim()) {
      parts.push(t("owner.audit.detailBillingMonth", { month }));
    }
    const total = detail.total_amount;
    if (typeof total === "number" && Number.isFinite(total)) {
      parts.push(
        t("owner.audit.detailAmount", {
          amount: total.toLocaleString("th-TH"),
        }),
      );
    }
    if (entry.action === "invoice.approve") {
      if (detail.has_proof === true) {
        parts.push(t("owner.audit.hasProof"));
      }
      const transRef = detail.trans_ref;
      if (typeof transRef === "string" && transRef.trim()) {
        parts.push(transRef.trim());
      }
    }
    const mainLine = parts.length > 0 ? parts.join(" · ") : null;
    if (entry.action === "invoice.issue") return mainLine;
    const note = detail.note;
    if (typeof note === "string" && note.trim()) {
      const trimmed = note.trim();
      const preview = trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed;
      return mainLine ? `${mainLine}\n${preview}` : preview;
    }
    return mainLine;
  }

  if (entry.action === "invoice.reject") {
    const note = detail.note;
    if (typeof note === "string" && note.trim()) {
      const trimmed = note.trim();
      const preview = trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed;
      return preview;
    }
  }

  if (entry.action === "invoice.meters") {
    const water = detail.water_unit;
    const electric = detail.electric_unit;
    if (typeof water === "number" && typeof electric === "number") {
      return `${t("owner.override.water")} ${water} · ${t("owner.override.electric")} ${electric}`;
    }
  }

  return null;
}

export function AuditLogSkin({
  planTier,
  entries,
  loading,
  error,
}: AuditLogSkinProps) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<AuditLogCategory>("all");
  const [showAllDrafts, setShowAllDrafts] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [evidenceEntry, setEvidenceEntry] = useState<AuditLogRow | null>(null);

  const categoryCounts = useMemo(() => countAuditByCategory(entries), [entries]);

  const categoryFiltered = useMemo(
    () => filterAuditByCategory(entries, categoryFilter),
    [entries, categoryFilter],
  );

  const fullyFiltered = useMemo(() => {
    if (categoryFilter === "meter") return categoryFiltered;
    return filterAuditEntriesForDisplay(categoryFiltered, showAllDrafts);
  }, [categoryFiltered, categoryFilter, showAllDrafts]);

  const displayEntries = useMemo(() => {
    const limit = showAllEntries ? fullyFiltered.length : VISIBLE_LIMIT;
    return fullyFiltered.slice(0, limit);
  }, [fullyFiltered, showAllEntries]);

  const summaryCount = useMemo(() => {
    if (categoryFilter === "all") {
      return filterAuditEntriesForDisplay(entries, showAllDrafts).length;
    }
    return categoryCounts[categoryFilter];
  }, [categoryFilter, categoryCounts, entries, showAllDrafts]);

  const hasDraftEntries = useMemo(
    () => categoryFiltered.some((entry) => entry.action === "meter.draft"),
    [categoryFiltered],
  );

  const hiddenDraftCount = useMemo(() => {
    if (showAllDrafts || categoryFilter === "meter") return 0;
    return categoryFiltered.filter((entry) => entry.action === "meter.draft").length;
  }, [categoryFiltered, categoryFilter, showAllDrafts]);

  const showDraftToggle =
    (categoryFilter === "all" || categoryFilter === "meter") && hasDraftEntries;

  if (!canUseAuditLog(planTier)) return null;

  const formatLabel = (entry: AuditLogRow) => {
    let key: MessageKey | undefined = ACTION_KEYS[entry.action];
    if (entry.action === "invoice.approve") {
      const method = entry.detail?.method;
      if (method === "manual_cash") {
        key = "owner.audit.invoiceApproveManual";
      } else if (method === "manual_slip") {
        key = "owner.audit.invoiceApproveSlip";
      } else if (method === "slip_review_manual") {
        key = "owner.audit.invoiceApproveSlipReview";
      } else if (method === "slip_review_auto") {
        key = "owner.audit.invoiceApproveSlipAuto";
      }
    }
    if (entry.action === "invoice.reject" && entry.detail?.source === "auto_verify") {
      key = "owner.audit.invoiceRejectAuto";
    }
    const base = key ? t(key) : entry.action;
    if (!entry.room_number) return base;
    return `${base} ${t("owner.audit.roomSuffix", { number: entry.room_number })}`;
  };

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex min-h-12 w-full items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-left"
      >
        <span className="text-base font-semibold tracking-tight text-zinc-900">
          {loading
            ? t("owner.audit.title")
            : t("owner.audit.summary", { count: summaryCount })}
        </span>
        <span className="text-sm font-medium text-zinc-500">
          {expanded ? t("owner.audit.toggleHide") : t("owner.audit.toggleShow")}
        </span>
      </button>

      {expanded && (
        <>
          {loading && <p className="text-base text-zinc-500">{t("common.loading")}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {entries.length === 0 && !loading && (
            <p className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-base text-zinc-500">
              {t("owner.audit.empty")}
            </p>
          )}
          {entries.length > 0 && !loading && (
            <div className="space-y-3">
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {FILTER_CHIPS.map((chip) => {
                  const active = categoryFilter === chip.id;
                  const count = categoryCounts[chip.id];
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(chip.id);
                        setShowAllEntries(false);
                      }}
                      className={`flex min-h-12 shrink-0 items-center rounded-lg border px-4 text-sm font-medium ${
                        active
                          ? "border-rc-green bg-rc-green text-white"
                          : "border-zinc-200 bg-white text-zinc-700"
                      }`}
                    >
                      {t(chip.labelKey)} ({count})
                    </button>
                  );
                })}
              </div>

              {showDraftToggle && categoryFilter !== "meter" && (
                <button
                  type="button"
                  onClick={() => setShowAllDrafts((prev) => !prev)}
                  className="inline-flex min-h-12 items-center text-sm font-medium text-zinc-600 underline"
                >
                  {showAllDrafts
                    ? t("owner.audit.hideDrafts")
                    : t("owner.audit.showAllDrafts")}
                  {!showAllDrafts && hiddenDraftCount > 0 && (
                    <span className="ml-1 text-zinc-400">({hiddenDraftCount})</span>
                  )}
                </button>
              )}

              {fullyFiltered.length === 0 ? (
                <p className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-base text-zinc-500">
                  {t("owner.audit.empty")}
                </p>
              ) : (
                <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-white">
                  {displayEntries.map((entry) => {
                    const detailLine = formatAuditDetail(entry, t);
                    const badgeKey = categoryBadgeKey(getAuditLogCategory(entry.action));
                    return (
                      <li key={entry.id} className="px-4 py-3 text-base text-zinc-600">
                        <div className="flex flex-wrap items-center gap-2">
                          {categoryFilter === "all" && badgeKey && (
                            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                              {t(badgeKey)}
                            </span>
                          )}
                          <span className="font-medium text-zinc-900">
                            {formatLabel(entry)}
                          </span>
                          <span className="text-sm text-zinc-500">
                            {formatEntryTime(entry.created_at)}
                          </span>
                        </div>
                        {detailLine &&
                          detailLine.split("\n").map((line, index) => (
                            <p key={index} className="mt-1 text-sm text-zinc-500">
                              {line}
                            </p>
                          ))}
                        {canShowAuditEvidence(entry) && (
                          <button
                            type="button"
                            onClick={() => setEvidenceEntry(entry)}
                            className="mt-2 inline-flex min-h-12 items-center rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700"
                          >
                            {t("owner.audit.viewEvidence")}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {fullyFiltered.length > VISIBLE_LIMIT && !showAllEntries && (
                <button
                  type="button"
                  onClick={() => setShowAllEntries(true)}
                  className="inline-flex min-h-12 items-center text-sm font-medium text-zinc-600 underline"
                >
                  {t("owner.audit.showMore", {
                    count: fullyFiltered.length - VISIBLE_LIMIT,
                  })}
                </button>
              )}
            </div>
          )}
        </>
      )}

      <AuditEvidenceSheetSkin
        open={evidenceEntry !== null}
        roomNumber={evidenceEntry?.room_number}
        invoiceId={evidenceEntry ? getAuditEvidenceInvoiceId(evidenceEntry) : null}
        transRef={evidenceEntry ? getAuditEvidenceTransRef(evidenceEntry) : null}
        auditNote={evidenceEntry ? getAuditEvidenceNote(evidenceEntry) : null}
        onClose={() => setEvidenceEntry(null)}
      />
    </section>
  );
}
