"use client";

import type { ReactNode } from "react";
import { Droplet, ReceiptText, Send, Zap } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { formatMoney } from "@/services/formatMoney";
import type { BillingRoomIssueCard } from "@/services/billingIssueCardService";

export type { BillingRoomIssueCard };

interface BillingRoomIssueCardSkinProps {
  card: BillingRoomIssueCard;
  disabled?: boolean;
  saving?: boolean;
  onSendBill: (tenantId: string) => void;
}

function FeeChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex-1 rounded-lg bg-rc-bg px-2 py-1.5">
      <div className="flex items-center gap-1 text-zinc-500">
        {icon}
        <span className="text-[9px]">{label}</span>
      </div>
      <p className="text-[11px] font-bold tabular-nums text-rc-text">{value}</p>
    </div>
  );
}

export function BillingRoomIssueCardSkin({
  card,
  disabled,
  saving,
  onSendBill,
}: BillingRoomIssueCardSkinProps) {
  const { t, locale } = useLocale();

  return (
    <article className="rounded-xl border border-zinc-100 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-rc-text">
            {t("common.room", { number: card.roomNumber })}
          </p>
          <p className="truncate text-[10px] text-zinc-500">{card.tenantName}</p>
        </div>
        <p className="shrink-0 text-sm font-extrabold tabular-nums text-rc-text">
          {formatMoney(card.total, "THB", locale)}
        </p>
      </div>
      <div className="mb-2 flex gap-2">
        <FeeChip
          icon={<ReceiptText className="h-2.5 w-2.5" aria-hidden />}
          label={t("owner.billing.fee.rent")}
          value={formatMoney(card.rent, "THB", locale)}
        />
        {card.water != null && (
          <FeeChip
            icon={<Droplet className="h-2.5 w-2.5" aria-hidden />}
            label={t("owner.billing.fee.water")}
            value={formatMoney(card.water, "THB", locale)}
          />
        )}
        {card.electric != null && (
          <FeeChip
            icon={<Zap className="h-2.5 w-2.5" aria-hidden />}
            label={t("owner.billing.fee.electric")}
            value={formatMoney(card.electric, "THB", locale)}
          />
        )}
      </div>
      <button
        type="button"
        disabled={disabled || saving}
        onClick={() => onSendBill(card.tenantId)}
        className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-lg bg-rc-green text-[11px] font-semibold text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" aria-hidden />
        {saving ? t("common.saving") : t("owner.billing.sendBill")}
      </button>
    </article>
  );
}

interface BillingRoomIssueListSkinProps {
  cards: BillingRoomIssueCard[];
  disabled?: boolean;
  savingTenantId?: string | null;
  onSendBill: (tenantId: string) => void;
}

export function BillingRoomIssueListSkin({
  cards,
  disabled,
  savingTenantId,
  onSendBill,
}: BillingRoomIssueListSkinProps) {
  const { t } = useLocale();

  if (cards.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-rc-text">
        {t("owner.billing.issueCardsTitle")}
      </h2>
      <div className="space-y-2">
        {cards.map((card) => (
          <BillingRoomIssueCardSkin
            key={card.tenantId}
            card={card}
            disabled={disabled}
            saving={savingTenantId === card.tenantId}
            onSendBill={onSendBill}
          />
        ))}
      </div>
    </section>
  );
}
