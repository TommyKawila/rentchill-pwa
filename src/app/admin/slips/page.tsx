"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { AdminPlatformShell } from "@/components/skins/minimal/AdminPlatformShell";
import { PlatformSlipsSkin } from "@/components/skins/minimal/PlatformSlipsSkin";
import { usePlatformSlips } from "@/hooks/usePlatformSlips";
import { usePlatformStats } from "@/hooks/usePlatformStats";

function SlipsContent() {
  const { t } = useLocale();
  const router = useRouter();
  const slips = usePlatformSlips();
  const stats = usePlatformStats();

  return (
    <AdminPlatformShell
      pendingPayments={stats.stats?.pending_payments ?? slips.payments.length}
      onLogout={() => {
        void fetch("/api/admin/login", { method: "DELETE" }).then(() => {
          router.replace("/admin/platform/login");
        });
      }}
    >
      <section className="mt-8">
        <h2 className="text-base font-semibold">{t("admin.slips.title")}</h2>
        <p className="mt-1 text-sm text-zinc-500">{t("admin.slips.desc")}</p>

        {slips.status === "loading" && slips.payments.length === 0 && (
          <p className="mt-4 text-base text-zinc-500">{t("common.loading")}</p>
        )}

        <div className="mt-4">
          <PlatformSlipsSkin
            payments={slips.payments}
            disabled={slips.status === "approving"}
            error={slips.error}
            onApprove={(id) => void slips.approve(id)}
          />
        </div>
      </section>
    </AdminPlatformShell>
  );
}

function SlipsFallback() {
  const { t } = useLocale();
  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
      {t("common.loading")}
    </main>
  );
}

export default function AdminSlipsPage() {
  return (
    <Suspense fallback={<SlipsFallback />}>
      <SlipsContent />
    </Suspense>
  );
}
