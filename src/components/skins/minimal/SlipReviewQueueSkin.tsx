"use client";

import { ScanLine } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { formatMoney } from "@/services/formatMoney";
import type { SlipQueueItem } from "@/services/slipQueueService";

interface SlipReviewQueueSkinProps {
  items: SlipQueueItem[];
  onSelect: (tenantId: string) => void;
}

export function SlipReviewQueueSkin({
  items,
  onSelect,
}: SlipReviewQueueSkinProps) {
  const { t, locale } = useLocale();

  if (items.length === 0) return null;

  return (
    <section className="space-y-3 rounded-xl border border-zinc-100 bg-white p-4">
      <header>
        <div className="flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-rc-green" aria-hidden />
          <h2 className="text-base font-semibold text-rc-text">
            {t("owner.slip.queue.title")}
          </h2>
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
            {items.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {t("owner.slip.queue.subtitle")}
        </p>
      </header>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.invoice_id}>
            <button
              type="button"
              onClick={() => onSelect(item.tenant_id)}
              className="flex w-full min-h-12 items-center gap-3 rounded-xl border border-zinc-100 bg-rc-bg/60 px-3 py-2.5 text-left transition-colors hover:bg-rc-green-soft"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xs font-bold text-amber-800">
                {item.room_number}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-rc-text">
                  {t("common.room", { number: item.room_number })} ·{" "}
                  {item.tenant_name}
                </p>
                <p className="text-[10px] tabular-nums text-zinc-500">
                  {formatMoney(item.amount, "THB", locale)}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-rc-green-soft px-2.5 py-1 text-[10px] font-bold text-rc-green-ink">
                {t("owner.slip.queue.review")}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
