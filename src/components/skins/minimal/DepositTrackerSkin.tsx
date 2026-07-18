"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { RoomDetailSectionRow } from "@/components/skins/minimal/RoomDetailSectionRow";
import { RoomDetailSubModalShell } from "@/components/skins/minimal/RoomDetailSubModalShell";
import type { TenantDepositRow, DepositStatus } from "@/services/depositService";
import { canUseDepositTracker } from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";

interface DepositTrackerSkinProps {
  planTier: PlanTier;
  deposit: TenantDepositRow | null;
  disabled?: boolean;
  saving?: boolean;
  error?: string | null;
  onSave: (input: { amount: number; status: DepositStatus; note?: string }) => void;
}

const STATUS_OPTIONS: DepositStatus[] = [
  "held",
  "refunded",
  "partial_refund",
  "forfeited",
];

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 px-3 py-2 text-base disabled:bg-zinc-50";

export function DepositTrackerSkin({
  planTier,
  deposit,
  disabled,
  saving,
  error,
  onSave,
}: DepositTrackerSkinProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<DepositStatus>("held");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!deposit) return;
    setAmount(String(deposit.amount));
    setStatus(deposit.status);
    setNote(deposit.note ?? "");
  }, [deposit?.tenant_id, deposit?.amount, deposit?.status, deposit?.note]);

  const busy = disabled || saving;

  if (!canUseDepositTracker(planTier)) {
    return (
      <p className="text-sm text-zinc-500">{t("owner.deposit.upgradeHint")}</p>
    );
  }

  const summary =
    deposit && deposit.amount > 0
      ? t("owner.deposit.summary", {
          amount: deposit.amount.toLocaleString("th-TH"),
          status: t(`owner.deposit.status.${deposit.status}`),
        })
      : t("owner.deposit.summaryEmpty");

  return (
    <>
      <RoomDetailSectionRow
        title={t("owner.deposit.title")}
        summary={summary}
        disabled={disabled}
        onOpen={() => setOpen(true)}
      />

      {open && (
        <RoomDetailSubModalShell
          title={t("owner.deposit.title")}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-3">
            <label className="block space-y-1 text-sm text-zinc-500">
              <span className="font-medium text-zinc-900">{t("owner.deposit.amount")}</span>
              <input
                type="number"
                min={0}
                inputMode="decimal"
                disabled={busy}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block space-y-1 text-sm text-zinc-500">
              <span className="font-medium text-zinc-900">{t("owner.deposit.status")}</span>
              <select
                disabled={busy}
                value={status}
                onChange={(e) => setStatus(e.target.value as DepositStatus)}
                className={inputClass}
              >
                {STATUS_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {t(`owner.deposit.status.${value}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1 text-sm text-zinc-500">
              <span className="font-medium text-zinc-900">{t("owner.deposit.note")}</span>
              <input
                type="text"
                disabled={busy}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={inputClass}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                onSave({
                  amount: Number(amount || 0),
                  status,
                  note: note.trim() || undefined,
                })
              }
              className="flex min-h-[52px] w-full items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-base font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? t("common.saving") : t("owner.deposit.save")}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </RoomDetailSubModalShell>
      )}
    </>
  );
}
