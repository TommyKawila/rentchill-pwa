"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { OwnerDashboardShell } from "@/components/skins/minimal/OwnerDashboardShell";
import { MonthlyBillingSkin } from "@/components/skins/minimal/MonthlyBillingSkin";
import { OverrideSkin } from "@/components/skins/minimal/OverrideSkin";
import { PaidInvoiceSkin } from "@/components/skins/minimal/PaidInvoiceSkin";
import { useInvoiceOverride } from "@/hooks/useInvoiceOverride";
import { useMonthlyBilling } from "@/hooks/useMonthlyBilling";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";

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

  const isSaving =
    billing.status === "saving" || override.status === "saving";

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
      {propertiesError && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {propertiesError}
        </div>
      )}

      {(billing.error || override.error) && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {billing.error ?? override.error}
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
