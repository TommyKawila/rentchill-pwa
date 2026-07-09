"use client";

import { useLocale } from "@/components/LocaleProvider";
import { statusMessageKey } from "@/services/i18n/translate";
import type { InvoiceStatus } from "@/services/types";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import { WATER_RATE, ELECTRIC_RATE } from "@/services/invoiceCalculator";

export type RoomListRow = MonthlyBillingRow & {
  no: number;
};

interface RoomListSkinProps {
  billingMonth: string;
  rows: RoomListRow[];
  disabled?: boolean;
  editableCount: number;
  result?: {
    created: number;
    updated: number;
    skipped: number;
  } | null;
  onSelect: (tenantId: string) => void;
  onSubmit: () => void;
}

function statusTone(status: InvoiceStatus | null) {
  if (status === "paid") return "bg-green-50 text-green-800";
  if (status === "scanning") return "bg-orange-50 text-orange-800";
  if (status === "pending") return "bg-amber-50 text-amber-800";
  return "bg-zinc-100 text-zinc-600";
}

export function RoomListSkin({
  billingMonth,
  rows,
  disabled,
  editableCount,
  result,
  onSelect,
  onSubmit,
}: RoomListSkinProps) {
  const { t } = useLocale();

  return (
    <section className="mt-8 space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-zinc-800">
          {t("owner.rooms.listTitle")}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          {t("owner.billing.rates", {
            month: billingMonth,
            water: WATER_RATE,
            electric: ELECTRIC_RATE,
          })}
        </p>
      </div>

      {rows.length === 0 && (
        <p className="text-sm text-zinc-600">{t("owner.billing.noRooms")}</p>
      )}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="grid grid-cols-[2rem_1fr_3rem_5.5rem_1.25rem] gap-2 border-b border-zinc-100 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
            <span>{t("owner.rooms.colNo")}</span>
            <span>{t("owner.rooms.colName")}</span>
            <span>{t("owner.rooms.colRoom")}</span>
            <span>{t("owner.rooms.colStatus")}</span>
            <span />
          </div>

          <ul className="divide-y divide-zinc-100">
            {rows.map((row) => (
              <li key={row.tenant_id}>
                <button
                  type="button"
                  onClick={() => onSelect(row.tenant_id)}
                  className="grid w-full grid-cols-[2rem_1fr_3rem_5.5rem_1.25rem] items-center gap-2 px-3 py-2.5 text-left hover:bg-zinc-50"
                >
                  <span className="text-xs text-zinc-400">{row.no}</span>
                  <span className="truncate text-sm font-medium text-zinc-900">
                    {row.tenant_name}
                  </span>
                  <span className="text-sm text-zinc-600">{row.room_number}</span>
                  <span
                    className={`truncate rounded px-1.5 py-0.5 text-center text-[11px] font-medium ${statusTone(row.invoice_status)}`}
                  >
                    {row.invoice_status
                      ? t(statusMessageKey(row.invoice_status))
                      : t("status.noBill")}
                  </span>
                  <span className="text-zinc-300">›</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rows.length > 0 && (
        <button
          type="button"
          disabled={disabled || editableCount === 0}
          onClick={onSubmit}
          className="w-full rounded-md bg-green-700 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {t("owner.billing.submit", { count: editableCount })}
        </button>
      )}

      {result && (
        <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {t("owner.billing.result", {
            created: result.created,
            updated: result.updated,
            skipped: result.skipped,
          })}
        </p>
      )}
    </section>
  );
}
