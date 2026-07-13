"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { RoomDetailSectionRow } from "@/components/skins/minimal/RoomDetailSectionRow";
import { RoomDetailSubModalShell } from "@/components/skins/minimal/RoomDetailSubModalShell";
import { canGenerateContractPdf, canUseESign } from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";

interface ContractLeaseSkinProps {
  planTier: PlanTier;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  onGenerate: () => void;
}

export function ContractLeaseSkin({
  planTier,
  disabled,
  loading,
  error,
  onGenerate,
}: ContractLeaseSkinProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  if (!canGenerateContractPdf(planTier)) {
    return (
      <p className="text-xs text-zinc-500">{t("owner.contract.upgradeHint")}</p>
    );
  }

  return (
    <>
      <RoomDetailSectionRow
        title={t("owner.contract.title")}
        summary={t("owner.contract.summary")}
        disabled={disabled}
        onOpen={() => setOpen(true)}
      />

      {open && (
        <RoomDetailSubModalShell
          title={t("owner.contract.title")}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-500">{t("owner.contract.desc")}</p>
            <button
              type="button"
              disabled={disabled || loading}
              onClick={onGenerate}
              className="min-h-11 w-full rounded-md border border-zinc-200 bg-zinc-50 py-2 text-xs font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t("common.saving") : t("owner.contract.generate")}
            </button>
            {canUseESign(planTier) && (
              <p className="text-[11px] text-green-700">{t("owner.contract.esignHint")}</p>
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        </RoomDetailSubModalShell>
      )}
    </>
  );
}
