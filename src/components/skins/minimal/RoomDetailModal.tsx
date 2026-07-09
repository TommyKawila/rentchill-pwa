"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { RoomInviteQrSkin } from "@/components/skins/minimal/RoomInviteQrSkin";
import { OverrideSkin } from "@/components/skins/minimal/OverrideSkin";
import { PaidInvoiceSkin } from "@/components/skins/minimal/PaidInvoiceSkin";
import {
  calculateInvoiceAmounts,
} from "@/services/invoiceCalculator";
import { statusMessageKey } from "@/services/i18n/translate";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import type { InvoiceOverrideRow } from "@/services/invoiceOverrideService";

interface RoomDetailModalProps {
  row: MonthlyBillingRow;
  includeUtilities: boolean;
  waterRate: number;
  electricRate: number;
  reviewInvoice?: InvoiceOverrideRow | null;
  paidInvoice?: InvoiceOverrideRow | null;
  disabled?: boolean;
  canRemind?: boolean;
  reminderDisabled?: boolean;
  remindedTenantId?: string | null;
  onClose: () => void;
  onMeterChange: (tenantId: string, water: string, electric: string) => void;
  meters: { water: string; electric: string };
  onRemind?: (tenantId: string) => void;
  onSaveMeters: (invoiceId: string, water: number, electric: number) => void;
  onAutoVerify: (invoiceId: string) => void;
  onReject: (invoiceId: string, note?: string) => void;
  onApprove: (invoiceId: string, slipUrl?: string) => void;
}

function isLocked(status: MonthlyBillingRow["invoice_status"]) {
  return status === "paid" || status === "scanning";
}

function fullInviteUrl(url: string) {
  if (url.startsWith("http")) return url;
  if (typeof window === "undefined") return url;
  return new URL(url, window.location.origin).href;
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!ok) throw new Error("คัดลอกไม่สำเร็จ");
}

export function RoomDetailModal({
  row,
  includeUtilities,
  waterRate,
  electricRate,
  reviewInvoice,
  paidInvoice,
  disabled,
  canRemind,
  reminderDisabled,
  remindedTenantId,
  onClose,
  onMeterChange,
  meters,
  onRemind,
  onSaveMeters,
  onAutoVerify,
  onReject,
  onApprove,
}: RoomDetailModalProps) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const locked = isLocked(row.invoice_status);

  const water = includeUtilities ? Number(meters.water || 0) : 0;
  const electric = includeUtilities ? Number(meters.electric || 0) : 0;
  const { total_amount } = calculateInvoiceAmounts(
    row.base_rent_price,
    water,
    electric,
    waterRate,
    electricRate,
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("owner.rooms.close")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-xl border border-zinc-200 bg-white shadow-lg sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">{row.tenant_name}</p>
            <p className="text-xs text-zinc-500">
              {t("common.room", { number: row.room_number })}
              {row.invoice_status
                ? ` · ${t(statusMessageKey(row.invoice_status))}`
                : ` · ${t("status.noBill")}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600"
          >
            {t("owner.rooms.close")}
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-4 py-4">
          <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-500">
                {t("owner.billing.inviteCode")}:{" "}
                <span className="font-medium text-zinc-800">
                  {row.invite_code || "-"}
                </span>
              </span>
              <span className={row.line_linked ? "text-green-700" : "text-amber-700"}>
                {row.line_linked
                  ? t("owner.billing.lineLinked")
                  : t("owner.billing.lineNotLinked")}
              </span>
            </div>

            {row.invite_url && (
              <div className="mt-2 space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setCopyError(null);
                      void copyText(fullInviteUrl(row.invite_url))
                        .then(() => {
                          setCopied(true);
                          window.setTimeout(() => setCopied(false), 2000);
                        })
                        .catch(() => setCopyError(t("owner.billing.copyFailed")));
                    }}
                    className="flex-1 rounded-md border border-green-300 bg-green-50 py-2 text-sm font-medium text-green-800"
                  >
                    {copied ? t("owner.billing.copied") : t("owner.billing.copyInvite")}
                  </button>
                  {canShare && (
                    <button
                      type="button"
                      onClick={() => {
                        setCopyError(null);
                        void navigator
                          .share({
                            title: "RentChill",
                            text: row.tenant_name,
                            url: fullInviteUrl(row.invite_url),
                          })
                          .catch(() => setCopyError(t("owner.billing.copyFailed")));
                      }}
                      className="flex-1 rounded-md border border-zinc-300 bg-white py-2 text-sm font-medium text-zinc-800"
                    >
                      {t("owner.billing.shareInvite")}
                    </button>
                  )}
                </div>
                <RoomInviteQrSkin
                  roomNumber={row.room_number}
                  tenantName={row.tenant_name}
                  inviteUrl={fullInviteUrl(row.invite_url)}
                />
              </div>
            )}
            {copyError && (
              <p className="mt-2 text-amber-800">{copyError}</p>
            )}
          </div>

          {!reviewInvoice && !paidInvoice && (
            <>
              {includeUtilities ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <label className="space-y-1">
                    <span className="text-zinc-500">{t("owner.billing.water")}</span>
                    <input
                      type="number"
                      min={0}
                      disabled={disabled || locked}
                      value={meters.water}
                      onChange={(event) =>
                        onMeterChange(row.tenant_id, event.target.value, meters.electric)
                      }
                      className="w-full rounded-md border border-zinc-200 px-3 py-2 disabled:bg-zinc-50"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-zinc-500">{t("owner.billing.electric")}</span>
                    <input
                      type="number"
                      min={0}
                      disabled={disabled || locked}
                      value={meters.electric}
                      onChange={(event) =>
                        onMeterChange(row.tenant_id, meters.water, event.target.value)
                      }
                      className="w-full rounded-md border border-zinc-200 px-3 py-2 disabled:bg-zinc-50"
                    />
                  </label>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">{t("owner.billing.rentOnly")}</p>
              )}
              <p className="text-sm font-medium">
                {t("common.total")} ฿{total_amount.toLocaleString("th-TH")}
              </p>
            </>
          )}

          {row.invoice_status === "pending" && row.line_linked && onRemind && (
            <button
              type="button"
              disabled={disabled || reminderDisabled || !canRemind}
              onClick={() => onRemind(row.tenant_id)}
              className="w-full rounded-md border border-amber-300 bg-amber-50 py-2 text-sm font-medium text-amber-900 disabled:opacity-50"
            >
              {remindedTenantId === row.tenant_id
                ? t("owner.reminder.sent")
                : t("owner.reminder.send")}
            </button>
          )}

          {reviewInvoice && (
            <OverrideSkin
              invoice={reviewInvoice}
              disabled={disabled}
              onSaveMeters={(w, e) => onSaveMeters(reviewInvoice.id, w, e)}
              onAutoVerify={() => onAutoVerify(reviewInvoice.id)}
              onReject={(note) => onReject(reviewInvoice.id, note)}
              onApprove={(slipUrl) => onApprove(reviewInvoice.id, slipUrl)}
            />
          )}

          {paidInvoice && !reviewInvoice && (
            <PaidInvoiceSkin invoice={paidInvoice} />
          )}
        </div>
      </div>
    </div>
  );
}
