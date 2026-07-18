"use client";

import Image from "next/image";
import { Building2 } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { statusMessageKey } from "@/services/i18n/translate";
import type { MessageKey } from "@/services/i18n/messages";
import type { InvoiceStatus } from "@/services/types";
import type { RoomReminderCardMeta } from "@/services/roomReminderCardService";

interface DashboardRoomCardSkinProps {
  propertyName: string;
  roomNumber: string;
  tenantName?: string;
  billingDay: number;
  coverUrl?: string | null;
  invoiceStatus: InvoiceStatus | null;
  slipRejectionNote?: string | null;
  slipSubmittedAt?: string | null;
  slipEvaluating?: boolean;
  vacant?: boolean;
  reminderMeta?: RoomReminderCardMeta | null;
  onClick?: () => void;
}

function statusTone(status: InvoiceStatus | null, vacant?: boolean) {
  if (vacant) return "bg-zinc-100 text-zinc-600";
  if (status === "paid") return "bg-rc-success-soft text-rc-success-ink";
  if (status === "scanning") return "bg-amber-50 text-amber-800";
  if (status === "pending") return "bg-red-50 text-red-700";
  return "bg-zinc-100 text-zinc-600";
}

function resolveBadge(
  invoiceStatus: InvoiceStatus | null,
  slipRejectionNote: string | null | undefined,
  slipSubmittedAt: string | null | undefined,
  vacant: boolean | undefined,
  t: (key: MessageKey) => string,
) {
  if (vacant) return { label: t("owner.rooms.filter.vacant"), tone: statusTone(null, true) };
  if (invoiceStatus === "paid" && slipSubmittedAt) {
    return {
      label: t("owner.slip.autoVerified"),
      tone: "bg-rc-success-soft text-rc-success-ink",
    };
  }
  if (invoiceStatus === "pending" && slipRejectionNote) {
    return {
      label: t("owner.slip.needsReview"),
      tone: "bg-red-50 text-rc-danger",
    };
  }
  if (invoiceStatus) {
    return {
      label: t(statusMessageKey(invoiceStatus)),
      tone: statusTone(invoiceStatus, vacant),
    };
  }
  return { label: t("status.noBill"), tone: statusTone(null, vacant) };
}

export function DashboardRoomCardSkin({
  propertyName,
  roomNumber,
  tenantName,
  billingDay,
  coverUrl,
  invoiceStatus,
  slipRejectionNote,
  slipSubmittedAt,
  slipEvaluating,
  vacant,
  reminderMeta,
  onClick,
}: DashboardRoomCardSkinProps) {
  const { t } = useLocale();

  const reminderLine =
    reminderMeta &&
    (reminderMeta.tierKey
      ? t(reminderMeta.lineKey, {
          tier: t(reminderMeta.tierKey),
          ...reminderMeta.lineParams,
        })
      : t(reminderMeta.lineKey, reminderMeta.lineParams));

  const { label: badgeLabel, tone: badgeTone } = resolveBadge(
    invoiceStatus,
    slipRejectionNote,
    slipSubmittedAt,
    vacant,
    t,
  );

  const content = (
    <>
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-100">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover"
            sizes="56px"
            unoptimized
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-zinc-400">
            <Building2 className="h-6 w-6" aria-hidden />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-rc-text">
          {propertyName} - {t("common.room", { number: roomNumber })}
        </p>
        <p className="mt-0.5 truncate text-sm text-zinc-500">
          {vacant
            ? t("owner.rooms.vacantLine")
            : t("owner.rooms.tenantDueLine", {
                name: tenantName?.trim() || "—",
                day: billingDay,
              })}
        </p>
        {reminderLine && (
          <p
            className={`mt-0.5 truncate text-xs font-medium ${reminderMeta!.toneClass}`}
          >
            {reminderLine}
          </p>
        )}
        {slipEvaluating && invoiceStatus === "scanning" && (
          <div className="mt-1.5 h-2 w-full max-w-[140px] animate-pulse rounded bg-zinc-100" />
        )}
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${badgeTone}`}
      >
        {badgeLabel}
      </span>
    </>
  );

  if (!onClick) {
    return (
      <div className="flex min-h-[88px] items-center gap-3 rounded-xl border border-zinc-100 bg-white px-3">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[88px] w-full items-center gap-3 rounded-xl border border-zinc-100 bg-white px-3 py-2 text-left transition-transform hover:bg-zinc-50 active:scale-[0.98]"
    >
      {content}
    </button>
  );
}
