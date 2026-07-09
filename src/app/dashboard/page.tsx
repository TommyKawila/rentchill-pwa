"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { PlanUsageSkin } from "@/components/skins/minimal/PlanUsageSkin";
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

function DashboardContent() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugFromUrl = searchParams.get("property");

  const { properties, status: propertiesStatus, error: propertiesError } =
    useOwnerProperties();

  const propertySlug = useMemo(() => {
    if (
      slugFromUrl &&
      (properties.length === 0 ||
        properties.some((property) => property.slug === slugFromUrl))
    ) {
      return slugFromUrl;
    }
    return properties[0]?.slug ?? "demo-apartment";
  }, [slugFromUrl, properties]);

  useEffect(() => {
    if (propertiesStatus !== "idle" || properties.length === 0) return;
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

  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [meters, setMeters] = useState<
    Record<string, { water: string; electric: string }>
  >({});

  useEffect(() => {
    setMeters(
      Object.fromEntries(
        billing.rows.map((row) => [
          row.tenant_id,
          {
            water: row.water_unit !== null ? String(row.water_unit) : "",
            electric:
              row.electric_unit !== null ? String(row.electric_unit) : "",
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
        water_unit: billing.settings.include_utilities
          ? Number(meters[row.tenant_id]?.water ?? 0)
          : 0,
        electric_unit: billing.settings.include_utilities
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

      {propertyPlan.plan && <PlanUsageSkin plan={propertyPlan.plan} />}

      {propertiesError && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {propertiesError}
        </div>
      )}

      {(billing.error ||
        override.error ||
        reminder.error ||
        exportErrorMessage ||
        magicLink.error) && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {billing.error === "METER_REQUIRED"
            ? t("owner.billing.meterRequired")
            : reminder.error === "QUOTA_EXCEEDED"
            ? t("owner.line.quotaExceeded")
            : (billing.error ??
              override.error ??
              reminder.error ??
              exportErrorMessage ??
              magicLink.error)}
        </div>
      )}

      {showMeterReminder && (
        <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {t("owner.billing.meterReminder", {
            day: billing.settings.billing_day,
          })}
        </p>
      )}

      {lineQuotaHint && (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {lineQuotaHint}
        </p>
      )}

      {billing.status === "loading" && billing.rows.length === 0 && (
        <p className="mt-8 text-sm text-zinc-500">{t("owner.loading.rooms")}</p>
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
      />

      {selectedRow && (
        <RoomDetailModal
          row={selectedRow}
          includeUtilities={billing.settings.include_utilities}
          waterRate={billing.settings.water_rate_per_unit}
          electricRate={billing.settings.electric_rate_per_unit}
          reviewInvoice={reviewInvoice}
          paidInvoice={paidInvoice}
          disabled={isSaving}
          canRemind={reminder.canRemind}
          reminderDisabled={reminder.status === "loading"}
          remindedTenantId={reminder.lastRemindedTenantId}
          meters={
            meters[selectedRow.tenant_id] ?? {
              water:
                selectedRow.water_unit !== null
                  ? String(selectedRow.water_unit)
                  : "",
              electric:
                selectedRow.electric_unit !== null
                  ? String(selectedRow.electric_unit)
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
        />
      )}

      {shareModalOpen && (
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
