"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { AdminPlatformShell } from "@/components/skins/minimal/AdminPlatformShell";
import { PlatformStatsSkin } from "@/components/skins/minimal/PlatformStatsSkin";
import { usePlatformStats } from "@/hooks/usePlatformStats";

const PLATFORM_LOGIN = "/admin/platform/login";

export default function AdminPlatformPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { stats, status, error } = usePlatformStats();

  return (
    <AdminPlatformShell
      pendingPayments={stats?.pending_payments ?? 0}
      onLogout={() => {
        void fetch("/api/admin/login", { method: "DELETE" }).then(() => {
          router.replace(PLATFORM_LOGIN);
        });
      }}
    >
      {status === "loading" && !stats && (
        <p className="mt-8 text-sm text-zinc-500">{t("common.loading")}</p>
      )}

      {error && (
        <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {stats && <PlatformStatsSkin stats={stats} />}
    </AdminPlatformShell>
  );
}
