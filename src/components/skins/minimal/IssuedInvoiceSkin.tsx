"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { EasyModeCtaIcon } from "@/components/skins/minimal/EasyModeCtaIcon";
import { TenantBillPreviewSheetSkin } from "@/components/skins/minimal/TenantBillPreviewSheetSkin";
import { UtilityBreakdown } from "@/components/skins/minimal/InvoiceSkin";
import type { ApproveInvoiceInput, OverrideSavingAction } from "@/hooks/useInvoiceOverride";
import type { InvoiceOverrideRow } from "@/services/invoiceOverrideService";
import type { MeterPhotoRow } from "@/services/meterPhotoService";

const formatAmount = (amount: number) =>
  amount.toLocaleString("th-TH", { minimumFractionDigits: 0 });

interface IssuedInvoiceSkinProps {
  invoice: InvoiceOverrideRow;
  variant?: "pending" | "scanningAnomaly";
  disabled?: boolean;
  savingAction?: OverrideSavingAction;
  meterPhotos?: MeterPhotoRow[];
  onApprove: (input?: ApproveInvoiceInput) => void;
}

export function IssuedInvoiceSkin({
  invoice,
  variant = "pending",
  disabled,
  savingAction = null,
  meterPhotos = [],
  onApprove,
}: IssuedInvoiceSkinProps) {
  const { t } = useLocale();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [paymentNote, setPaymentNote] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const busy = disabled || savingAction !== null;
  const hasRejection = Boolean(invoice.slip_rejection_note?.trim());

  useEffect(() => {
    if (!proofFile) {
      setProofPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(proofFile);
    setProofPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

  return (
    <article className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-base font-medium text-amber-900">
        {variant === "scanningAnomaly"
          ? t("owner.invoice.scanningNoSlip")
          : t("owner.invoice.issuedPending")}
      </div>

      <div className="rounded-xl border border-zinc-100 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">{t("owner.invoice.metersLocked")}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => setPreviewOpen(true)}
            className="min-h-12 shrink-0 rounded-lg border border-zinc-200 px-4 text-base font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("owner.invoice.viewBill")}
          </button>
        </div>

        <header className="mt-4 border-b border-zinc-100 pb-3">
          <p className="text-base font-semibold text-zinc-900">{invoice.tenant_name}</p>
          <p className="text-sm text-zinc-500">
            {t("common.room", { number: invoice.room_number })} · {invoice.billing_month}
          </p>
        </header>

        <section className="mt-3 space-y-3">
          <div className="flex justify-between text-base">
            <span className="text-zinc-600">{t("tenant.invoice.rent")}</span>
            <span className="font-bold">
              ฿{formatAmount(invoice.base_rent_amount)}
            </span>
          </div>
          <UtilityBreakdown
            label={t("tenant.invoice.waterLabel")}
            prev={invoice.water_prev}
            curr={invoice.water_curr}
            units={invoice.water_unit}
            amount={invoice.water_amount}
            rate={invoice.water_rate_locked}
            recordedAt={invoice.water_recorded_at}
            photoUrl={meterPhotos.find((p) => p.utility_type === "water")?.public_url}
          />
          <UtilityBreakdown
            label={t("tenant.invoice.electricLabel")}
            prev={invoice.electric_prev}
            curr={invoice.electric_curr}
            units={invoice.electric_unit}
            amount={invoice.electric_amount}
            rate={invoice.electric_rate_locked}
            recordedAt={invoice.electric_recorded_at}
            photoUrl={meterPhotos.find((p) => p.utility_type === "electric")?.public_url}
          />
        </section>

        <p className="mt-4 border-t border-zinc-100 pt-3 text-base font-bold text-zinc-900">
          {t("common.total")} ฿{formatAmount(invoice.total_amount)}
        </p>

        {hasRejection && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {invoice.slip_rejection_note}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 space-y-3">
        <p className="text-sm font-medium text-zinc-900">{t("owner.cashProof.title")}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => photoInputRef.current?.click()}
            className="flex min-h-14 items-center rounded-lg border border-zinc-200 bg-white px-4 text-base font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("owner.cashProof.capture")}
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) setProofFile(file);
            }}
          />
        </div>
        {proofPreviewUrl && (
          <img
            src={proofPreviewUrl}
            alt={t("owner.paid.cashProofLabel")}
            className="max-h-48 w-full rounded-lg border border-zinc-200 object-contain"
          />
        )}
        <label className="block space-y-1">
          <textarea
            value={paymentNote}
            disabled={busy}
            maxLength={200}
            rows={2}
            placeholder={t("owner.cashProof.notePlaceholder")}
            onChange={(event) => setPaymentNote(event.target.value)}
            className="w-full min-h-12 rounded-lg border border-zinc-200 px-3 py-2 text-base"
          />
        </label>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() =>
          onApprove({
            slipUrl: invoice.slip_image_url ?? undefined,
            proofFile: proofFile ?? undefined,
            note: paymentNote.trim() || undefined,
          })
        }
        className="flex min-h-14 w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        <EasyModeCtaIcon name="approve" />
        {savingAction === "approve"
          ? t("common.saving")
          : t("owner.override.approve")}
      </button>

      <TenantBillPreviewSheetSkin
        open={previewOpen}
        invoice={invoice}
        tenantName={invoice.tenant_name}
        roomNumber={invoice.room_number}
        meterPhotos={meterPhotos}
        onClose={() => setPreviewOpen(false)}
      />
    </article>
  );
}
