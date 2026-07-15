"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { useEasyMode } from "@/components/EasyModeProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { OwnerBottomNavSkin } from "@/components/skins/minimal/OwnerBottomNavSkin";
import { OwnerPushNotificationPrompts } from "@/components/skins/minimal/OwnerPushNotificationPrompts";
import { ProjectManageSkin } from "@/components/skins/minimal/ProjectManageSkin";
import { ProjectSelectorSkin } from "@/components/skins/minimal/ProjectSelectorSkin";
import { SettingsBillingModalSkin } from "@/components/skins/minimal/SettingsBillingModalSkin";
import { SettingsContactModalSkin } from "@/components/skins/minimal/SettingsContactModalSkin";
import { SettingsDisplayModalSkin } from "@/components/skins/minimal/SettingsDisplayModalSkin";
import { SettingsMarketingModalSkin } from "@/components/skins/minimal/SettingsMarketingModalSkin";
import { SettingsNotifyModalSkin } from "@/components/skins/minimal/SettingsNotifyModalSkin";
import { SettingsPaymentAccountModalSkin } from "@/components/skins/minimal/SettingsPaymentAccountModalSkin";
import { SettingsSectionRowSkin } from "@/components/skins/minimal/SettingsSectionRowSkin";
import { SettingsTechnicianModalSkin } from "@/components/skins/minimal/SettingsTechnicianModalSkin";
import {
  isProjectSlugPayloadValid,
  ProjectSlugEditorSkin,
  type ProjectSlugPayload,
} from "@/components/skins/minimal/ProjectSlugEditorSkin";
import { useBillingMonthDisplayFormat } from "@/hooks/useBillingMonthDisplayFormat";
import { useCreateProject } from "@/hooks/useCreateProject";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { useProjectManage } from "@/hooks/useProjectManage";
import { usePropertyMarketing } from "@/hooks/usePropertyMarketing";
import { usePropertyPaymentSettings } from "@/hooks/usePropertyPaymentSettings";
import { usePushNotificationPrompt } from "@/hooks/usePushNotificationPrompt";
import { resolveOwnerPropertySlug } from "@/services/resolveOwnerPropertySlug";
import { slugValidationMessageKey } from "@/services/propertySlugUtils";
import {
  buildContactSummary,
  buildDisplaySummaryParts,
  buildMarketingSummary,
  buildNotifySummary,
  buildPaymentAccountSummary,
  formatTechnicianSummaryEntry,
} from "@/services/settingsSummaryService";
import type { TechnicianDept } from "@/services/types";

type SettingsSectionId =
  | "payment"
  | "display"
  | "billing"
  | "marketing"
  | "contact"
  | "technician"
  | "notify";

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

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

  const projectManage = useProjectManage(propertySlug);
  const { account, status, error, save, reload: reloadSettings } =
    usePropertyPaymentSettings(propertySlug);
  const marketing = usePropertyMarketing(propertySlug);
  const push = usePushNotificationPrompt();
  const monthDisplay = useBillingMonthDisplayFormat();
  const { easyMode, setEasyMode } = useEasyMode();

  const [openSection, setOpenSection] = useState<SettingsSectionId | null>(null);
  const [billingHighlighted, setBillingHighlighted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [createSlugPayload, setCreateSlugPayload] = useState<ProjectSlugPayload>({
    manualSlug: null,
  });

  useEffect(() => {
    if (propertiesStatus !== "idle" || properties.length === 0) return;
    if (!propertySlug) return;
    if (slugFromUrl === propertySlug) return;
    router.replace(`/settings?property=${encodeURIComponent(propertySlug)}`);
  }, [propertiesStatus, properties.length, slugFromUrl, propertySlug, router]);

  useEffect(() => {
    const reloadOnFocus = () => {
      if (document.visibilityState === "visible" && propertySlug) {
        void reloadSettings();
      }
    };
    document.addEventListener("visibilitychange", reloadOnFocus);
    return () => document.removeEventListener("visibilitychange", reloadOnFocus);
  }, [propertySlug, reloadSettings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#billing") return;
    const timer = window.setTimeout(() => {
      document.getElementById("billing")?.scrollIntoView({ behavior: "smooth" });
      setBillingHighlighted(true);
      window.setTimeout(() => setBillingHighlighted(false), 2000);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [account]);

  const hasProject = properties.length > 0 && Boolean(propertySlug);

  const handlePropertyChange = (slug: string) => {
    router.replace(`/settings?property=${encodeURIComponent(slug)}`);
  };

  const handleCreateProject = async () => {
    if (!isProjectSlugPayloadValid(createSlugPayload)) return;
    try {
      const property = await createProject.create(
        newProjectName,
        createSlugPayload.manualSlug,
      );
      setShowAddForm(false);
      setNewProjectName("");
      setCreateSlugPayload({ manualSlug: null });
      await reloadProperties();
      router.replace(`/dashboard?property=${encodeURIComponent(property.slug)}`);
    } catch (err) {
      if (err instanceof Error && err.message === "PROJECT_LIMIT_EXCEEDED") {
        return;
      }
    }
  };

  const createSlugError =
    createProject.error &&
    createProject.error !== "PROJECT_LIMIT_EXCEEDED" &&
    (createProject.error === "SLUG_TAKEN" ||
      createProject.error === "SLUG_FORMAT" ||
      createProject.error === "SLUG_LENGTH" ||
      createProject.error === "SLUG_RESERVED")
      ? t(slugValidationMessageKey(createProject.error))
      : createProject.error;

  const displayParts = buildDisplaySummaryParts(monthDisplay.format, easyMode);
  const displaySummary = `${t(displayParts.formatKey as Parameters<typeof t>[0])} · ${
    displayParts.easyOn ? t("settings.summary.easyOn") : t("settings.summary.easyOff")
  }`;

  const notifyParts = buildNotifySummary(
    Boolean(account?.owner_line_user_id?.trim()),
    push.permission,
  );
  const notifySummary = notifyParts.pushUnsupported
    ? notifyParts.lineConnected
      ? t("settings.summary.notifyLineOnly")
      : t("settings.summary.notifyLineOff")
    : t("settings.summary.notify", {
        line: notifyParts.lineConnected
          ? t("settings.summary.lineOn")
          : t("settings.summary.lineOff"),
        push: notifyParts.pushEnabled
          ? t("settings.summary.pushOn")
          : t("settings.summary.pushOff"),
      });

  const marketingSummaryRaw = buildMarketingSummary(marketing.marketing);
  const marketingPhotoCount = marketing.marketing?.gallery_urls?.length ?? 0;
  const marketingSummary = (() => {
    const parts: string[] = [];
    if (marketingPhotoCount > 0) {
      parts.push(
        t("settings.summary.marketingPhotos", {
          count: String(marketingPhotoCount),
        }),
      );
    }
    const address = marketing.marketing?.marketing_address?.trim();
    if (address) {
      parts.push(address.length > 24 ? `${address.slice(0, 24)}…` : address);
    }
    if (parts.length === 0 && marketingSummaryRaw) {
      parts.push(marketingSummaryRaw);
    }
    return parts.length > 0 ? parts.join(" · ") : t("settings.summary.marketingEmpty");
  })();

  const TECHNICIAN_DEPT_LABEL: Record<TechnicianDept, string> = {
    electrical: "settings.technician.dept.electrical",
    plumbing: "settings.technician.dept.plumbing",
    internet: "settings.technician.dept.internet",
  };
  const technicianSummary = (() => {
    const contacts = account?.technician_contacts ?? {};
    const parts = (["electrical", "plumbing", "internet"] as const)
      .map((dept) =>
        formatTechnicianSummaryEntry(
          t(TECHNICIAN_DEPT_LABEL[dept] as Parameters<typeof t>[0]),
          contacts[dept],
        ),
      )
      .filter((entry): entry is string => Boolean(entry));
    return parts.length > 0 ? parts.join(" · ") : t("settings.summary.technicianEmpty");
  })();

  const handleSave = save;

  return (
    <main className="min-h-screen bg-white px-4 py-6 pb-24 text-zinc-900">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-4 border-b border-zinc-100 pb-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium uppercase tracking-wide text-green-600">
              {t("settings.tag")}
            </p>
            <LocaleToggleSkin />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h1>

          <ProjectSelectorSkin
            properties={properties}
            value={propertySlug}
            loading={propertiesStatus === "loading"}
            onChange={handlePropertyChange}
            onAddClick={() => setShowAddForm((prev) => !prev)}
            addDisabled={createProject.status === "creating"}
          />

          {showAddForm && (
            <div className="mt-3 rounded-xl border border-zinc-100 bg-zinc-50 p-6">
              <label className="block space-y-1 text-sm text-zinc-500">
                <span className="font-medium text-zinc-900">{t("owner.projectName")}</span>
                <input
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
                  placeholder={t("owner.projectNamePlaceholder")}
                  className={inputClass}
                />
              </label>
              {newProjectName.trim() && (
                <div className="mt-3">
                  <ProjectSlugEditorSkin
                    name={newProjectName}
                    disabled={createProject.status === "creating"}
                    onChange={setCreateSlugPayload}
                  />
                </div>
              )}
              {createProject.error === "PROJECT_LIMIT_EXCEEDED" && (
                <div className="mt-2 text-sm text-amber-800">
                  <p>{t("owner.projectLimitReached")}</p>
                  <a
                    href={`/billing?property=${encodeURIComponent(propertySlug)}`}
                    className="inline-flex min-h-12 items-center underline"
                  >
                    {t("owner.planBilling.managePlan")}
                  </a>
                </div>
              )}
              {createSlugError &&
                createProject.error !== "PROJECT_LIMIT_EXCEEDED" && (
                  <p className="mt-2 text-sm text-red-600">{createSlugError}</p>
                )}
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  disabled={
                    createProject.status === "creating" ||
                    !newProjectName.trim() ||
                    !isProjectSlugPayloadValid(createSlugPayload)
                  }
                  onClick={() => void handleCreateProject()}
                  className="flex min-h-14 flex-1 items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
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
                    setCreateSlugPayload({ manualSlug: null });
                  }}
                  className="flex min-h-12 flex-1 items-center justify-center rounded-lg border border-zinc-200 text-base text-zinc-700"
                >
                  {t("owner.rooms.close")}
                </button>
              </div>
            </div>
          )}

          {hasProject && account && (
            <ProjectManageSkin
              propertyName={account.property_name}
              propertySlug={propertySlug}
              renaming={projectManage.status === "renaming"}
              deleting={projectManage.status === "deleting"}
              error={projectManage.error}
              onRename={async (name, manualSlug) => {
                const result = await projectManage.rename(name, manualSlug);
                await reloadProperties();
                router.replace(
                  `/settings?property=${encodeURIComponent(result.property.slug)}`,
                );
              }}
              onDelete={async () => {
                await projectManage.remove();
                const remaining = await reloadProperties();
                if (remaining && remaining.length > 0) {
                  router.replace(
                    `/settings?property=${encodeURIComponent(remaining[0].slug)}`,
                  );
                } else {
                  router.replace("/settings");
                }
              }}
            />
          )}
        </header>

        <section className="space-y-3">
          {!hasProject ? (
            <p className="text-base text-zinc-600">{t("owner.noProjectSettingsHint")}</p>
          ) : (
            <>
              {status === "loading" && (
                <p className="text-base text-zinc-500">{t("common.loading")}</p>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
                  {error}
                </div>
              )}

              {account && (
                <div className="space-y-3">
                  <SettingsSectionRowSkin
                    title={t("settings.row.paymentAccount")}
                    summary={
                      buildPaymentAccountSummary(account) ||
                      t("settings.summary.paymentEmpty")
                    }
                    disabled={status === "loading"}
                    onOpen={() => setOpenSection("payment")}
                  />
                  <SettingsSectionRowSkin
                    title={t("settings.displayTitle")}
                    summary={displaySummary}
                    onOpen={() => setOpenSection("display")}
                  />
                  <SettingsSectionRowSkin
                    id="billing"
                    title={t("settings.row.billing")}
                    summary={t("settings.summary.billing", {
                      day: String(account.billing_day),
                      soft: String(account.reminder_soft_days),
                      firm: String(account.reminder_firm_days),
                      final: String(account.reminder_final_days),
                    })}
                    highlighted={billingHighlighted}
                    disabled={status === "loading"}
                    onOpen={() => setOpenSection("billing")}
                  />
                  <SettingsSectionRowSkin
                    title={t("settings.marketingTitle")}
                    summary={marketingSummary}
                    disabled={marketing.status === "loading"}
                    onOpen={() => setOpenSection("marketing")}
                  />
                  <SettingsSectionRowSkin
                    title={t("settings.contactTitle")}
                    summary={
                      buildContactSummary(account) || t("settings.summary.contactEmpty")
                    }
                    disabled={status === "loading"}
                    onOpen={() => setOpenSection("contact")}
                  />
                  <SettingsSectionRowSkin
                    title={t("settings.row.technician")}
                    summary={technicianSummary}
                    disabled={status === "loading"}
                    onOpen={() => setOpenSection("technician")}
                  />
                  <SettingsSectionRowSkin
                    title={t("settings.row.notify")}
                    summary={notifySummary}
                    onOpen={() => setOpenSection("notify")}
                  />
                </div>
              )}

              <a
                href={`/billing?property=${encodeURIComponent(propertySlug)}`}
                className="flex min-h-12 items-center justify-center text-center text-base text-green-700 underline"
              >
                {t("owner.planBilling.managePlan")}
              </a>

              <a
                href={`/dashboard?property=${encodeURIComponent(propertySlug)}`}
                className="flex min-h-12 items-center justify-center text-center text-base text-zinc-600 underline"
              >
                {t("common.backToDashboard")}
              </a>
            </>
          )}
        </section>
      </div>

      {openSection === "payment" && account && (
        <SettingsPaymentAccountModalSkin
          promptPay={account.prompt_pay ?? ""}
          bankAccount={account.bank_account ?? ""}
          receiverName={account.receiver_name ?? ""}
          saving={status === "saving"}
          onClose={() => setOpenSection(null)}
          onSave={(input) => handleSave(input)}
        />
      )}

      {openSection === "display" && (
        <SettingsDisplayModalSkin
          format={monthDisplay.format}
          easyMode={easyMode}
          onFormatChange={monthDisplay.setFormat}
          onEasyModeChange={setEasyMode}
          onClose={() => setOpenSection(null)}
        />
      )}

      {openSection === "billing" && account && (
        <SettingsBillingModalSkin
          billingDay={account.billing_day}
          meterReminderDays={account.meter_reminder_days_before}
          reminderSoftDays={account.reminder_soft_days}
          reminderFirmDays={account.reminder_firm_days}
          reminderFinalDays={account.reminder_final_days}
          reminderTemplateSoft={account.reminder_template_soft}
          reminderTemplateFirm={account.reminder_template_firm}
          reminderTemplateFinal={account.reminder_template_final}
          includeUtilities={account.include_utilities}
          waterRate={account.water_rate_per_unit}
          electricRate={account.electric_rate_per_unit}
          saving={status === "saving"}
          onClose={() => setOpenSection(null)}
          onSave={(input) => handleSave(input)}
        />
      )}

      {openSection === "marketing" && propertySlug && (
        <SettingsMarketingModalSkin
          propertySlug={propertySlug}
          onClose={() => {
            setOpenSection(null);
            void marketing.reload();
          }}
        />
      )}

      {openSection === "contact" && account && propertySlug && (
        <SettingsContactModalSkin
          propertySlug={propertySlug}
          contactLineUrl={account.contact_line_url ?? ""}
          contactLineQrUrl={account.contact_line_qr_url ?? ""}
          contactPhone={account.contact_phone ?? ""}
          saving={status === "saving"}
          onClose={() => setOpenSection(null)}
          onSave={(input) => handleSave(input)}
          onQrRemove={() => {
            void handleSave({ contact_line_qr_url: null });
          }}
        />
      )}

      {openSection === "technician" && account && (
        <SettingsTechnicianModalSkin
          contacts={account.technician_contacts}
          saving={status === "saving"}
          onClose={() => setOpenSection(null)}
          onSave={(input) => handleSave(input)}
        />
      )}

      {openSection === "notify" && propertySlug && account && (
        <SettingsNotifyModalSkin
          propertySlug={propertySlug}
          ownerLineUserId={account.owner_line_user_id}
          pushPermission={push.permission}
          pushConfigured={Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)}
          pushRequesting={push.requesting}
          onDisconnectLine={() => {
            void handleSave({ owner_line_user_id: null });
          }}
          onEnablePush={() => void push.requestPermission()}
          onClose={() => setOpenSection(null)}
        />
      )}

      {propertySlug && (
        <OwnerBottomNavSkin activeTab="home" propertySlug={propertySlug} />
      )}

      <OwnerPushNotificationPrompts push={push} />
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
