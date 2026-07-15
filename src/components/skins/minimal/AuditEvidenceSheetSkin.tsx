"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { InvoiceEvidenceRow } from "@/services/invoiceOverrideService";

type EvidencePayload = InvoiceEvidenceRow & { trans_ref?: string | null };

interface AuditEvidenceSheetSkinProps {
  open: boolean;
  roomNumber?: string | null;
  invoiceId: string | null;
  transRef?: string | null;
  auditNote?: string | null;
  onClose: () => void;
}

export function AuditEvidenceSheetSkin({
  open,
  roomNumber,
  invoiceId,
  transRef,
  auditNote,
  onClose,
}: AuditEvidenceSheetSkinProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<EvidencePayload | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !invoiceId) {
      setEvidence(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (transRef) params.set("trans_ref", transRef);

    void fetch(`/api/override/${invoiceId}/evidence?${params.toString()}`)
      .then(async (res) => {
        const payload = (await res.json()) as {
          ok?: boolean;
          error?: string;
          evidence?: EvidencePayload;
        };
        if (!res.ok || !payload.ok || !payload.evidence) {
          throw new Error(payload.error ?? "โหลดหลักฐานไม่สำเร็จ");
        }
        if (!cancelled) setEvidence(payload.evidence);
      })
      .catch((err) => {
        if (!cancelled) {
          setEvidence(null);
          setError(err instanceof Error ? err.message : "โหลดหลักฐานไม่สำเร็จ");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, invoiceId, transRef]);

  if (!open) return null;

  const noteText =
    auditNote?.trim() ||
    evidence?.owner_payment_note?.trim() ||
    evidence?.slip_rejection_note?.trim() ||
    null;
  const hasSlip = Boolean(evidence?.slip_image_url?.trim());
  const hasCashProof = Boolean(evidence?.owner_payment_proof_url?.trim());
  const hasTransRef = Boolean(evidence?.trans_ref?.trim());
  const hasContent = hasSlip || hasCashProof || Boolean(noteText) || hasTransRef;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("owner.rooms.close")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-evidence-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-xl border border-zinc-100 bg-white sm:rounded-xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <div>
            <h2
              id="audit-evidence-title"
              className="text-base font-semibold tracking-tight text-zinc-900"
            >
              {t("owner.audit.evidenceTitle")}
              {roomNumber ? ` · ${t("common.room", { number: roomNumber })}` : ""}
            </h2>
            {evidence && (
              <p className="mt-0.5 text-sm text-zinc-500">
                {t("owner.audit.detailBillingMonth", { month: evidence.billing_month })} ·{" "}
                {t("owner.audit.detailAmount", {
                  amount: evidence.total_amount.toLocaleString("th-TH"),
                })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 shrink-0 rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700"
          >
            {t("owner.rooms.close")}
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto p-4">
          {loading && <p className="text-base text-zinc-500">{t("common.loading")}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && evidence && hasSlip && (
            <section className="space-y-2">
              <p className="text-sm font-medium text-zinc-900">{t("owner.audit.evidenceSlip")}</p>
              <a href={evidence.slip_image_url!} target="_blank" rel="noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={evidence.slip_image_url!}
                  alt={t("owner.audit.evidenceSlip")}
                  className="max-h-64 w-full rounded-lg border border-zinc-200 object-contain"
                />
              </a>
            </section>
          )}

          {!loading && !error && evidence && hasCashProof && (
            <section className="space-y-2">
              <p className="text-sm font-medium text-zinc-900">
                {t("owner.audit.evidenceCashProof")}
              </p>
              <a
                href={evidence.owner_payment_proof_url!}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={evidence.owner_payment_proof_url!}
                  alt={t("owner.audit.evidenceCashProof")}
                  className="max-h-64 w-full rounded-lg border border-zinc-200 object-contain"
                />
              </a>
            </section>
          )}

          {!loading && !error && noteText && (
            <section className="space-y-1">
              <p className="text-sm font-medium text-zinc-900">{t("owner.audit.evidenceNote")}</p>
              <p className="text-base text-zinc-600">{noteText}</p>
            </section>
          )}

          {!loading && !error && evidence && hasTransRef && (
            <section className="space-y-1">
              <p className="text-sm font-medium text-zinc-900">
                {t("owner.audit.evidenceTransRef")}
              </p>
              <p className="text-base text-zinc-600">{evidence.trans_ref}</p>
            </section>
          )}

          {!loading && !error && evidence && !hasContent && (
            <p className="text-base text-zinc-500">{t("owner.audit.noEvidence")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
