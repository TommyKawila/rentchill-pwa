"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OverrideSkin } from "@/components/skins/minimal/OverrideSkin";
import { useInvoiceOverride } from "@/hooks/useInvoiceOverride";

function OverrideContent() {
  const searchParams = useSearchParams();
  const propertySlug = searchParams.get("property") ?? "demo-apartment";

  const { invoices, status, error, updateMeters, approveInvoice, verifySlipAuto, rejectSlip } =
    useInvoiceOverride(propertySlug);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-xl">
        <header className="border-b border-zinc-200 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-green-600">
            Manual Override
          </p>
          <h1 className="mt-2 text-2xl font-bold">แก้บิล & อนุมัติสลิป</h1>
          <p className="mt-2 text-sm text-zinc-600">หอ: {propertySlug}</p>
          <a
            href={`/settings?property=${encodeURIComponent(propertySlug)}`}
            className="mt-3 inline-block text-sm text-green-700 underline"
          >
            ตั้งค่าบัญชีรับเงิน
          </a>
        </header>

        <section className="mt-8 space-y-4">
          {status === "loading" && (
            <p className="text-sm text-zinc-500">กำลังโหลดบิล...</p>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!error && status !== "loading" && invoices.length === 0 && (
            <p className="text-sm text-zinc-600">ไม่มีบิล pending/scanning</p>
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
      </div>
    </main>
  );
}

export default function OverridePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          กำลังโหลด...
        </main>
      }
    >
      <OverrideContent />
    </Suspense>
  );
}
