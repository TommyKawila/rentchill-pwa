"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { RoomInviteQrSkin } from "@/components/skins/minimal/RoomInviteQrSkin";
import {
  calculateInvoiceAmounts,
  WATER_RATE,
  ELECTRIC_RATE,
} from "@/services/invoiceCalculator";
import { statusMessageKey } from "@/services/i18n/translate";
import type {
  BillingEntry,
  MonthlyBillingRow,
} from "@/services/monthlyBillingService";

interface MonthlyBillingSkinProps {
  billingMonth: string;
  rows: MonthlyBillingRow[];
  disabled?: boolean;
  result?: {
    created: number;
    updated: number;
    skipped: number;
  } | null;
  onSubmit: (entries: BillingEntry[]) => void;
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

export function MonthlyBillingSkin({
  billingMonth,
  rows,
  disabled,
  result,
  onSubmit,
}: MonthlyBillingSkinProps) {
  const { t } = useLocale();
  const [meters, setMeters] = useState<
    Record<string, { water: string; electric: string }>
  >({});
  const [copiedTenantId, setCopiedTenantId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  useEffect(() => {
    setMeters(
      Object.fromEntries(
        rows.map((row) => [
          row.tenant_id,
          {
            water: String(row.water_unit),
            electric: String(row.electric_unit),
          },
        ]),
      ),
    );
  }, [rows]);

  const editableCount = useMemo(
    () => rows.filter((row) => !isLocked(row.invoice_status)).length,
    [rows],
  );

  const handleSubmit = () => {
    const entries = rows
      .filter((row) => !isLocked(row.invoice_status))
      .map((row) => ({
        tenant_id: row.tenant_id,
        water_unit: Number(meters[row.tenant_id]?.water ?? 0),
        electric_unit: Number(meters[row.tenant_id]?.electric ?? 0),
      }));

    onSubmit(entries);
  };

  return (
    <section className="mt-8 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-800">
            {t("owner.billing.title")}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {t("owner.billing.rates", {
              month: billingMonth,
              water: WATER_RATE,
              electric: ELECTRIC_RATE,
            })}
          </p>
        </div>
      </div>

      {rows.length === 0 && (
        <p className="text-sm text-zinc-600">{t("owner.billing.noRooms")}</p>
      )}

      {rows.map((row) => {
        const water = Number(meters[row.tenant_id]?.water ?? 0);
        const electric = Number(meters[row.tenant_id]?.electric ?? 0);
        const { total_amount } = calculateInvoiceAmounts(
          row.base_rent_price,
          water,
          electric,
        );
        const locked = isLocked(row.invoice_status);

        return (
          <article
            key={row.tenant_id}
            className="rounded-lg border border-zinc-200 bg-white p-4"
          >
            <header className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <p className="text-sm font-semibold">{row.tenant_name}</p>
                <p className="text-xs text-zinc-500">
                  {t("common.room", { number: row.room_number })}
                </p>
              </div>
              {row.invoice_status && (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                  {t(statusMessageKey(row.invoice_status))}
                </span>
              )}
            </header>

            <div className="mt-3 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-500">
                  {t("owner.billing.inviteCode")}:{" "}
                  <span className="font-medium text-zinc-800">{row.invite_code || "-"}</span>
                </span>
                <span
                  className={
                    row.line_linked
                      ? "text-green-700"
                      : "text-amber-700"
                  }
                >
                  {row.line_linked
                    ? t("owner.billing.lineLinked")
                    : t("owner.billing.lineNotLinked")}
                </span>
              </div>
              {row.invite_url && (
                <div className="mt-2 space-y-2">
                  <p className="hidden break-all text-zinc-600 md:block">
                    {fullInviteUrl(row.invite_url)}
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        setCopyError(null);
                        void copyText(fullInviteUrl(row.invite_url))
                          .then(() => {
                            setCopiedTenantId(row.tenant_id);
                            window.setTimeout(() => setCopiedTenantId(null), 2000);
                          })
                          .catch(() => setCopyError(t("owner.billing.copyFailed")));
                      }}
                      className="flex-1 rounded-md border border-green-300 bg-green-50 py-2 text-sm font-medium text-green-800"
                    >
                      {copiedTenantId === row.tenant_id
                        ? t("owner.billing.copied")
                        : t("owner.billing.copyInvite")}
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
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <label className="space-y-1">
                <span className="text-zinc-500">{t("owner.billing.water")}</span>
                <input
                  type="number"
                  min={0}
                  disabled={disabled || locked}
                  value={meters[row.tenant_id]?.water ?? "0"}
                  onChange={(event) =>
                    setMeters((prev) => ({
                      ...prev,
                      [row.tenant_id]: {
                        water: event.target.value,
                        electric: prev[row.tenant_id]?.electric ?? "0",
                      },
                    }))
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
                  value={meters[row.tenant_id]?.electric ?? "0"}
                  onChange={(event) =>
                    setMeters((prev) => ({
                      ...prev,
                      [row.tenant_id]: {
                        water: prev[row.tenant_id]?.water ?? "0",
                        electric: event.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 disabled:bg-zinc-50"
                />
              </label>
            </div>

            <p className="mt-3 text-sm font-medium">
              {t("common.total")} ฿{total_amount.toLocaleString("th-TH")}
            </p>
          </article>
        );
      })}

      {copyError && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {copyError}
        </p>
      )}

      {rows.length > 0 && (
        <button
          type="button"
          disabled={disabled || editableCount === 0}
          onClick={handleSubmit}
          className="w-full rounded-md bg-green-700 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {t("owner.billing.submit", { count: editableCount })}
        </button>
      )}

      {result && (
        <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {t("owner.billing.result", {
            created: result.created,
            updated: result.updated,
            skipped: result.skipped,
          })}
        </p>
      )}
    </section>
  );
}
