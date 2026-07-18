"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { AccountingHubSkin } from "@/components/skins/minimal/AccountingHubSkin";
import { DashboardHeaderSkin } from "@/components/skins/minimal/DashboardHeaderSkin";
import { DashboardSummaryCarouselSkin } from "@/components/skins/minimal/DashboardSummaryCarouselSkin";
import { BillingQuestRewardSkin } from "@/components/skins/minimal/BillingQuestRewardSkin";
import { OwnerDashboardAlertsSkin } from "@/components/skins/minimal/OwnerDashboardAlertsSkin";
import { OwnerDashboardShell } from "@/components/skins/minimal/OwnerDashboardShell";
import { ProjectSelectorSkin } from "@/components/skins/minimal/ProjectSelectorSkin";
import { RoomListSkin } from "@/components/skins/minimal/RoomListSkin";
import { RoomDetailModal } from "@/components/skins/minimal/RoomDetailModal";
import { SubscriptionBannerSkin } from "@/components/skins/minimal/SubscriptionBannerSkin";
import { useAddRoomTenant } from "@/hooks/useAddRoomTenant";
import { VacantRoomManageModalSkin } from "@/components/skins/minimal/VacantRoomManageModalSkin";
import { useMoveOutTenant, useDeleteVacantRoom, useAssignVacantRoomTenant } from "@/hooks/useRoomLifecycle";
import type { VacantRoomRow } from "@/services/vacantRoomService";
import { useInvoiceOverride } from "@/hooks/useInvoiceOverride";
import { useMagicLink } from "@/hooks/useMagicLink";
import { useMaintenanceTickets } from "@/hooks/useMaintenanceTickets";
import { useMonthlyBilling } from "@/hooks/useMonthlyBilling";
import { useCashFlowBento } from "@/hooks/useCashFlowBento";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { useOwnerSubscription } from "@/hooks/useOwnerSubscription";
import { usePropertyPlan } from "@/hooks/usePropertyPlan";
import { usePaymentReminder } from "@/hooks/usePaymentReminder";
import { useOwnerProfile } from "@/hooks/useOwnerProfile";
import { useVacantRooms } from "@/hooks/useVacantRooms";
import { usePropertyMarketing } from "@/hooks/usePropertyMarketing";
import { useBillingMonthDisplayFormat } from "@/hooks/useBillingMonthDisplayFormat";
import type { BillingEntry } from "@/services/monthlyBillingService";
import { usePropertyPaymentSettings } from "@/hooks/usePropertyPaymentSettings";
import type { InvoiceGeneratorIssueInput } from "@/components/skins/minimal/InvoiceGeneratorSkin";
import {
  computeBillingReadiness,
  isInMeterReminderWindow,
  isRowEditable,
  isRowReadyToBill,
} from "@/services/propertyBillingSettingsService";
import { computeBillingOverview } from "@/services/billingOverviewService";
import {
  computeOccupancyMetrics,
  computeRevenueMetrics,
} from "@/services/dashboardMetricsService";
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
import { useSubscription } from "@/hooks/useSubscription";
import {
  canAutoVerifySlip,
  canUseBulkMeterDay,
  getProjectLimit,
} from "@/services/planLimits";
import { resolveOwnerPropertySlug } from "@/services/resolveOwnerPropertySlug";
import {
  getFirstPendingMeterRoom,
  getNextPendingMeterRoom,
  isAccountingHubHash,
  isRoomListScrollHash,
  roomFilterFromHash,
} from "@/services/roomListFilterService";
import { saveBillingDraft } from "@/services/billingDraftService";
import type { RoomDetailSavingAction } from "@/components/skins/minimal/RoomDetailBillingFooterSkin";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { TrialBannerSkin } from "@/components/skins/minimal/TrialBannerSkin";

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
  const cashFlowBento = useCashFlowBento(
    propertySlug,
    billing.billingMonth,
    billing.rows,
  );
  const paymentSettings = usePropertyPaymentSettings(propertySlug);
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

  const activeTab = isAccountingHubHash(hash) ? "accounting" : "home";

  const ownerProfile = useOwnerProfile();
  const vacantRooms = useVacantRooms(propertySlug);
  const marketing = usePropertyMarketing(propertySlug);
  const { formatMonth } = useBillingMonthDisplayFormat();

  useEffect(() => {
    if (activeTab !== "home") return;
    if (!isRoomListScrollHash(hash)) return;

    let cancelled = false;
    let attempts = 0;

    const scrollToRooms = () => {
      if (cancelled || attempts > 24) return;
      attempts += 1;
      const el = document.getElementById("owner-rooms");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.requestAnimationFrame(scrollToRooms);
    };

    scrollToRooms();
    return () => {
      cancelled = true;
    };
  }, [hash, activeTab, billing.rows.length]);

  const override = useInvoiceOverride(propertySlug);
  const reminder = usePaymentReminder(propertySlug);
  const magicLink = useMagicLink(propertySlug);
  const propertyPlan = usePropertyPlan(propertySlug);
  const subscription = useSubscription(propertySlug ?? "");
  const moveOutTenant = useMoveOutTenant(propertySlug ?? "");
  const deleteVacantRoom = useDeleteVacantRoom(propertySlug ?? "");
  const assignVacantTenant = useAssignVacantRoomTenant(propertySlug ?? "");
  const ownerSubscription = useOwnerSubscription();
  const addRoomTenant = useAddRoomTenant(propertySlug);
  const planTier = propertyPlan.plan?.plan_tier ?? "free";
  const canAddProjectOnChip = useMemo(
    () =>
      properties.length > 1 &&
      properties.length < getProjectLimit(planTier),
    [properties.length, planTier],
  );
  const overRoomLimit =
    propertyPlan.plan && propertyPlan.plan.room_count > propertyPlan.plan.room_limit
      ? {
          count: propertyPlan.plan.room_count,
          limit: propertyPlan.plan.room_limit,
        }
      : undefined;
  const auditLog = useAuditLog(propertySlug ?? "", planTier);
  const trial = useTrialStatus();

  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [vacantManageTarget, setVacantManageTarget] = useState<VacantRoomRow | null>(null);
  const [approveSuccessTenantId, setApproveSuccessTenantId] = useState<string | null>(
    null,
  );
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
    () => computeBillingReadiness(billing.rows, meters, billing.settings),
    [billing.rows, meters, billing.settings],
  );

  const billingReadinessOptions = useMemo(
    () => ({
      water_billing_mode: billing.settings.water_billing_mode,
      water_flat_baht: billing.settings.water_flat_baht,
    }),
    [billing.settings.water_billing_mode, billing.settings.water_flat_baht],
  );

  const { readyCount, pendingMeterCount } = billingReadiness;

  const overview = useMemo(
    () => computeBillingOverview(billing.rows),
    [billing.rows],
  );

  const currentProperty = useMemo(
    () => properties.find((p) => p.slug === propertySlug) ?? null,
    [properties, propertySlug],
  );

  const revenueMetrics = useMemo(
    () => computeRevenueMetrics(billing.rows),
    [billing.rows],
  );

  const occupancyMetrics = useMemo(
    () =>
      computeOccupancyMetrics(billing.rows.length, vacantRooms.rooms),
    [billing.rows.length, vacantRooms.rooms],
  );

  const coverUrl = marketing.marketing?.gallery_urls?.[0] ?? null;
  const billingMonthLabel = formatMonth(billing.billingMonth);

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
          billing.settings.include_utilities,
          billingReadinessOptions,
        ),
    );
  }, [billing.rows, billing.settings, meters, billingReadinessOptions]);

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
      billingSettings: billingReadinessOptions,
    }),
    [meters, billing.settings.include_utilities, billingReadinessOptions],
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
  }, [propertySlug]);

  const listFilterBanner = useMemo(() => {
    const filter = roomFilterFromHash(hash);
    if (filter === "pendingMeter") {
      return t("owner.command.pendingMeterStat", { count: pendingMeterCount });
    }
    if (filter === "notBilled") {
      return t("owner.command.notIssuedStat", { count: overview.notIssued });
    }
    if (filter === "unpaid") {
      return t("owner.command.unpaidStat");
    }
    return null;
  }, [hash, pendingMeterCount, overview.notIssued, t]);

  useEffect(() => {
    if (activeTab !== "home") return;
    if (hash !== "#billing-pendingMeter") return;
    if (billing.status === "loading" || listRows.length === 0) return;
    if (selectedTenantId) return;

    const first = getFirstPendingMeterRoom(listRows, roomListCtx);
    if (first) {
      setSelectedTenantId(first.tenant_id);
    }
  }, [
    activeTab,
    hash,
    billing.status,
    listRows,
    roomListCtx,
    selectedTenantId,
  ]);

  const clearListHash = useCallback(() => {
    if (!propertySlug) return;
    if (!roomFilterFromHash(hash)) return;
    const base = `/dashboard?property=${encodeURIComponent(propertySlug)}`;
    window.history.replaceState(null, "", base);
    setHash("");
  }, [hash, propertySlug]);

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
      magicLink.error
    );
  }, [
    propertySlug,
    billing.error,
    override.error,
    reminder.error,
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
          billingReadinessOptions,
        ),
      )
      .map((row) => {
        const entry: BillingEntry = {
          tenant_id: row.tenant_id,
          room_id: row.room_id,
          electric_curr: billing.settings.include_utilities
            ? Number(meters[row.tenant_id]?.electric ?? 0)
            : 0,
        };
        if (billing.settings.include_utilities) {
          if (billing.settings.water_billing_mode === "flat") {
            entry.water_flat_baht = billing.settings.water_flat_baht;
          } else {
            entry.water_curr = Number(meters[row.tenant_id]?.water ?? 0);
          }
        }
        return entry;
      });

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
        billingReadinessOptions,
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
      water:
        billing.settings.water_billing_mode === "meter"
          ? Number(rowMeters.water)
          : (selectedRow.water_prev?.value ?? 0),
      electric: Number(rowMeters.electric),
    })
      .then(() => billing.reload())
      .then(finish)
      .catch(() => setRoomDetailSaving(null));
  };

  const handleRoomIssue = async (
    input: InvoiceGeneratorIssueInput,
  ): Promise<boolean> => {
    if (!selectedRow || !propertySlug) return false;
    const rowMeters = meters[selectedRow.tenant_id] ?? { water: "", electric: "" };
    if (
      !isRowReadyToBill(
        selectedRow,
        rowMeters,
        billing.settings.include_utilities,
        {
          ...billingReadinessOptions,
          waterFlatBaht: input.waterFlatBaht,
        },
      )
    ) {
      return false;
    }

    setRoomDetailSaving("issue");
    try {
      const entry: Parameters<typeof billing.generate>[0][number] = {
        tenant_id: selectedRow.tenant_id,
        room_id: selectedRow.room_id,
        electric_curr: billing.settings.include_utilities
          ? Number(rowMeters.electric)
          : 0,
        billing_month: input.billingMonth,
        extra_items: input.extraItems,
        include_promptpay_qr: input.includePromptPayQr,
      };
      if (billing.settings.include_utilities) {
        if (billing.settings.water_billing_mode === "flat") {
          entry.water_flat_baht = input.waterFlatBaht;
        } else {
          entry.water_curr = Number(rowMeters.water);
        }
      }
      const ok = await billing.generate([entry], { deferLineNotify: true });
      if (!ok) return false;
      await override.reload();
      await auditLog.reload();
      return true;
    } catch (err) {
      console.error(
        "[dashboard.handleRoomIssue]",
        { tenantId: selectedRow.tenant_id },
        err,
      );
      return false;
    } finally {
      setRoomDetailSaving(null);
    }
  };

  const handleAddRoom = (form: Parameters<typeof addRoomTenant.add>[0]) => {
    if (subscription.addRoomGate !== "allowed") return;
    void addRoomTenant
      .add(form)
      .then(async (result) => {
        await Promise.all([
          billing.reload(),
          vacantRooms.reload(),
          propertyPlan.reload(),
        ]);
        if ("tenant_id" in result) {
          setSelectedTenantId(result.tenant_id);
        }
      })
      .catch(() => {});
  };

  return (
    <OwnerDashboardShell
      propertySlug={propertySlug}
      trialBanner={
        trial.isTrial ? (
          <TrialBannerSkin resetExpiresAt={trial.status?.reset_expires_at} />
        ) : undefined
      }
      activeTab={activeTab}
    >
      {overRoomLimit ? (
        <SubscriptionBannerSkin
          propertySlug={propertySlug}
          overRoomLimit={overRoomLimit}
        />
      ) : (
        ownerSubscription.subscription &&
        !trial.isTrial && (
          <SubscriptionBannerSkin
            subscription={ownerSubscription.subscription}
            propertySlug={propertySlug}
          />
        )
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
            className="mt-4 inline-flex min-h-[52px] items-center justify-center rounded-lg bg-rc-primary px-6 text-base font-medium text-white hover:bg-rc-primary-dark"
          >
            {t("owner.onboarding.createProject")}
          </a>
        </div>
      )}

      {propertySlug && activeTab === "home" && (
        <>
          <DashboardHeaderSkin
            ownerName={ownerProfile.profile?.name ?? t("owner.dashboard.roleBadge")}
          />

          {properties.length > 1 && (
            <ProjectSelectorSkin
              layout="chip"
              properties={properties}
              value={propertySlug}
              loading={propertiesStatus === "loading"}
              onChange={(slug) =>
                router.replace(`/dashboard?property=${encodeURIComponent(slug)}`)
              }
              onAddClick={
                canAddProjectOnChip
                  ? () => {
                      router.push(
                        `/settings?property=${encodeURIComponent(propertySlug)}&add=1`,
                      );
                    }
                  : undefined
              }
            />
          )}

          <DashboardSummaryCarouselSkin
            billingMonthLabel={billingMonthLabel}
            revenue={revenueMetrics}
            occupancy={occupancyMetrics}
            maintenanceWaiting={maintenance.waitingCount}
          />
        </>
      )}

      {propertySlug && activeTab === "accounting" && (
        <AccountingHubSkin
          propertySlug={propertySlug}
          properties={properties}
          billingMonth={billing.billingMonth}
          overview={overview}
          chillMode={chillMode}
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
          unpaidSummary={unpaidReminderSummary}
          bentoMetrics={cashFlowBento.metrics}
          bentoLoading={cashFlowBento.loading}
        />
      )}

      {propertySlug && activeTab === "home" && (
      <>
      <RoomListSkin
        propertySlug={propertySlug}
        propertyName={currentProperty?.name ?? propertySlug}
        coverUrl={coverUrl}
        billingDay={billing.settings.billing_day}
        reminderSettings={{
          soft: billing.settings.reminder_soft_days,
          firm: billing.settings.reminder_firm_days,
          final: billing.settings.reminder_final_days,
        }}
        includeUtilities={billing.settings.include_utilities}
        rows={listRows}
        vacantRooms={vacantRooms.rooms}
        meters={meters}
        listHash={hash}
        filterBanner={listFilterBanner}
        onClearListHash={clearListHash}
        disabled={isSaving}
        roomsLoading={billing.status === "loading" && billing.rows.length === 0}
        slipEvaluating={billing.isRefreshing && billing.hasScanningRows}
        onSelect={setSelectedTenantId}
        onSelectVacant={setVacantManageTarget}
        onAddRoom={handleAddRoom}
        addRoomSaving={addRoomTenant.status === "saving"}
        addRoomError={addRoomTenant.error}
      />

      <OwnerDashboardAlertsSkin
        propertiesError={propertiesError}
        meterReminder={
          showMeterReminder
            ? t("owner.billing.meterReminder", {
                day: billing.settings.billing_day,
              })
            : null
        }
        lineQuotaHint={lineQuotaHint}
        operationError={operationError}
        maintenanceWaitingCount={maintenance.waitingCount}
        maintenanceHref={`/maintenance?property=${encodeURIComponent(propertySlug)}`}
      />

      <AuditLogSkin
        planTier={planTier}
        entries={auditLog.entries}
        loading={auditLog.status === "loading"}
        error={auditLog.error}
      />
      </>
      )}

      {propertySlug && activeTab === "accounting" && (
        <OwnerDashboardAlertsSkin
          propertiesError={propertiesError}
          lineQuotaHint={lineQuotaHint}
          operationError={operationError}
        />
      )}

      {propertySlug && selectedRow && (
        <RoomDetailModal
          row={selectedRow}
          propertySlug={propertySlug}
          propertyName={currentProperty?.name ?? propertySlug}
          coverUrl={coverUrl}
          planTier={propertyPlan.plan?.plan_tier ?? "free"}
          billingMonth={billing.billingMonth}
          billingDay={billing.settings.billing_day}
          includeUtilities={billing.settings.include_utilities}
          waterBillingMode={billing.settings.water_billing_mode}
          defaultWaterFlatBaht={billing.settings.water_flat_baht}
          waterRate={billing.settings.water_rate_per_unit}
          electricRate={billing.settings.electric_rate_per_unit}
          reminderSettings={{
            soft: billing.settings.reminder_soft_days,
            firm: billing.settings.reminder_firm_days,
            final: billing.settings.reminder_final_days,
          }}
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
          canRemind={!overRoomLimit && reminder.canRemind}
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
          onClose={() => {
            setApproveSuccessTenantId(null);
            setSelectedTenantId(null);
          }}
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
                setApproveSuccessTenantId(selectedTenantId);
                void billing.reload();
                void override.reload();
                void auditLog.reload();
              }
            })
          }
          approveSuccess={approveSuccessTenantId === selectedTenantId}
          onTenantUpdated={() => void billing.reload()}
          roomDetailSaving={roomDetailSaving}
          hasNextRoom={nextPendingMeterRoom !== null}
          readyCount={readyCount}
          onSaveAndNext={handleRoomSaveAndNext}
          onIssueRoom={handleRoomIssue}
          paymentAccount={paymentSettings.account}
          moveOutSaving={moveOutTenant.status === "saving"}
          moveOutErrorKey={moveOutTenant.errorKey}
          onMoveOut={async () => {
            await moveOutTenant.moveOut(selectedRow.room_id);
            setSelectedTenantId(null);
            await Promise.all([
              billing.reload(),
              vacantRooms.reload(),
              propertyPlan.reload(),
            ]);
          }}
        />
      )}

      {propertySlug && vacantManageTarget && (
        <VacantRoomManageModalSkin
          room={vacantManageTarget}
          roomLimit={subscription.roomLimit}
          roomsRemaining={subscription.roomsRemaining}
          assignSaving={assignVacantTenant.status === "saving"}
          deleteSaving={deleteVacantRoom.status === "saving"}
          assignError={assignVacantTenant.error}
          assignErrorKey={assignVacantTenant.errorKey}
          deleteErrorKey={deleteVacantRoom.errorKey}
          onClose={() => setVacantManageTarget(null)}
          onAssign={async (input) => {
            const result = await assignVacantTenant.assign(
              vacantManageTarget.room_id,
              input,
            );
            setVacantManageTarget(null);
            await Promise.all([billing.reload(), vacantRooms.reload()]);
            if (result?.tenant_id) setSelectedTenantId(result.tenant_id);
          }}
          onDelete={async () => {
            await deleteVacantRoom.remove(vacantManageTarget.room_id);
            await Promise.all([vacantRooms.reload(), propertyPlan.reload()]);
          }}
        />
      )}

      {propertySlug && bulkMeterOpen && bulkMeterRows.length > 0 && (
        <BulkMeterDayModal
          rows={bulkMeterRows}
          billingMonth={billing.billingMonth}
          includeUtilities={billing.settings.include_utilities}
          waterBillingMode={billing.settings.water_billing_mode}
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
