"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { PlanUsageSkin } from "@/components/skins/minimal/PlanUsageSkin";
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
import { useMonthlyBilling } from "@/hooks/useMonthlyBilling";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { useOwnerSubscription } from "@/hooks/useOwnerSubscription";
import { usePropertyPlan } from "@/hooks/usePropertyPlan";
import { usePaymentReminder } from "@/hooks/usePaymentReminder";
import type { BillingEntry } from "@/services/monthlyBillingService";
import {
  isInMeterReminderWindow,
  isRowEditable,
  isRowReadyToBill,
} from "@/services/propertyBillingSettingsService";
import { computeBillingOverview } from "@/services/billingOverviewService";
import { AuditLogSkin } from "@/components/skins/minimal/AuditLogSkin";
import { BulkMeterDayModal } from "@/components/skins/minimal/BulkMeterDayModal";
import { useAuditLog } from "@/hooks/useAuditLog";
import { canAutoVerifySlip, canUseBulkMeterDay } from "@/services/planLimits";
import { resolveOwnerPropertySlug } from "@/services/resolveOwnerPropertySlug";

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
  const override = useInvoiceOverride(propertySlug);
  const reminder = usePaymentReminder(propertySlug);
  const csvExport = useCsvExport(propertySlug);
  const magicLink = useMagicLink(propertySlug);
  const propertyPlan = usePropertyPlan(propertySlug);
  const ownerSubscription = useOwnerSubscription();
  const addRoomTenant = useAddRoomTenant(propertySlug);
  const planTier = propertyPlan.plan?.plan_tier ?? "starter";
  const auditLog = useAuditLog(propertySlug ?? "", planTier);

  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [bulkMeterOpen, setBulkMeterOpen] = useState(false);
  const [bulkMeterUploading, setBulkMeterUploading] = useState(false);
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

  const editableCount = useMemo(
    () => billing.rows.filter(isRowEditable).length,
    [billing.rows],
  );

  const readyCount = useMemo(
    () =>
      billing.rows.filter((row) =>
        isRowReadyToBill(
          row,
          meters[row.tenant_id] ?? { water: "", electric: "" },
          billing.settings.include_utilities,
        ),
      ).length,
    [billing.rows, meters, billing.settings.include_utilities],
  );

  const overview = useMemo(
    () => computeBillingOverview(billing.rows),
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

  const selectedRow = useMemo(
    () => listRows.find((row) => row.tenant_id === selectedTenantId) ?? null,
    [listRows, selectedTenantId],
  );

  const bulkMeterRows = useMemo(
    () => listRows.filter((row) => isRowEditable(row)),
    [listRows],
  );

  const reviewInvoice = useMemo(() => {
    if (!selectedTenantId) return null;
    return (
      override.invoices.find((invoice) => invoice.tenant_id === selectedTenantId) ??
      null
    );
  }, [override.invoices, selectedTenantId]);

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

    void billing.generate(entries).then(() => override.reload());
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
          router.replace("/admin/login");
        });
      }}
      billingMonth={billing.billingMonth}
      overview={overview}
      onExportCsv={() => void csvExport.exportCsv()}
      csvDisabled={isSaving || !csvExport.canExport}
      csvLoading={csvExport.status === "exporting"}
      onOpenShareLink={() => setShareModalOpen(true)}
      shareDisabled={isSaving || magicLink.status === "loading"}
    >
      {ownerSubscription.subscription && (
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
            className="mt-4 inline-block rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white"
          >
            {t("owner.onboarding.createProject")}
          </a>
        </div>
      )}

      {propertyPlan.plan && propertySlug && (
        <PlanUsageSkin
          plan={propertyPlan.plan}
          billingHref={`/billing?property=${encodeURIComponent(propertySlug)}`}
        />
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
      />

      {propertySlug && billing.status === "loading" && billing.rows.length === 0 && (
        <p className="text-zinc-500">{t("owner.loading.rooms")}</p>
      )}

      {propertySlug && (
      <>
      {canUseBulkMeterDay(planTier) &&
        billing.settings.include_utilities &&
        bulkMeterRows.length > 0 && (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => setBulkMeterOpen(true)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-3 font-medium text-zinc-800 disabled:opacity-50"
          >
            {t("owner.bulkMeter.start")}
          </button>
        )}
      <RoomListSkin
        propertySlug={propertySlug}
        billingMonth={billing.billingMonth}
        billingDay={billing.settings.billing_day}
        includeUtilities={billing.settings.include_utilities}
        waterRate={billing.settings.water_rate_per_unit}
        electricRate={billing.settings.electric_rate_per_unit}
        rows={listRows}
        disabled={isSaving}
        editableCount={editableCount}
        readyCount={readyCount}
        result={billing.result}
        onSelect={setSelectedTenantId}
        onSubmit={handleBulkSubmit}
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
          reviewInvoice={reviewInvoice}
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
          canRemind={reminder.canRemind}
          reminderDisabled={reminder.status === "loading"}
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
          onRemind={(tenantId) => void reminder.remind(tenantId)}
          onSaveMeters={(invoiceId, water, electric) =>
            void override.updateMeters(invoiceId, water, electric)
          }
          onAutoVerify={(invoiceId) => void override.verifySlipAuto(invoiceId)}
          onReject={(invoiceId, note) => void override.rejectSlip(invoiceId, note)}
          onApprove={(invoiceId, slipUrl) =>
            void override.approveInvoice(invoiceId, slipUrl)
          }
          onTenantUpdated={() => void billing.reload()}
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
