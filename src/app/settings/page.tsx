"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { usePropertyPaymentSettings } from "@/hooks/usePropertyPaymentSettings";

function SettingsContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const propertySlug = searchParams.get("property") ?? "demo-apartment";
  const { account, status, error, save } = usePropertyPaymentSettings(propertySlug);

  const [promptPay, setPromptPay] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [contactLineUrl, setContactLineUrl] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [ownerLineUserId, setOwnerLineUserId] = useState("");
  const [billingDay, setBillingDay] = useState("1");
  const [meterReminderDays, setMeterReminderDays] = useState("3");
  const [includeUtilities, setIncludeUtilities] = useState(true);

  useEffect(() => {
    if (!account) return;
    setPromptPay(account.prompt_pay ?? "");
    setBankAccount(account.bank_account ?? "");
    setReceiverName(account.receiver_name ?? "");
    setContactLineUrl(account.contact_line_url ?? "");
    setContactPhone(account.contact_phone ?? "");
    setOwnerLineUserId(account.owner_line_user_id ?? "");
    setBillingDay(String(account.billing_day));
    setMeterReminderDays(String(account.meter_reminder_days_before));
    setIncludeUtilities(account.include_utilities);
  }, [account]);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-xl">
        <header className="border-b border-zinc-200 pb-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              {t("settings.tag")}
            </p>
            <LocaleToggleSkin />
          </div>
          <h1 className="mt-2 text-2xl font-bold">{t("settings.title")}</h1>
          <p className="mt-2 text-sm text-zinc-600">
            {account?.property_name ?? propertySlug}
          </p>
        </header>

        <section className="mt-8 space-y-4">
          <p className="text-sm text-zinc-600">{t("settings.desc")}</p>

          {status === "loading" && (
            <p className="text-sm text-zinc-500">{t("common.loading")}</p>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("settings.promptPay")}</span>
            <input
              value={promptPay}
              onChange={(event) => setPromptPay(event.target.value)}
              placeholder="0812345678"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("settings.bankAccount")}</span>
            <input
              value={bankAccount}
              onChange={(event) => setBankAccount(event.target.value)}
              placeholder="123-4-56789-0"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("settings.receiverName")}</span>
            <input
              value={receiverName}
              onChange={(event) => setReceiverName(event.target.value)}
              placeholder={t("settings.receiverPlaceholder")}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <div className="border-t border-zinc-200 pt-6">
            <h2 className="text-sm font-semibold">{t("settings.billingTitle")}</h2>
            <p className="mt-1 text-xs text-zinc-500">{t("settings.billingDesc")}</p>
          </div>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("settings.billingDay")}</span>
            <input
              type="number"
              min={1}
              max={28}
              value={billingDay}
              onChange={(event) => setBillingDay(event.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("settings.meterReminder")}</span>
            <input
              type="number"
              min={1}
              max={7}
              value={meterReminderDays}
              onChange={(event) => setMeterReminderDays(event.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-3 py-3 text-sm">
            <span className="font-medium">{t("settings.includeUtilities")}</span>
            <button
              type="button"
              role="switch"
              aria-checked={includeUtilities}
              onClick={() => setIncludeUtilities((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full transition ${
                includeUtilities ? "bg-green-600" : "bg-zinc-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                  includeUtilities ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </label>
          <p className="text-xs text-zinc-500">
            {includeUtilities
              ? t("settings.includeUtilitiesOn")
              : t("settings.includeUtilitiesOff")}
          </p>

          <div className="border-t border-zinc-200 pt-6">
            <h2 className="text-sm font-semibold">{t("settings.contactTitle")}</h2>
            <p className="mt-1 text-xs text-zinc-500">{t("settings.contactDesc")}</p>
          </div>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("settings.contactLineUrl")}</span>
            <input
              value={contactLineUrl}
              onChange={(event) => setContactLineUrl(event.target.value)}
              placeholder="https://line.me/ti/p/..."
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("settings.contactPhone")}</span>
            <input
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              placeholder="0812345678"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("settings.ownerLineUserId")}</span>
            <input
              value={ownerLineUserId}
              onChange={(event) => setOwnerLineUserId(event.target.value)}
              placeholder="Uxxxxxxxx..."
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
            <p className="text-xs text-zinc-500">{t("settings.ownerLineHint")}</p>
          </label>

          <button
            type="button"
            disabled={status === "loading" || status === "saving"}
            onClick={() =>
              void save({
                prompt_pay: promptPay,
                bank_account: bankAccount,
                receiver_name: receiverName,
                contact_line_url: contactLineUrl,
                contact_phone: contactPhone,
                owner_line_user_id: ownerLineUserId,
                billing_day: Number(billingDay),
                meter_reminder_days_before: Number(meterReminderDays),
                include_utilities: includeUtilities,
              })
            }
            className="w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {status === "saving" ? t("common.saving") : t("settings.save")}
          </button>

          <a
            href={`/billing?property=${encodeURIComponent(propertySlug)}`}
            className="block text-center text-sm text-green-700 underline"
          >
            {t("owner.planBilling.managePlan")}
          </a>

          <a
            href={`/dashboard?property=${encodeURIComponent(propertySlug)}`}
            className="block text-center text-sm text-zinc-600 underline"
          >
            {t("common.backToDashboard")}
          </a>
        </section>
      </div>
    </main>
  );
}

function SettingsFallback() {
  const { t } = useLocale();
  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
      {t("common.loading")}
    </main>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <SettingsContent />
    </Suspense>
  );
}
