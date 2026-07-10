"use client";

import { useLocale } from "@/components/LocaleProvider";
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

  if (!canGenerateContractPdf(planTier)) {
    return (
      <p className="text-xs text-zinc-500">{t("owner.contract.upgradeHint")}</p>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-zinc-100 bg-white px-3 py-3">
      <p className="text-xs font-medium text-zinc-700">{t("owner.contract.title")}</p>
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
  );
}
