"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OwnerDashboardShell } from "@/components/skins/minimal/OwnerDashboardShell";
import { MonthlyBillingSkin } from "@/components/skins/minimal/MonthlyBillingSkin";
import { OverrideSkin } from "@/components/skins/minimal/OverrideSkin";
import { PaidInvoiceSkin } from "@/components/skins/minimal/PaidInvoiceSkin";
import { useInvoiceOverride } from "@/hooks/useInvoiceOverride";
import { useMonthlyBilling } from "@/hooks/useMonthlyBilling";

function DashboardContent() {
  const searchParams = useSearchParams();
  const propertySlug = searchParams.get("property") ?? "demo-apartment";

  const billing = useMonthlyBilling(propertySlug);
  const override = useInvoiceOverride(propertySlug);

  const isSaving =
    billing.status === "saving" || override.status === "saving";

  return (
    <OwnerDashboardShell
      propertySlug={propertySlug}
      pendingCount={override.invoices.length}
      paidCount={override.paidInvoices.length}
    >
      {(billing.error || override.error) && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {billing.error ?? override.error}
        </div>
      )}

      {billing.status === "loading" && billing.rows.length === 0 && (
        <p className="mt-8 text-sm text-zinc-500">กำลังโหลดรายการห้อง...</p>
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
        <h2 className="text-sm font-semibold text-zinc-800">บิลรอตรวจสอบ</h2>

        {override.status === "loading" && override.invoices.length === 0 && (
          <p className="text-sm text-zinc-500">กำลังโหลดบิล...</p>
        )}

        {!override.error &&
          override.status !== "loading" &&
          override.invoices.length === 0 && (
            <p className="text-sm text-zinc-600">
              ไม่มีบิลรอตรวจสอบ (รอชำระ/กำลังตรวจสลิป)
            </p>
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
        <h2 className="text-sm font-semibold text-zinc-800">ชำระแล้ว (มีสลิป)</h2>
        {override.paidInvoices.length === 0 && override.status !== "loading" && (
          <p className="text-sm text-zinc-600">ยังไม่มีรายการชำระในรอบล่าสุด</p>
        )}
        {override.paidInvoices.map((invoice) => (
          <PaidInvoiceSkin key={invoice.id} invoice={invoice} />
        ))}
      </section>
    </OwnerDashboardShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          กำลังโหลด...
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
