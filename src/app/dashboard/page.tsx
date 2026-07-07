"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OwnerDashboardShell } from "@/components/skins/minimal/OwnerDashboardShell";
import { OverrideSkin } from "@/components/skins/minimal/OverrideSkin";
import { PaidInvoiceSkin } from "@/components/skins/minimal/PaidInvoiceSkin";
import { useInvoiceOverride } from "@/hooks/useInvoiceOverride";

function DashboardContent() {
  const searchParams = useSearchParams();
  const propertySlug = searchParams.get("property") ?? "demo-apartment";

  const { invoices, paidInvoices, status, error, updateMeters, approveInvoice, verifySlipAuto, rejectSlip } =
    useInvoiceOverride(propertySlug);

  return (
    <OwnerDashboardShell
      propertySlug={propertySlug}
      pendingCount={invoices.length}
      paidCount={paidInvoices.length}
    >
      <section className="mt-8 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-800">บิลรอตรวจสอบ</h2>

        {status === "loading" && (
          <p className="text-sm text-zinc-500">กำลังโหลดบิล...</p>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error && status !== "loading" && invoices.length === 0 && (
          <p className="text-sm text-zinc-600">ไม่มีบิลรอตรวจสอบ (รอชำระ/กำลังตรวจสลิป)</p>
        )}

        {invoices.map((invoice) => (
          <OverrideSkin
            key={invoice.id}
            invoice={invoice}
            disabled={status === "saving"}
            onSaveMeters={(water, electric) =>
              void updateMeters(invoice.id, water, electric)
            }
            onAutoVerify={() => void verifySlipAuto(invoice.id)}
            onReject={(note) => void rejectSlip(invoice.id, note)}
            onApprove={(slipUrl) => void approveInvoice(invoice.id, slipUrl)}
          />
        ))}
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-800">ชำระแล้ว (มีสลิป)</h2>
        {paidInvoices.length === 0 && status !== "loading" && (
          <p className="text-sm text-zinc-600">ยังไม่มีรายการชำระในรอบล่าสุด</p>
        )}
        {paidInvoices.map((invoice) => (
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
