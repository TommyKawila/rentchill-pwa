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
  const [selectedTier, setSelectedTier] = useState<UpgradeTier | null>(
    subscription.plan_tier === "free" ? "premium" : null,
  );
  const isPremium = subscription.plan_tier === "premium";

  const expiresLabel = subscription.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString("th-TH")
    : null;

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6">
        <h2 className="text-base font-semibold tracking-tight text-zinc-900">
          {t("owner.planBilling.planTitle")}
        </h2>
        <p className="mt-2 inline-flex items-center gap-2 text-base font-medium text-zinc-900">
          <span
            className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${
              isPremium ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {t(`owner.plan.tier.${subscription.plan_tier}`)}
          </span>
          {expiresLabel && (
            <span className="font-normal text-zinc-500">
              · {t("owner.planBilling.expires", { date: expiresLabel })}
            </span>
          )}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {t("owner.upgrade.rooms", {
            count: TIER_ROOM_LIMITS[subscription.plan_tier],
          })}
          {" · "}
          {t("owner.upgrade.projects", {
            count: TIER_PROJECT_LIMITS[subscription.plan_tier],
          })}
        </p>
        {subscription.status === "expired" && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-base text-amber-900">
            {t("owner.planBilling.expired")}
          </p>
        )}
        {subscription.pending_payment && (
          <div className="mt-3 space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-4 text-base text-amber-900">
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
          <p className="mt-3 rounded-xl border border-rc-green/30 bg-rc-green-soft p-4 text-base text-rc-green-ink">
            {t("owner.planBilling.slipSubmitted")}
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {!isPremium && (
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-900">
            {t("owner.upgrade.title")}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{t("owner.planBilling.upgradeDesc")}</p>

          <div
            className={`mt-4 rounded-xl border p-6 ${
              selectedTier === "premium"
                ? "border-rc-green bg-rc-green-soft"
                : "border-zinc-100 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold text-zinc-900">
                  {t("owner.plan.tier.premium")}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{t(PLAN_TAGLINES.premium)}</p>
              </div>
              <p className="shrink-0 text-2xl font-bold tabular-nums text-zinc-900">
                {t("owner.planBilling.perMonth", {
                  price: TIER_PRICES_THB.premium,
                })}
              </p>
            </div>

            <p className="mt-3 text-base font-medium text-zinc-900">
              {t("owner.upgrade.rooms", { count: TIER_ROOM_LIMITS.premium })}
              {" · "}
              {t("owner.upgrade.projects", {
                count: TIER_PROJECT_LIMITS.premium,
              })}
            </p>

            <ul className="mt-3 space-y-2 text-base text-zinc-700">
              {PLAN_UPGRADE_FEATURES.premium.map((key) => (
                <li key={key} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled={disabled || subscription.pending_payment}
              onClick={() => setSelectedTier("premium")}
              className="mt-4 flex min-h-12 w-full items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-base font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selectedTier === "premium"
                ? t("owner.planBilling.selected")
                : t("owner.upgrade.upgrade")}
            </button>
          </div>
        </div>
      )}

      {selectedTier === "premium" && (
        <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50 p-6">
          <h3 className="text-base font-semibold tracking-tight text-zinc-900">
            {t("owner.planBilling.payTo")}
          </h3>
          <p className="text-base">
            <span className="text-zinc-500">{t("settings.promptPay")}: </span>
            <span className="font-bold text-zinc-900">{account.prompt_pay}</span>
          </p>
          <p className="text-base">
            <span className="text-zinc-500">{t("settings.bankAccount")}: </span>
            <span className="font-bold text-zinc-900">{account.bank_account}</span>
          </p>
          <p className="text-base">
            <span className="text-zinc-500">{t("settings.receiverName")}: </span>
            <span className="font-medium text-zinc-900">{account.receiver_name}</span>
          </p>
          <p className="text-2xl font-bold tabular-nums text-zinc-900">
            {t("owner.planBilling.amount")}: ฿{TIER_PRICES_THB.premium}
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onSubmitSlip("premium", file);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
            className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {disabled
              ? t("common.saving")
              : t("owner.planBilling.uploadSlip")}
          </button>
        </div>
      )}
    </section>
  );
}
