"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  PLAN_TAGLINES,
  PLAN_UPGRADE_FEATURES,
} from "@/services/planFeatureCopy";
import {
  TIER_PRICES_THB,
  TIER_PROJECT_LIMITS,
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
      <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
        <h2 className="font-semibold tracking-tight text-zinc-900">
          {t("owner.planBilling.planTitle")}
        </h2>
        <p className="mt-2 font-medium text-zinc-900">
          {t(`owner.plan.tier.${subscription.plan_tier}`)}
          {expiresLabel && (
            <span className="ml-2 font-normal text-zinc-500">
              · {t("owner.planBilling.expires", { date: expiresLabel })}
            </span>
          )}
        </p>
        <p className="mt-1 text-zinc-500">
          {t("owner.upgrade.rooms", {
            count: TIER_ROOM_LIMITS[subscription.plan_tier],
          })}
          {" · "}
          {t("owner.upgrade.projects", {
            count: TIER_PROJECT_LIMITS[subscription.plan_tier],
          })}
        </p>
        {subscription.status === "expired" && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            {t("owner.planBilling.expired")}
          </p>
        )}
        {subscription.pending_payment && (
          <div className="mt-3 space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
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
          <p className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            {t("owner.planBilling.slipSubmitted")}
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {error}
          </p>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold tracking-tight text-zinc-900">
          {t("owner.upgrade.title")}
        </h2>
        <p className="mt-1 text-zinc-500">{t("owner.planBilling.upgradeDesc")}</p>

        <div className="mt-4 space-y-3">
          {UPGRADE_OPTIONS.map((tier) => {
            const isCurrent = subscription.plan_tier === tier;
            const canUpgrade = TIER_ROOM_LIMITS[tier] > currentLimit;
            const isSelected = selectedTier === tier;

            return (
              <div
                key={tier}
                className={`rounded-xl border p-4 ${
                  isSelected
                    ? "border-zinc-900 bg-white"
                    : "border-zinc-100 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900">
                      {t(`owner.plan.tier.${tier}`)}
                    </p>
                    <p className="mt-1 text-zinc-500">{t(PLAN_TAGLINES[tier])}</p>
                  </div>
                  <p className="shrink-0 text-2xl font-bold tabular-nums text-zinc-900">
                    {t("owner.planBilling.perMonth", {
                      price: TIER_PRICES_THB[tier],
                    })}
                  </p>
                </div>

                <p className="mt-3 font-medium text-zinc-900">
                  {t("owner.upgrade.rooms", { count: TIER_ROOM_LIMITS[tier] })}
                  {" · "}
                  {t("owner.upgrade.projects", {
                    count: TIER_PROJECT_LIMITS[tier],
                  })}
                </p>

                <ul className="mt-3 space-y-2 text-zinc-700">
                  {PLAN_UPGRADE_FEATURES[tier].map((key) => (
                    <li key={key} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  {isCurrent ? (
                    <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-center font-medium text-green-800">
                      {t("owner.upgrade.current")}
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={disabled || !canUpgrade || subscription.pending_payment}
                      onClick={() => setSelectedTier(tier)}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-3 font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSelected
                        ? t("owner.planBilling.selected")
                        : t("owner.upgrade.upgrade")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTier && (
        <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
          <h3 className="font-semibold tracking-tight text-zinc-900">
            {t("owner.planBilling.payTo")}
          </h3>
          <p>
            <span className="text-zinc-500">{t("settings.promptPay")}: </span>
            <span className="font-medium text-zinc-900">{account.prompt_pay}</span>
          </p>
          <p>
            <span className="text-zinc-500">{t("settings.bankAccount")}: </span>
            <span className="font-medium text-zinc-900">{account.bank_account}</span>
          </p>
          <p>
            <span className="text-zinc-500">{t("settings.receiverName")}: </span>
            <span className="font-medium text-zinc-900">{account.receiver_name}</span>
          </p>
          <p className="text-2xl font-bold tabular-nums text-zinc-900">
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
            className="w-full rounded-lg bg-zinc-900 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {disabled
              ? t("tenant.invoice.uploading")
              : t("owner.planBilling.uploadSlip")}
          </button>
        </div>
      )}
    </section>
  );
}
