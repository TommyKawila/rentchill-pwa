"use client";

import { useLocale } from "@/components/LocaleProvider";
import type {
  MaintenanceTicketRow,
  MaintenanceTicketStatus,
} from "@/services/types";

interface TenantMaintenanceListSkinProps {
  tickets: MaintenanceTicketRow[];
  loading?: boolean;
}

const STATUS_TONE: Record<
  MaintenanceTicketStatus,
  { badge: string; labelKey: string }
> = {
  waiting: {
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    labelKey: "owner.maintenance.status.waiting",
  },
  in_progress: {
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    labelKey: "owner.maintenance.status.inProgress",
  },
  done: {
    badge: "bg-green-50 text-green-700 border-green-200",
    labelKey: "owner.maintenance.status.done",
  },
};

const CATEGORY_KEYS = {
  ac: "tenant.maintenance.category.ac",
  plumbing: "tenant.maintenance.category.plumbing",
  electrical: "tenant.maintenance.category.electrical",
  other: "tenant.maintenance.category.other",
} as const;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function TenantMaintenanceListSkin({
  tickets,
  loading,
}: TenantMaintenanceListSkinProps) {
  const { t } = useLocale();

  if (loading) {
    return (
      <section className="border-t border-zinc-100 bg-white px-6 py-4">
        <h2 className="text-base font-semibold text-zinc-900">
          {t("tenant.maintenance.historyTitle")}
        </h2>
        <div className="mt-3 flex min-h-12 items-center justify-center text-sm text-zinc-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      </section>
    );
  }

  if (tickets.length === 0) return null;

  return (
    <section className="border-t border-zinc-100 bg-white px-6 py-4">
      <h2 className="text-base font-semibold text-zinc-900">
        {t("tenant.maintenance.historyTitle")}
      </h2>
      <ul className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-100">
        {tickets.map((ticket) => {
          const tone = STATUS_TONE[ticket.status];
          return (
            <li key={ticket.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-medium text-zinc-900">
                    {t(CATEGORY_KEYS[ticket.category])}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                    {ticket.description}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {formatDate(ticket.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-lg border px-2 py-1 text-sm font-medium ${tone.badge}`}
                >
                  {t(tone.labelKey as Parameters<typeof t>[0])}
                </span>
              </div>
              {ticket.photo_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={ticket.photo_url}
                  alt={t("tenant.maintenance.photoPreviewAlt")}
                  className="mt-3 max-h-32 w-full rounded-lg border border-zinc-200 object-cover"
                />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
