"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { PlanUsageSkin } from "@/components/skins/minimal/PlanUsageSkin";
import { OwnerDashboardShell } from "@/components/skins/minimal/OwnerDashboardShell";
import { CsvExportSkin } from "@/components/skins/minimal/CsvExportSkin";
import { MagicLinkSkin } from "@/components/skins/minimal/MagicLinkSkin";
import { MonthlyBillingSkin } from "@/components/skins/minimal/MonthlyBillingSkin";
import { OverrideSkin } from "@/components/skins/minimal/OverrideSkin";
import { PaidInvoiceSkin } from "@/components/skins/minimal/PaidInvoiceSkin";
import { SubscriptionBannerSkin } from "@/components/skins/minimal/SubscriptionBannerSkin";
import { useCsvExport } from "@/hooks/useCsvExport";
import { useInvoiceOverride } from "@/hooks/useInvoiceOverride";
import { useMagicLink } from "@/hooks/useMagicLink";
import { useMonthlyBilling } from "@/hooks/useMonthlyBilling";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { useOwnerSubscription } from "@/hooks/useOwnerSubscription";
import { usePropertyPlan } from "@/hooks/usePropertyPlan";
import { usePaymentReminder } from "@/hooks/usePaymentReminder";

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

  const isSaving =
    billing.status === "saving" ||
    override.status === "saving" ||
    reminder.status === "sending" ||
    csvExport.status === "exporting" ||
    magicLink.status === "creating";

  const quotaHint = useMemo(() => {
    if (!reminder.quota) return null;
    if (reminder.quota.reminder_limit === null) return null;
    return t("owner.reminder.quota", {
      remaining: reminder.quota.reminders_remaining ?? 0,
      limit: reminder.quota.reminder_limit,
    });
  }, [reminder.quota, t]);

  const csvQuotaHint = useMemo(() => {
    if (!csvExport.quota) return null;
    if (csvExport.quota.csv_limit === null) return null;
    return t("owner.csv.quota", {
      remaining: csvExport.quota.csv_remaining ?? 0,
      limit: csvExport.quota.csv_limit,
    });
  }, [csvExport.quota, t]);

  const exportErrorMessage = useMemo(() => {
    if (!csvExport.error) return null;
    if (csvExport.error === "QUOTA_EXCEEDED") return t("owner.csv.quotaExceeded");
    if (csvExport.error === "NO_DATA") return t("owner.csv.noData");
    return csvExport.error;
  }, [csvExport.error, t]);

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
      pendingCount={override.invoices.length}
      paidCount={override.paidInvoices.length}
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
          {reminder.error === "QUOTA_EXCEEDED"
            ? t("owner.reminder.quotaExceeded")
            : (billing.error ??
              override.error ??
              reminder.error ??
              exportErrorMessage ??
              magicLink.error)}
        </div>
      )}

      {billing.status === "loading" && billing.rows.length === 0 && (
        <p className="mt-8 text-sm text-zinc-500">{t("owner.loading.rooms")}</p>
      )}

      <MonthlyBillingSkin
        billingMonth={billing.billingMonth}
        rows={billing.rows}
        disabled={isSaving}
        result={billing.result}
        canRemind={reminder.canRemind}
        reminderDisabled={reminder.status === "loading"}
        remindedTenantId={reminder.lastRemindedTenantId}
        quotaHint={quotaHint}
        onRemind={(tenantId) => void reminder.remind(tenantId)}
        onSubmit={(entries) =>
          void billing.generate(entries).then(() => override.reload())
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-800">
          {t("owner.review.title")}
        </h2>

        {override.status === "loading" && override.invoices.length === 0 && (
          <p className="text-sm text-zinc-500">{t("owner.review.loading")}</p>
        )}

        {!override.error &&
          override.status !== "loading" &&
          override.invoices.length === 0 && (
            <p className="text-sm text-zinc-600">{t("owner.review.empty")}</p>
          )}

        {override.invoices.map((invoice) => (
          <OverrideSkin
            key={invoice.id}
            invoice={invoice}
            disabled={isSaving}
            onSaveMeters={(water, electric) =>
              void override.updateMeters(invoice.id, water, electric)
            }
            onAutoVerify={() => void override.verifySlipAuto(invoice.id)}
            onReject={(note) => void override.rejectSlip(invoice.id, note)}
            onApprove={(slipUrl) => void override.approveInvoice(invoice.id, slipUrl)}
          />
        ))}
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-800">
          {t("owner.paid.title")}
        </h2>
        {override.paidInvoices.length === 0 && override.status !== "loading" && (
          <p className="text-sm text-zinc-600">{t("owner.paid.empty")}</p>
        )}
        {override.paidInvoices.map((invoice) => (
          <PaidInvoiceSkin key={invoice.id} invoice={invoice} />
        ))}
      </section>

      <CsvExportSkin
        billingMonth={billing.billingMonth}
        disabled={isSaving || csvExport.status === "loading"}
        canExport={csvExport.canExport}
        quotaHint={csvQuotaHint}
        onExport={() => void csvExport.exportCsv()}
      />

      <MagicLinkSkin
        disabled={isSaving || magicLink.status === "loading"}
        linkUrl={magicLink.link?.url}
        expiresAt={magicLink.link?.expires_at}
        isPermanent={magicLink.link?.is_permanent}
        copied={magicLink.copied}
        onCreate={() => void magicLink.createLink()}
        onCopy={() => void magicLink.copyLink()}
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
