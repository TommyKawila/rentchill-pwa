"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { ContactLineQrSkin } from "@/components/skins/minimal/ContactLineQrSkin";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { OwnerLineNotifySkin } from "@/components/skins/minimal/OwnerLineNotifySkin";
import { ProjectSelectorSkin } from "@/components/skins/minimal/ProjectSelectorSkin";
import { useCreateProject } from "@/hooks/useCreateProject";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { usePropertyPaymentSettings } from "@/hooks/usePropertyPaymentSettings";
import { resolveOwnerPropertySlug } from "@/services/resolveOwnerPropertySlug";

function SettingsContent() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugFromUrl = searchParams.get("property");

  const { properties, status: propertiesStatus, reload: reloadProperties } =
    useOwnerProperties();
  const createProject = useCreateProject();

  const propertySlug = useMemo(
    () =>
      resolveOwnerPropertySlug(
        slugFromUrl,
        properties,
        propertiesStatus === "loading",
      ),
    [slugFromUrl, properties, propertiesStatus],
  );

  useEffect(() => {
    if (propertiesStatus !== "idle" || properties.length === 0) return;
    if (!propertySlug) return;
    if (slugFromUrl === propertySlug) return;
    router.replace(`/settings?property=${encodeURIComponent(propertySlug)}`);
  }, [propertiesStatus, properties.length, slugFromUrl, propertySlug, router]);

  const { account, status, error, save, reload: reloadSettings } =
    usePropertyPaymentSettings(propertySlug);

  const [promptPay, setPromptPay] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [contactLineUrl, setContactLineUrl] = useState("");
  const [contactLineQrUrl, setContactLineQrUrl] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [ownerLineUserId, setOwnerLineUserId] = useState("");
  const [billingDay, setBillingDay] = useState("1");
  const [meterReminderDays, setMeterReminderDays] = useState("3");
  const [includeUtilities, setIncludeUtilities] = useState(true);
  const [waterRate, setWaterRate] = useState("10");
  const [electricRate, setElectricRate] = useState("7");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    if (!account) return;
    setPromptPay(account.prompt_pay ?? "");
    setBankAccount(account.bank_account ?? "");
    setReceiverName(account.receiver_name ?? "");
    setContactLineUrl(account.contact_line_url ?? "");
    setContactLineQrUrl(account.contact_line_qr_url ?? "");
    setContactPhone(account.contact_phone ?? "");
    setOwnerLineUserId(account.owner_line_user_id ?? "");
    setBillingDay(String(account.billing_day));
    setMeterReminderDays(String(account.meter_reminder_days_before));
    setIncludeUtilities(account.include_utilities);
    setWaterRate(String(account.water_rate_per_unit));
    setElectricRate(String(account.electric_rate_per_unit));
  }, [account]);

  useEffect(() => {
    if (propertiesStatus === "idle" && properties.length === 0) {
      setShowAddForm(true);
    }
  }, [propertiesStatus, properties.length]);

  useEffect(() => {
    const reloadOnFocus = () => {
      if (document.visibilityState === "visible" && propertySlug) {
        void reloadSettings();
      }
    };
    document.addEventListener("visibilitychange", reloadOnFocus);
    return () => document.removeEventListener("visibilitychange", reloadOnFocus);
  }, [propertySlug, reloadSettings]);

  const hasProject = properties.length > 0 && Boolean(propertySlug);

  const handlePropertyChange = (slug: string) => {
    router.replace(`/settings?property=${encodeURIComponent(slug)}`);
  };

  const handleCreateProject = async () => {
    try {
      const property = await createProject.create(newProjectName);
      setShowAddForm(false);
      setNewProjectName("");
      await reloadProperties();
      router.replace(`/dashboard?property=${encodeURIComponent(property.slug)}`);
    } catch (err) {
      if (err instanceof Error && err.message === "PROJECT_LIMIT_EXCEEDED") {
        return;
      }
    }
  };

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

          <ProjectSelectorSkin
            properties={properties}
            value={propertySlug}
            loading={propertiesStatus === "loading"}
            onChange={handlePropertyChange}
            onAddClick={() => setShowAddForm((prev) => !prev)}
            addDisabled={createProject.status === "creating"}
          />

          {showAddForm && (
            <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-3">
              <label className="block space-y-1 text-sm">
                <span className="font-medium">{t("owner.projectName")}</span>
                <input
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
                  placeholder={t("owner.projectNamePlaceholder")}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
                />
              </label>
              {createProject.error === "PROJECT_LIMIT_EXCEEDED" && (
                <div className="mt-2 text-xs text-amber-800">
                  <p>{t("owner.projectLimitReached")}</p>
                  <a
                    href={`/billing?property=${encodeURIComponent(propertySlug)}`}
                    className="underline"
                  >
                    {t("owner.planBilling.managePlan")}
                  </a>
                </div>
              )}
              {createProject.error &&
                createProject.error !== "PROJECT_LIMIT_EXCEEDED" && (
                  <p className="mt-2 text-xs text-red-700">{createProject.error}</p>
                )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={
                    createProject.status === "creating" || !newProjectName.trim()
                  }
                  onClick={() => void handleCreateProject()}
                  className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {createProject.status === "creating"
                    ? t("owner.creatingProject")
                    : t("owner.addProject")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewProjectName("");
                  }}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700"
                >
                  {t("owner.rooms.close")}
                </button>
              </div>
            </div>
          )}
        </header>

        <section className="mt-8 space-y-4">
          {!hasProject ? (
            <p className="text-sm text-zinc-600">{t("owner.noProjectSettingsHint")}</p>
          ) : (
            <>
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

          <div id="billing" className="scroll-mt-6 border-t border-zinc-200 pt-6">
            <h2 className="text-sm font-semibold">{t("settings.billingTitle")}</h2>
            <p className="mt-1 text-xs text-zinc-500">{t("settings.billingDesc")}</p>

            <label className="mt-4 block space-y-1 text-sm">
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

            <label className="mt-4 block space-y-1 text-sm">
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

            <label className="mt-4 flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-3 py-3 text-sm">
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
            <p className="mt-1 text-xs text-zinc-500">
              {includeUtilities
                ? t("settings.includeUtilitiesOn")
                : t("settings.includeUtilitiesOff")}
            </p>

            {includeUtilities && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1 text-sm">
                  <span className="font-medium">{t("settings.waterRate")}</span>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    step={0.01}
                    value={waterRate}
                    onChange={(event) => setWaterRate(event.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="font-medium">{t("settings.electricRate")}</span>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    step={0.01}
                    value={electricRate}
                    onChange={(event) => setElectricRate(event.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
                  />
                </label>
              </div>
            )}
          </div>

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
            <p className="text-xs text-zinc-500">{t("settings.contactLineUrlHint")}</p>
          </label>

          <ContactLineQrSkin
            propertySlug={propertySlug}
            qrUrl={contactLineQrUrl || null}
            onUploaded={setContactLineQrUrl}
            onRemove={() => {
              setContactLineQrUrl("");
              void save({ contact_line_qr_url: null });
            }}
          />

          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("settings.contactPhone")}</span>
            <input
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              placeholder="0812345678"
              inputMode="numeric"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <OwnerLineNotifySkin
            propertySlug={propertySlug}
            ownerLineUserId={ownerLineUserId || null}
            onDisconnect={() => {
              setOwnerLineUserId("");
              void save({ owner_line_user_id: null });
            }}
          />

          <button
            type="button"
            disabled={status === "loading" || status === "saving"}
            onClick={() =>
              void save({
                prompt_pay: promptPay,
                bank_account: bankAccount,
                receiver_name: receiverName,
                contact_line_url: contactLineUrl,
                contact_line_qr_url: contactLineQrUrl || null,
                contact_phone: contactPhone,
                owner_line_user_id: ownerLineUserId || null,
                billing_day: Number(billingDay),
                meter_reminder_days_before: Number(meterReminderDays),
                include_utilities: includeUtilities,
                water_rate_per_unit: Number(waterRate),
                electric_rate_per_unit: Number(electricRate),
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
            </>
          )}
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
