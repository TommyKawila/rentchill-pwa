"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { PlanUsageSkin } from "@/components/skins/minimal/PlanUsageSkin";
import { BillingCommandCenterSkin } from "@/components/skins/minimal/BillingCommandCenterSkin";
import { RentFollowUpStatusSkin } from "@/components/skins/minimal/RentFollowUpStatusSkin";
import { BillingQuestRewardSkin } from "@/components/skins/minimal/BillingQuestRewardSkin";
import { OwnerDashboardAlertsSkin } from "@/components/skins/minimal/OwnerDashboardAlertsSkin";
import { OwnerDashboardShell } from "@/components/skins/minimal/OwnerDashboardShell";
import { ShareLinkModal } from "@/components/skins/minimal/ShareLinkModal";
import { RoomListSkin } from "@/components/skins/minimal/RoomListSkin";
import { RoomDetailModal } from "@/components/skins/minimal/RoomDetailModal";
import { SubscriptionBannerSkin } from "@/components/skins/minimal/SubscriptionBannerSkin";
import { useAddRoomTenant } from "@/hooks/useAddRoomTenant";
import { useCsvExport } from "@/hooks/useCsvExport";
import { useInvoiceOverride } from "@/hooks/useInvoiceOverride";
import { useMagicLink } from "@/hooks/useMagicLink";
import { useMaintenanceTickets } from "@/hooks/useMaintenanceTickets";
import { useMonthlyBilling } from "@/hooks/useMonthlyBilling";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { useOwnerSubscription } from "@/hooks/useOwnerSubscription";
import { usePropertyPlan } from "@/hooks/usePropertyPlan";
import { usePaymentReminder } from "@/hooks/usePaymentReminder";
import type { BillingEntry } from "@/services/monthlyBillingService";
import {
  computeBillingReadiness,
  isInMeterReminderWindow,
  isRowEditable,
  isRowReadyToBill,
} from "@/services/propertyBillingSettingsService";
import { computeBillingOverview } from "@/services/billingOverviewService";
import { computeUnpaidReminderSummary } from "@/services/unpaidReminderSummaryService";
import {
  isChillMode,
  isQuestComplete,
  markRewardShown,
  shouldShowReward,
} from "@/services/billingQuestService";
import { AuditLogSkin } from "@/components/skins/minimal/AuditLogSkin";
import { BulkMeterDayModal } from "@/components/skins/minimal/BulkMeterDayModal";
import { useAuditLog } from "@/hooks/useAuditLog";
import { canAutoVerifySlip, canUseBulkMeterDay } from "@/services/planLimits";
import { resolveOwnerPropertySlug } from "@/services/resolveOwnerPropertySlug";
import {
  getNextPendingMeterRoom,
  isRoomListScrollHash,
  roomFilterFromHash,
} from "@/services/roomListFilterService";
import { saveBillingDraft } from "@/services/billingDraftService";
import type { RoomDetailSavingAction } from "@/components/skins/minimal/RoomDetailBillingFooterSkin";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { PlanTierSwitcherSkin } from "@/components/skins/minimal/PlanTierSwitcherSkin";
import { TrialBannerSkin } from "@/components/skins/minimal/TrialBannerSkin";
import type { PlanTier } from "@/services/propertyQuotaService";

function DashboardContent() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugFromUrl = searchParams.get("property");

  const { properties, status: propertiesStatus, error: propertiesError } =
    useOwnerProperties();

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
    router.replace(`/dashboard?property=${encodeURIComponent(propertySlug)}`);
  }, [propertiesStatus, properties.length, slugFromUrl, propertySlug, router]);

  const billing = useMonthlyBilling(propertySlug);
  const maintenance = useMaintenanceTickets(propertySlug);
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, []);

  const activeTab =
    hash === "#billing" ||
    hash === "#billing-notBilled" ||
    hash === "#billing-pendingMeter" ||
    hash === "#billing-unpaid"
      ? "billing"
      : hash === "#rooms" || hash === "#owner-rooms"
        ? "rooms"
        : "home";

  const roomListUrlFilter = roomFilterFromHash(hash);

  useEffect(() => {
    if (!isRoomListScrollHash(hash)) return;
    const el = document.getElementById("owner-rooms");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash, billing.rows.length]);

  const override = useInvoiceOverride(propertySlug);
  const reminder = usePaymentReminder(propertySlug);
  const csvExport = useCsvExport(propertySlug);
  const magicLink = useMagicLink(propertySlug);
  const propertyPlan = usePropertyPlan(propertySlug);
  const ownerSubscription = useOwnerSubscription();
  const addRoomTenant = useAddRoomTenant(propertySlug);
  const planTier = propertyPlan.plan?.plan_tier ?? "starter";
  const auditLog = useAuditLog(propertySlug ?? "", planTier);
  const trial = useTrialStatus();

  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [bulkMeterOpen, setBulkMeterOpen] = useState(false);
  const [bulkMeterUploading, setBulkMeterUploading] = useState(false);
  const [questRewardOpen, setQuestRewardOpen] = useState(false);
  const [roomDetailSaving, setRoomDetailSaving] =
    useState<RoomDetailSavingAction>(null);
  const prevNotIssuedRef = useRef<number | null>(null);
  const [meters, setMeters] = useState<
    Record<string, { water: string; electric: string }>
  >({});

  useEffect(() => {
    setMeters(
      Object.fromEntries(
        billing.rows.map((row) => [
          row.tenant_id,
          {
            water:
              row.water_curr !== null ? String(row.water_curr) : "",
            electric:
              row.electric_curr !== null ? String(row.electric_curr) : "",
          },
        ]),
      ),
    );
  }, [billing.rows]);

  const listRows = useMemo(() => {
    const sorted = [...billing.rows].sort((a, b) =>
      a.room_number.localeCompare(b.room_number, undefined, { numeric: true }),
    );
    return sorted.map((row, index) => ({ ...row, no: index + 1 }));
  }, [billing.rows]);

  const billingReadiness = useMemo(
    () =>
      computeBillingReadiness(
        billing.rows,
        meters,
        billing.settings.include_utilities,
      ),
    [billing.rows, meters, billing.settings.include_utilities],
  );

  const { readyCount, pendingMeterCount } = billingReadiness;

  const overview = useMemo(
    () => computeBillingOverview(billing.rows),
    [billing.rows],
  );

  const unpaidReminderSummary = useMemo(
    () => computeUnpaidReminderSummary(billing.rows),
    [billing.rows],
  );

  const showMeterReminder = useMemo(() => {
    const inWindow = isInMeterReminderWindow(
      billing.settings.billing_day,
      billing.settings.meter_reminder_days_before,
    );
    if (!inWindow || !billing.settings.include_utilities) return false;
    return billing.rows.some(
      (row) =>
        isRowEditable(row) &&
        !isRowReadyToBill(
          row,
          meters[row.tenant_id] ?? { water: "", electric: "" },
          true,
        ),
    );
  }, [billing.rows, billing.settings, meters]);

  const chillMode = useMemo(
    () => isChillMode(overview, showMeterReminder),
    [overview, showMeterReminder],
  );

  useEffect(() => {
    prevNotIssuedRef.current = null;
  }, [propertySlug, billing.billingMonth]);

  useEffect(() => {
    if (!propertySlug) return;
    const prev = prevNotIssuedRef.current;
    if (
      prev !== null &&
      prev > 0 &&
      overview.notIssued === 0 &&
      isQuestComplete(overview) &&
      shouldShowReward(propertySlug, billing.billingMonth)
    ) {
      setQuestRewardOpen(true);
    }
    prevNotIssuedRef.current = overview.notIssued;
  }, [overview.notIssued, overview.total, propertySlug, billing.billingMonth]);

  const handleQuestRewardDismiss = () => {
    if (propertySlug) {
      markRewardShown(propertySlug, billing.billingMonth);
    }
    setQuestRewardOpen(false);
  };

  const selectedRow = useMemo(
    () => listRows.find((row) => row.tenant_id === selectedTenantId) ?? null,
    [listRows, selectedTenantId],
  );

  const roomListCtx = useMemo(
    () => ({
      meters,
      includeUtilities: billing.settings.include_utilities,
    }),
    [meters, billing.settings.include_utilities],
  );

  const nextPendingMeterRoom = useMemo(() => {
    if (!selectedRow) return null;
    return getNextPendingMeterRoom(billing.rows, selectedRow.tenant_id, roomListCtx);
  }, [billing.rows, selectedRow, roomListCtx]);

  const goFillMeters = useCallback(() => {
    if (!propertySlug) return;
    const target = "#billing-pendingMeter";
    const base = `/dashboard?property=${encodeURIComponent(propertySlug)}`;
    window.history.pushState(null, "", `${base}${target}`);
    setHash(target);
    setSelectedTenantId(null);
    requestAnimationFrame(() => {
      document.getElementById("owner-rooms")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [propertySlug]);

  const bulkMeterRows = useMemo(
    () => listRows.filter((row) => isRowEditable(row)),
    [listRows],
  );

  const activeInvoice = useMemo(() => {
    if (!selectedTenantId) return null;
    return (
      override.invoices.find((invoice) => invoice.tenant_id === selectedTenantId) ??
      null
    );
  }, [override.invoices, selectedTenantId]);

  const pendingInvoice = useMemo(
    () => (activeInvoice?.status === "pending" ? activeInvoice : null),
    [activeInvoice],
  );

  const scanningAnomalyInvoice = useMemo(() => {
    if (!activeInvoice || activeInvoice.status !== "scanning") return null;
    if (activeInvoice.slip_image_url?.trim()) return null;
    return activeInvoice;
  }, [activeInvoice]);

  const scanningInvoice = useMemo(() => {
    if (!activeInvoice || activeInvoice.status !== "scanning") return null;
    if (!activeInvoice.slip_image_url?.trim()) return null;
    return activeInvoice;
  }, [activeInvoice]);

  const paidInvoice = useMemo(() => {
    if (!selectedTenantId) return null;
    return (
      override.paidInvoices.find(
        (invoice) => invoice.tenant_id === selectedTenantId,
      ) ?? null
    );
  }, [override.paidInvoices, selectedTenantId]);

  const isSaving =
    billing.status === "saving" ||
    roomDetailSaving !== null ||
    addRoomTenant.status === "saving" ||
    override.status === "saving" ||
    reminder.status === "sending" ||
    csvExport.status === "exporting" ||
    magicLink.status === "creating";

  const lineQuotaHint = useMemo(() => {
    if (!reminder.quota) return null;
    if (reminder.quota.line_push_remaining > reminder.quota.line_push_limit * 0.2) {
      return null;
    }
    return t("owner.line.quota", {
      remaining: reminder.quota.line_push_remaining,
      limit: reminder.quota.line_push_limit,
    });
  }, [reminder.quota, t]);

  const exportErrorMessage = useMemo(() => {
    if (!csvExport.error) return null;
    if (csvExport.error === "QUOTA_EXCEEDED") return t("owner.csv.quotaExceeded");
    if (csvExport.error === "NO_DATA") return t("owner.csv.noData");
    return csvExport.error;
  }, [csvExport.error, t]);

  const operationError = useMemo(() => {
    if (!propertySlug) return null;
    if (billing.error === "METER_REQUIRED") return t("owner.billing.meterRequired");
    if (billing.error === "BASELINE_REQUIRED") return t("owner.billing.baselineRequired");
    if (reminder.error === "QUOTA_EXCEEDED") return t("owner.line.quotaExceeded");
    if (override.error === "SLIP_VERIFY_PLAN_REQUIRED") return t("owner.plan.slipVerifyStarter");
    return (
      billing.error ??
      override.error ??
      reminder.error ??
      exportErrorMessage ??
      magicLink.error
    );
  }, [
    propertySlug,
    billing.error,
    override.error,
    reminder.error,
    exportErrorMessage,
    magicLink.error,
    t,
  ]);

  const handleBulkSubmit = () => {
    const entries: BillingEntry[] = billing.rows
      .filter((row) =>
        isRowReadyToBill(
          row,
          meters[row.tenant_id] ?? { water: "", electric: "" },
          billing.settings.include_utilities,
        ),
      )
      .map((row) => ({
        tenant_id: row.tenant_id,
        room_id: row.room_id,
        water_curr: billing.settings.include_utilities
          ? Number(meters[row.tenant_id]?.water ?? 0)
          : 0,
        electric_curr: billing.settings.include_utilities
          ? Number(meters[row.tenant_id]?.electric ?? 0)
          : 0,
      }));

    void billing.generate(entries).then(() => {
      void override.reload();
      void auditLog.reload();
    });
  };

  const handleRoomSaveAndNext = () => {
    if (!propertySlug || !selectedRow) return;
    const rowMeters = meters[selectedRow.tenant_id] ?? { water: "", electric: "" };
    if (
      !isRowReadyToBill(
        selectedRow,
        rowMeters,
        billing.settings.include_utilities,
      )
    ) {
      return;
    }

    setRoomDetailSaving("save");
    const nextTenantId = nextPendingMeterRoom?.tenant_id ?? null;

    const finish = () => {
      setRoomDetailSaving(null);
      setSelectedTenantId(nextTenantId);
    };

    if (!billing.settings.include_utilities) {
      finish();
      return;
    }

    void saveBillingDraft({
      propertySlug,
      roomId: selectedRow.room_id,
      tenantId: selectedRow.tenant_id,
      billingMonth: billing.billingMonth,
      water: Number(rowMeters.water),
      electric: Number(rowMeters.electric),
    })
      .then(() => billing.reload())
      .then(finish)
      .catch(() => setRoomDetailSaving(null));
  };

  const handleRoomIssue = () => {
    if (!selectedRow) return;
    const rowMeters = meters[selectedRow.tenant_id] ?? { water: "", electric: "" };
    if (
      !isRowReadyToBill(
        selectedRow,
        rowMeters,
        billing.settings.include_utilities,
      )
    ) {
      return;
    }

    setRoomDetailSaving("issue");
    void billing
      .generate([
        {
          tenant_id: selectedRow.tenant_id,
          room_id: selectedRow.room_id,
          water_curr: billing.settings.include_utilities
            ? Number(rowMeters.water)
            : 0,
          electric_curr: billing.settings.include_utilities
            ? Number(rowMeters.electric)
            : 0,
        },
      ])
      .then(() => {
        void billing.reload();
        void override.reload();
        void auditLog.reload();
        setSelectedTenantId(null);
      })
      .finally(() => setRoomDetailSaving(null));
  };

  const handleAddRoom = (form: Parameters<typeof addRoomTenant.add>[0]) => {
    void addRoomTenant
      .add(form)
      .then(async (result) => {
        await billing.reload();
        setSelectedTenantId(result.tenant_id);
      })
      .catch(() => {});
  };

  const handleTrialPlanChange = (tier: PlanTier) => {
    void trial.setPlan(tier).then((ok) => {
      if (!ok) return;
      void propertyPlan.reload();
      void billing.reload();
    });
  };

  const tenantViewUrl = trial.isTrial && trial.status?.tenant_invite_code
    ? `/board?invite=${encodeURIComponent(trial.status.tenant_invite_code)}`
    : undefined;

  return (
    <OwnerDashboardShell
      propertySlug={propertySlug}
      properties={properties}
      propertiesLoading={propertiesStatus === "loading"}
      onPropertyChange={(slug) =>
        router.replace(`/dashboard?property=${encodeURIComponent(slug)}`)
      }
      onLogout={() => {
        void fetch("/api/admin/login", { method: "DELETE" }).then(() => {
          router.replace(trial.isTrial ? "/try" : "/admin/login");
        });
      }}
      billingMonth={billing.billingMonth}
      overview={overview}
      chillMode={chillMode}
      onExportCsv={() => void csvExport.exportCsv()}
      csvDisabled={isSaving || !csvExport.canExport}
      csvLoading={csvExport.status === "exporting"}
      onOpenShareLink={() => setShareModalOpen(true)}
      shareDisabled={isSaving || magicLink.status === "loading"}
      planUsage={
        propertyPlan.plan && propertySlug ? (
          <PlanUsageSkin
            plan={propertyPlan.plan}
            billingHref={
              trial.isTrial
                ? undefined
                : `/billing?property=${encodeURIComponent(propertySlug)}`
            }
          />
        ) : undefined
      }
      trialBanner={
        trial.isTrial ? (
          <TrialBannerSkin resetExpiresAt={trial.status?.reset_expires_at} />
        ) : undefined
      }
      planSwitcher={
        trial.isTrial && trial.status?.plan_tier ? (
          <PlanTierSwitcherSkin
            currentTier={trial.status.plan_tier}
            disabled={trial.switching || isSaving}
            onSelect={handleTrialPlanChange}
          />
        ) : undefined
      }
      tenantViewUrl={tenantViewUrl}
      activeTab={activeTab}
    >
      {ownerSubscription.subscription && !trial.isTrial && (
        <SubscriptionBannerSkin
          subscription={ownerSubscription.subscription}
          propertySlug={propertySlug}
        />
      )}

      {propertiesStatus === "idle" && properties.length === 0 && (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center">
          <p className="font-medium text-zinc-900">
            {t("owner.onboarding.noProjectTitle")}
          </p>
          <p className="mt-2 text-zinc-500">
            {t("owner.onboarding.noProjectDesc")}
          </p>
          <a
            href="/settings"
            className="mt-4 inline-flex min-h-14 items-center justify-center rounded-lg bg-rc-green px-6 text-base font-medium text-white hover:bg-rc-green-dark"
          >
            {t("owner.onboarding.createProject")}
          </a>
        </div>
      )}

      <OwnerDashboardAlertsSkin
        propertiesError={propertiesError}
        meterReminder={
          propertySlug && showMeterReminder
            ? t("owner.billing.meterReminder", {
                day: billing.settings.billing_day,
              })
            : null
        }
        lineQuotaHint={propertySlug ? lineQuotaHint : null}
        operationError={operationError}
        maintenanceWaitingCount={maintenance.waitingCount}
        maintenanceHref={
          propertySlug
            ? `/maintenance?property=${encodeURIComponent(propertySlug)}`
            : null
        }
      />

      {propertySlug && (
        <BillingCommandCenterSkin
          notIssued={overview.notIssued}
          readyCount={readyCount}
          pendingMeterCount={pendingMeterCount}
          includeUtilities={billing.settings.include_utilities}
          canBulkMeterDay={
            canUseBulkMeterDay(planTier) &&
            billing.settings.include_utilities &&
            bulkMeterRows.length > 0
          }
          disabled={isSaving}
          saving={billing.status === "saving"}
          onGoFillMeters={goFillMeters}
          onBulkMeterDay={() => setBulkMeterOpen(true)}
          onBulkIssue={handleBulkSubmit}
          result={billing.result}
        />
      )}

      {propertySlug && (
        <RentFollowUpStatusSkin
          summary={unpaidReminderSummary}
          propertySlug={propertySlug}
        />
      )}

      {propertySlug && billing.status === "loading" && billing.rows.length === 0 && (
        <p className="text-zinc-500">{t("owner.loading.rooms")}</p>
      )}

      {propertySlug && (
      <>
      <RoomListSkin
        propertySlug={propertySlug}
        billingDay={billing.settings.billing_day}
        includeUtilities={billing.settings.include_utilities}
        waterRate={billing.settings.water_rate_per_unit}
        electricRate={billing.settings.electric_rate_per_unit}
        rows={listRows}
        meters={meters}
        disabled={isSaving}
        onSelect={setSelectedTenantId}
        onAddRoom={handleAddRoom}
        addRoomSaving={addRoomTenant.status === "saving"}
        addRoomError={addRoomTenant.error}
        canAddRoom={
          propertyPlan.plan
            ? propertyPlan.plan.rooms_remaining > 0
            : true
        }
        roomsRemaining={propertyPlan.plan?.rooms_remaining}
        billingHref={
          propertySlug
            ? `/billing?property=${encodeURIComponent(propertySlug)}`
            : undefined
        }
        urlFilter={roomListUrlFilter}
        reminderSoftDays={billing.settings.reminder_soft_days}
        reminderFirmDays={billing.settings.reminder_firm_days}
        reminderFinalDays={billing.settings.reminder_final_days}
      />
      <AuditLogSkin
        planTier={planTier}
        entries={auditLog.entries}
        loading={auditLog.status === "loading"}
        error={auditLog.error}
      />
      </>
      )}

      {propertySlug && selectedRow && (
        <RoomDetailModal
          row={selectedRow}
          propertySlug={propertySlug}
          planTier={propertyPlan.plan?.plan_tier ?? "starter"}
          billingMonth={billing.billingMonth}
          includeUtilities={billing.settings.include_utilities}
          waterRate={billing.settings.water_rate_per_unit}
          electricRate={billing.settings.electric_rate_per_unit}
          pendingInvoice={pendingInvoice}
          scanningAnomalyInvoice={scanningAnomalyInvoice}
          scanningInvoice={scanningInvoice}
          paidInvoice={paidInvoice}
          autoVerifyEnabled={
            propertyPlan.plan
              ? canAutoVerifySlip(propertyPlan.plan.plan_tier)
              : true
          }
          billingHref={
            propertySlug
              ? `/billing?property=${encodeURIComponent(propertySlug)}`
              : undefined
          }
          disabled={isSaving}
          overrideSavingAction={override.savingAction}
          canRemind={reminder.canRemind}
          reminderDisabled={
            reminder.status === "loading" || reminder.status === "sending"
          }
          remindedTenantId={reminder.lastRemindedTenantId}
          meters={
            meters[selectedRow.tenant_id] ?? {
              water:
                selectedRow.water_curr !== null
                  ? String(selectedRow.water_curr)
                  : "",
              electric:
                selectedRow.electric_curr !== null
                  ? String(selectedRow.electric_curr)
                  : "",
            }
          }
          onClose={() => setSelectedTenantId(null)}
          onMeterChange={(tenantId, water, electric) =>
            setMeters((prev) => ({
              ...prev,
              [tenantId]: { water, electric },
            }))
          }
          onRemind={(tenantId, tier) => {
            void (async () => {
              const ok = await reminder.remind(tenantId, tier);
              if (ok) await billing.reload();
            })();
          }}
          onAutoVerify={(invoiceId) => void override.verifySlipAuto(invoiceId)}
          onReject={(invoiceId, note) => void override.rejectSlip(invoiceId, note)}
          onApprove={(invoiceId, input) =>
            void override.approveInvoice(invoiceId, input).then((ok) => {
              if (ok) {
                void billing.reload();
                void auditLog.reload();
              }
            })
          }
          onTenantUpdated={() => void billing.reload()}
          roomDetailSaving={roomDetailSaving}
          hasNextRoom={nextPendingMeterRoom !== null}
          readyCount={readyCount}
          onSaveAndNext={handleRoomSaveAndNext}
          onIssueRoom={handleRoomIssue}
        />
      )}

      {propertySlug && shareModalOpen && (
        <ShareLinkModal
          disabled={isSaving || magicLink.status === "creating"}
          linkUrl={magicLink.link?.url}
          expiresAt={magicLink.link?.expires_at}
          isPermanent={magicLink.link?.is_permanent}
          copied={magicLink.copied}
          onClose={() => setShareModalOpen(false)}
          onCreate={() => void magicLink.createLink()}
          onCopy={() => void magicLink.copyLink()}
        />
      )}

      {propertySlug && bulkMeterOpen && bulkMeterRows.length > 0 && (
        <BulkMeterDayModal
          rows={bulkMeterRows}
          billingMonth={billing.billingMonth}
          includeUtilities={billing.settings.include_utilities}
          waterRate={billing.settings.water_rate_per_unit}
          electricRate={billing.settings.electric_rate_per_unit}
          meters={meters}
          disabled={isSaving}
          uploading={bulkMeterUploading}
          onClose={() => setBulkMeterOpen(false)}
          onMeterChange={(tenantId, water, electric) =>
            setMeters((prev) => ({
              ...prev,
              [tenantId]: { water, electric },
            }))
          }
          onUploadPhoto={async (row, utility, file) => {
            if (!propertySlug) return;
            setBulkMeterUploading(true);
            try {
              const formData = new FormData();
              formData.set("file", file);
              formData.set("utility_type", utility);
              formData.set("billing_month", billing.billingMonth);
              formData.set("tenant_id", row.tenant_id);
              const response = await fetch(
                `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(row.room_id)}/meter-photos`,
                { method: "POST", body: formData },
              );
              if (!response.ok) throw new Error("upload failed");
              void auditLog.reload();
            } finally {
              setBulkMeterUploading(false);
            }
          }}
        />
      )}

      <BillingQuestRewardSkin
        open={questRewardOpen}
        onDismiss={handleQuestRewardDismiss}
      />
    </OwnerDashboardShell>
  );
}

export default function DashboardPage() {
  const { t } = useLocale();

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          {t("common.loading")}
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
