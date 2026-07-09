"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  TIER_PRICES_THB,
  TIER_ROOM_LIMITS,
  type UpgradeTier,
} from "@/services/planTierService";
import type { OwnerSubscription } from "@/services/platformPaymentService";

interface PlanBillingSkinProps {
  subscription: OwnerSubscription;
  account: {
    prompt_pay: string;
    bank_account: string;
    receiver_name: string;
  };
  disabled?: boolean;
  error?: string | null;
  submitted?: boolean;
  onSubmitSlip: (tier: UpgradeTier, file: File) => void;
}

const UPGRADE_OPTIONS: UpgradeTier[] = ["micro", "growth", "pro"];

export function PlanBillingSkin({
  subscription,
  account,
  disabled,
  error,
  submitted,
  onSubmitSlip,
}: PlanBillingSkinProps) {
  const { t } = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedTier, setSelectedTier] = useState<UpgradeTier | null>(null);
  const currentLimit = TIER_ROOM_LIMITS[subscription.plan_tier];

  const expiresLabel = subscription.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString("th-TH")
    : null;

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-800">{t("owner.planBilling.planTitle")}</h2>
        <p className="mt-1 text-sm">
          {t(`owner.plan.tier.${subscription.plan_tier}`)}
          {expiresLabel && (
            <span className="ml-2 text-xs text-zinc-500">
              · {t("owner.planBilling.expires", { date: expiresLabel })}
            </span>
          )}
        </p>
        {subscription.status === "expired" && (
          <p className="mt-2 text-xs text-amber-800">{t("owner.planBilling.expired")}</p>
        )}
        {subscription.pending_payment && (
          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 space-y-1">
            <p>{t("owner.planBilling.pendingReview")}</p>
            {subscription.pending_plan_requested && (
              <p>
                {t("owner.planBilling.pendingUpgrade", {
                  tier: t(`owner.plan.tier.${subscription.pending_plan_requested}`),
                })}
              </p>
            )}
          </div>
        )}
        {submitted && (
          <p className="mt-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
            {t("owner.planBilling.slipSubmitted")}
          </p>
        )}
        {error && (
          <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-800">{t("owner.upgrade.title")}</h2>
        <p className="mt-1 text-xs text-zinc-500">{t("owner.planBilling.upgradeDesc")}</p>

        <div className="mt-3 space-y-2">
          {UPGRADE_OPTIONS.map((tier) => {
            const isCurrent = subscription.plan_tier === tier;
            const canUpgrade = TIER_ROOM_LIMITS[tier] > currentLimit;
            const isSelected = selectedTier === tier;

            return (
              <div
                key={tier}
                className={`rounded-md border px-3 py-2 ${
                  isSelected ? "border-green-300 bg-green-50" : "border-zinc-100 bg-zinc-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{t(`owner.plan.tier.${tier}`)}</p>
                    <p className="text-xs text-zinc-500">
                      {t("owner.upgrade.rooms", { count: TIER_ROOM_LIMITS[tier] })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">฿{TIER_PRICES_THB[tier]}/mo</p>
                    {isCurrent ? (
                      <p className="text-xs text-green-700">{t("owner.upgrade.current")}</p>
                    ) : (
                      <button
                        type="button"
                        disabled={disabled || !canUpgrade || subscription.pending_payment}
                        onClick={() => setSelectedTier(tier)}
                        className="mt-1 rounded-md border border-green-300 bg-white px-2 py-1 text-xs font-medium text-green-800 disabled:opacity-50"
                      >
                        {isSelected ? t("owner.planBilling.selected") : t("owner.upgrade.upgrade")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTier && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
          <h3 className="text-sm font-semibold">{t("owner.planBilling.payTo")}</h3>
          <p className="text-sm">
            <span className="text-zinc-500">{t("settings.promptPay")}: </span>
            {account.prompt_pay}
          </p>
          <p className="text-sm">
            <span className="text-zinc-500">{t("settings.bankAccount")}: </span>
            {account.bank_account}
          </p>
          <p className="text-sm">
            <span className="text-zinc-500">{t("settings.receiverName")}: </span>
            {account.receiver_name}
          </p>
          <p className="text-sm font-medium">
            {t("owner.planBilling.amount")}: ฿{TIER_PRICES_THB[selectedTier]}
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onSubmitSlip(selectedTier, file);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {disabled ? t("tenant.invoice.uploading") : t("owner.planBilling.uploadSlip")}
          </button>
        </div>
      )}
    </section>
  );
}
