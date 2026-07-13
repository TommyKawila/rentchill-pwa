"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { AdminPlatformShell } from "@/components/skins/minimal/AdminPlatformShell";
import { AdminQaLabSkin } from "@/components/skins/minimal/AdminQaLabSkin";
import { usePlatformStats } from "@/hooks/usePlatformStats";

const devToolsPublic = process.env.NEXT_PUBLIC_DEV_TOOLS === "true";

export default function AdminQaPage() {
  const { t } = useLocale();
  const router = useRouter();
  const stats = usePlatformStats();

  if (!devToolsPublic) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-sm text-zinc-500">
        {t("admin.qa.disabled")}
      </main>
    );
  }

  return (
    <AdminPlatformShell
      pendingPayments={stats.stats?.pending_payments ?? 0}
      onLogout={() => {
        void fetch("/api/admin/login", { method: "DELETE" }).then(() => {
          router.replace("/admin/platform/login");
        });
      }}
    >
      <AdminQaLabSkin />
    </AdminPlatformShell>
  );
}
