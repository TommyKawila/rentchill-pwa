"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { MaintenanceTicketStatus } from "@/services/types";

interface MaintenanceDetailFooterSkinProps {
  status: MaintenanceTicketStatus;
  busy?: boolean;
  onConfirmTechnician: () => void;
  onMarkDone: () => void;
}

export function MaintenanceDetailFooterSkin({
  status,
  busy,
  onConfirmTechnician,
  onMarkDone,
}: MaintenanceDetailFooterSkinProps) {
  const { t } = useLocale();

  if (status === "done") return null;

  const isWaiting = status === "waiting";

  return (
    <footer className="fixed inset-x-0 bottom-0 z-[60] border-t border-zinc-100 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
      <button
        type="button"
        disabled={busy}
        onClick={isWaiting ? onConfirmTechnician : onMarkDone}
        className={`flex h-[50px] w-full items-center justify-center rounded-lg text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
          isWaiting
            ? "bg-rc-green hover:bg-rc-green-dark"
            : "bg-rc-success hover:bg-rc-success/90"
        }`}
      >
        {busy
          ? t("common.loading")
          : isWaiting
            ? t("owner.maintenance.confirmTechnicianCta")
            : t("owner.maintenance.markDoneCloseCta")}
      </button>
    </footer>
  );
}
