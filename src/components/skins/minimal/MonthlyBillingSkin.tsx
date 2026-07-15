"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { EasyModeCtaIcon } from "@/components/skins/minimal/EasyModeCtaIcon";
import { TenantLineInvitePanel } from "@/components/skins/minimal/TenantLineInvitePanel";
import {
  calculateInvoiceAmounts,
} from "@/services/invoiceCalculator";
import { statusMessageKey } from "@/services/i18n/translate";
import {
  isMeterEntryLocked,
  isRowEditable,
  isRowReadyToBill,
} from "@/services/propertyBillingSettingsService";

import type {
  BillingEntry,
  MonthlyBillingRow,
} from "@/services/monthlyBillingService";
import type { ReminderTier } from "@/services/paymentReminderTier";
import {
  REMINDER_TIER_BUTTON_CLASS,
  reminderSentTierMessageKey,
  reminderTierMessageKey,
} from "@/services/reminderUi";

interface MonthlyBillingSkinProps {
  billingMonth: string;
  billingDay: number;
  includeUtilities: boolean;
  waterRate: number;
  electricRate: number;
  rows: MonthlyBillingRow[];
  disabled?: boolean;
  result?: {
    created: number;
    updated: number;
    skipped: number;
  } | null;
  onSubmit: (entries: BillingEntry[]) => void;
  canRemind?: boolean;
  reminderDisabled?: boolean;
  remindedTenantId?: string | null;
  quotaHint?: string | null;
  onRemind?: (tenantId: string, tier: ReminderTier) => void;
}

export function MonthlyBillingSkin({
  billingMonth,
  billingDay,
  includeUtilities,
  waterRate,
  electricRate,
  rows,
  disabled,
  result,
  onSubmit,
  canRemind,
  reminderDisabled,
  remindedTenantId,
  quotaHint,
  onRemind,
}: MonthlyBillingSkinProps) {
  const { t } = useLocale();
  const [meters, setMeters] = useState<
    Record<string, { water: string; electric: string }>
  >({});

  useEffect(() => {
    setMeters(
      Object.fromEntries(
        rows.map((row) => [
          row.tenant_id,
          {
            water: row.water_unit !== null ? String(row.water_unit) : "",
            electric:
              row.electric_unit !== null ? String(row.electric_unit) : "",
          },
        ]),
      ),
    );
  }, [rows]);

  const editableCount = useMemo(
    () => rows.filter(isRowEditable).length,
    [rows],
  );

  const readyCount = useMemo(
    () =>
      rows.filter((row) =>
        isRowReadyToBill(
          row,
          meters[row.tenant_id] ?? { water: "", electric: "" },
          includeUtilities,
        ),
      ).length,
    [rows, meters, includeUtilities],
  );

  const handleSubmit = () => {
    const entries = rows
      .filter((row) =>
        isRowReadyToBill(
          row,
          meters[row.tenant_id] ?? { water: "", electric: "" },
          includeUtilities,
        ),
      )
      .map((row) => ({
        tenant_id: row.tenant_id,
        room_id: row.room_id,
        water_curr: includeUtilities
          ? Number(meters[row.tenant_id]?.water ?? 0)
          : 0,
        electric_curr: includeUtilities
          ? Number(meters[row.tenant_id]?.electric ?? 0)
          : 0,
      }));

    onSubmit(entries);
  };

  return (
    <section className="mt-8 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-800">
            {t("owner.billing.title")}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {includeUtilities
              ? t("owner.billing.rates", {
                  month: billingMonth,
                  water: waterRate,
                  electric: electricRate,
                })
              : t("owner.billing.rentOnly")}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {t("owner.billing.cycleDay", { day: billingDay })}
          </p>
        </div>
      </div>

      {quotaHint && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {quotaHint}
        </p>
      )}

      {rows.length === 0 && (
        <p className="text-sm text-zinc-600">{t("owner.billing.noRooms")}</p>
      )}

      {rows.map((row) => {
        const water = includeUtilities ? Number(meters[row.tenant_id]?.water || 0) : 0;
        const electric = includeUtilities
          ? Number(meters[row.tenant_id]?.electric || 0)
          : 0;
        const { total_amount } = calculateInvoiceAmounts(
          row.base_rent_price,
          water,
          electric,
          waterRate,
          electricRate,
        );
        const locked = isMeterEntryLocked(row);

        return (
          <article
            key={row.tenant_id}
            className="rounded-lg border border-zinc-200 bg-white p-4"
          >
            <header className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <p className="text-sm font-semibold">{row.tenant_name}</p>
                <p className="text-sm text-zinc-500">
                  {t("common.room", { number: row.room_number })}
                </p>
              </div>
              {row.invoice_status && (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-sm text-zinc-700">
                  {t(statusMessageKey(row.invoice_status))}
                </span>
              )}
            </header>

            <TenantLineInvitePanel
              className="mt-3"
              tenantName={row.tenant_name}
              roomNumber={row.room_number}
              inviteCode={row.invite_code}
              inviteUrl={row.invite_url}
              lineLinked={row.line_linked}
            />

            {includeUtilities ? (
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <label className="space-y-1">
                  <span className="text-zinc-500">{t("owner.billing.water")}</span>
                  <input
                    type="number"
                    min={0}
                    disabled={disabled || locked}
                    value={meters[row.tenant_id]?.water ?? ""}
                    onChange={(event) =>
                      setMeters((prev) => ({
                        ...prev,
                        [row.tenant_id]: {
                          water: event.target.value,
                          electric: prev[row.tenant_id]?.electric ?? "",
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-base disabled:bg-zinc-50"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-zinc-500">{t("owner.billing.electric")}</span>
                  <input
                    type="number"
                    min={0}
                    disabled={disabled || locked}
                    value={meters[row.tenant_id]?.electric ?? ""}
                    onChange={(event) =>
                      setMeters((prev) => ({
                        ...prev,
                        [row.tenant_id]: {
                          water: prev[row.tenant_id]?.water ?? "",
                          electric: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-base disabled:bg-zinc-50"
                  />
                </label>
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">{t("owner.billing.rentOnly")}</p>
            )}

            <p className="mt-3 text-sm font-medium">
              {t("common.total")} ฿{total_amount.toLocaleString("th-TH")}
            </p>

            {row.invoice_status === "pending" && row.line_linked && onRemind && (
              <div className="mt-3 space-y-2">
                {row.reminder_tier_sent && (
                  <p className="text-sm text-zinc-500">
                    {t(reminderSentTierMessageKey(row.reminder_tier_sent))}
                  </p>
                )}
                {row.reminder_recommended && row.reminder_can_send ? (
                  <button
                    type="button"
                    disabled={disabled || reminderDisabled || !canRemind}
                    onClick={() =>
                      onRemind(row.tenant_id, row.reminder_recommended!)
                    }
                    className={`flex min-h-12 w-full items-center justify-center rounded-lg border text-base font-medium disabled:cursor-not-allowed disabled:opacity-50 ${REMINDER_TIER_BUTTON_CLASS[row.reminder_recommended]}`}
                  >
                    <EasyModeCtaIcon name="remind" />
                    {remindedTenantId === row.tenant_id
                      ? t("owner.reminder.sent")
                      : t(reminderTierMessageKey(row.reminder_recommended))}
                  </button>
                ) : row.reminder_days_until_soft != null ? (
                  <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                    {t("owner.reminder.availableInDays", {
                      days: row.reminder_days_until_soft,
                    })}
                  </p>
                ) : null}
              </div>
            )}
          </article>
        );
      })}

      {includeUtilities && editableCount > 0 && readyCount === 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t("owner.billing.meterRequired")}
        </p>
      )}

      {rows.length > 0 && (
        <button
          type="button"
          disabled={disabled || readyCount === 0}
          onClick={handleSubmit}
          className="flex min-h-14 w-full items-center justify-center rounded-lg bg-green-700 text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <EasyModeCtaIcon name="bill" />
          {t("owner.billing.submit", { count: readyCount })}
        </button>
      )}

      {result && (
        <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-base text-green-800">
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
