"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
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

export function DepositTrackerSkin({
  planTier,
  deposit,
  disabled,
  saving,
  error,
  onSave,
}: DepositTrackerSkinProps) {
  const { t } = useLocale();
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
      <p className="text-xs text-zinc-500">{t("owner.deposit.upgradeHint")}</p>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-zinc-100 bg-white px-3 py-3">
      <p className="text-xs font-medium text-zinc-700">{t("owner.deposit.title")}</p>
      <label className="block space-y-1 text-xs">
        <span className="text-zinc-500">{t("owner.deposit.amount")}</span>
        <input
          type="number"
          min={0}
          inputMode="decimal"
          disabled={busy}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-md border border-zinc-200 px-3 py-2 disabled:bg-zinc-50"
        />
      </label>
      <label className="block space-y-1 text-xs">
        <span className="text-zinc-500">{t("owner.deposit.status")}</span>
        <select
          disabled={busy}
          value={status}
          onChange={(e) => setStatus(e.target.value as DepositStatus)}
          className="min-h-11 w-full rounded-md border border-zinc-200 px-3 py-2"
        >
          {STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {t(`owner.deposit.status.${value}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1 text-xs">
        <span className="text-zinc-500">{t("owner.deposit.note")}</span>
        <input
          type="text"
          disabled={busy}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-md border border-zinc-200 px-3 py-2 disabled:bg-zinc-50"
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
        className="min-h-11 w-full rounded-md border border-zinc-200 bg-zinc-50 py-2 text-xs font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? t("common.saving") : t("owner.deposit.save")}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
