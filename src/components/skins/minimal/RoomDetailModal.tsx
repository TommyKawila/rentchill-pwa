"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { EasyModeCtaIcon } from "@/components/skins/minimal/EasyModeCtaIcon";
import { MeterBaselineFormSkin } from "@/components/skins/minimal/MeterBaselineFormSkin";
import { MeterPhotoVaultSkin } from "@/components/skins/minimal/MeterPhotoVaultSkin";
import { MeterReadCard } from "@/components/skins/minimal/MeterReadCard";
import { MeterHistoryList } from "@/components/skins/minimal/MeterHistoryList";
import { DocumentVaultSkin } from "@/components/skins/minimal/DocumentVaultSkin";
import { ContractLeaseSkin } from "@/components/skins/minimal/ContractLeaseSkin";
import { DepositTrackerSkin } from "@/components/skins/minimal/DepositTrackerSkin";
import { MoveChecklistSkin } from "@/components/skins/minimal/MoveChecklistSkin";
import {
  TenantProfileEditButton,
  TenantProfileEditorSkin,
} from "@/components/skins/minimal/TenantProfileEditorSkin";
import { TenantLineInvitePanel } from "@/components/skins/minimal/TenantLineInvitePanel";
import { OverrideSkin } from "@/components/skins/minimal/OverrideSkin";
import { IssuedInvoiceSkin } from "@/components/skins/minimal/IssuedInvoiceSkin";
import { PaidInvoiceSkin } from "@/components/skins/minimal/PaidInvoiceSkin";
import {
  RoomDetailBillingFooterSkin,
  type RoomDetailSavingAction,
} from "@/components/skins/minimal/RoomDetailBillingFooterSkin";
import {
  calculateFromDialReadings,
} from "@/services/invoiceCalculator";
import { statusMessageKey } from "@/services/i18n/translate";
import { useMeterPhotos } from "@/hooks/useMeterPhotos";
import { useMeterHistory } from "@/hooks/useMeterHistory";
import { useMeterBaseline } from "@/hooks/useMeterBaseline";
import { useTenantDocuments } from "@/hooks/useTenantDocuments";
import { useLeaseContract } from "@/hooks/useLeaseContract";
import { useDepositTracker } from "@/hooks/useDepositTracker";
import type { PlanTier } from "@/services/propertyQuotaService";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import type { InvoiceOverrideRow } from "@/services/invoiceOverrideService";
import type { ApproveInvoiceInput, OverrideSavingAction } from "@/hooks/useInvoiceOverride";
import { useTenantProfile } from "@/hooks/useTenantProfile";
import { TenantPersonIcon } from "@/components/skins/minimal/TenantPersonIcon";
import { isMeterEntryLocked, isRowReadyToBill } from "@/services/propertyBillingSettingsService";
import type { ReminderTier } from "@/services/paymentReminderTier";
import {
  REMINDER_TIER_BUTTON_CLASS,
  reminderSentTierMessageKey,
  reminderTierMessageKey,
} from "@/services/reminderUi";

interface RoomDetailModalProps {
  row: MonthlyBillingRow;
  propertySlug: string;
  planTier: PlanTier;
  billingMonth: string;
  includeUtilities: boolean;
  waterRate: number;
  electricRate: number;
  pendingInvoice?: InvoiceOverrideRow | null;
  scanningAnomalyInvoice?: InvoiceOverrideRow | null;
  scanningInvoice?: InvoiceOverrideRow | null;
  paidInvoice?: InvoiceOverrideRow | null;
  autoVerifyEnabled?: boolean;
  billingHref?: string;
  disabled?: boolean;
  overrideSavingAction?: OverrideSavingAction;
  canRemind?: boolean;
  reminderDisabled?: boolean;
  remindedTenantId?: string | null;
  onClose: () => void;
  onMeterChange: (tenantId: string, water: string, electric: string) => void;
  meters: { water: string; electric: string };
  onRemind?: (tenantId: string, tier: ReminderTier) => void;
  onAutoVerify: (invoiceId: string) => void;
  onReject: (invoiceId: string, note?: string) => void;
  onApprove: (invoiceId: string, input?: ApproveInvoiceInput) => void;
  onTenantUpdated?: () => void;
  roomDetailSaving?: RoomDetailSavingAction;
  hasNextRoom?: boolean;
  readyCount?: number;
  onSaveAndNext?: () => void;
  onIssueRoom?: () => void;
}

function roomStatusLabel(
  row: MonthlyBillingRow,
  t: ReturnType<typeof useLocale>["t"],
) {
  if (row.invoice_status === "pending") return t("owner.invoice.issuedPending");
  if (row.invoice_status) return t(statusMessageKey(row.invoice_status));
  return t("status.noBill");
}

export function RoomDetailModal({
  row,
  propertySlug,
  planTier,
  billingMonth,
  includeUtilities,
  waterRate,
  electricRate,
  pendingInvoice,
  scanningAnomalyInvoice,
  scanningInvoice,
  paidInvoice,
  autoVerifyEnabled,
  billingHref,
  disabled,
  overrideSavingAction = null,
  canRemind,
  reminderDisabled,
  remindedTenantId,
  onClose,
  onMeterChange,
  meters,
  onRemind,
  onAutoVerify,
  onReject,
  onApprove,
  onTenantUpdated,
  roomDetailSaving = null,
  hasNextRoom = false,
  readyCount = 0,
  onSaveAndNext,
  onIssueRoom,
}: RoomDetailModalProps) {
  const { t } = useLocale();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const tenantProfile = useTenantProfile(propertySlug, row.tenant_id);
  const tenantDisplayName = row.tenant_name.trim();
  const meterHistory = useMeterHistory(propertySlug, row.room_id, true);
  const meterBaseline = useMeterBaseline(propertySlug, row.room_id, row.tenant_id);
  const needsBaseline = !row.water_prev || !row.electric_prev;
  const meterPhotos = useMeterPhotos(
    propertySlug,
    row.room_id,
    billingMonth,
    planTier,
    row.tenant_id,
  );
  const tenantDocs = useTenantDocuments(
    propertySlug,
    row.room_id,
    row.tenant_id,
    planTier,
  );
  const leaseContract = useLeaseContract(
    propertySlug,
    row.room_id,
    row.tenant_id,
    planTier,
  );
  const depositTracker = useDepositTracker(
    propertySlug,
    row.room_id,
    row.tenant_id,
    planTier,
  );
  const meterLocked = isMeterEntryLocked(row);
  const showBillingFooter =
    !row.invoice_id && !paidInvoice && !(needsBaseline && includeUtilities);
  const metersComplete = isRowReadyToBill(row, meters, includeUtilities);

  let total_amount = row.base_rent_price;
  if (
    includeUtilities &&
    row.water_prev &&
    row.electric_prev &&
    meters.water.trim() !== "" &&
    meters.electric.trim() !== ""
  ) {
    try {
      total_amount = calculateFromDialReadings(
        row.base_rent_price,
        row.water_prev.value,
        Number(meters.water),
        row.electric_prev.value,
        Number(meters.electric),
        waterRate,
        electricRate,
      ).total_amount;
    } catch {
      total_amount = row.base_rent_price;
    }
  }

  useEffect(() => {
    setIsEditingProfile(false);
    tenantProfile.clearError();
  }, [row.tenant_id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("owner.rooms.close")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-xl border border-zinc-100 bg-white sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <div className="flex min-w-0 items-start gap-x-3">
            <TenantPersonIcon className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />
            <div>
              <p className="text-base font-bold tracking-tight text-zinc-900">
                {t("common.room", { number: row.room_number })}
              </p>
              <p className="text-sm text-zinc-500">
                {tenantDisplayName}
                {` · ${roomStatusLabel(row, t)}`}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!isEditingProfile && (
              <TenantProfileEditButton
                disabled={disabled || tenantProfile.status === "saving"}
                onClick={() => setIsEditingProfile(true)}
              />
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700"
            >
              {t("owner.rooms.close")}
            </button>
          </div>
        </header>

        <div className="space-y-4 overflow-y-auto px-4 py-6">
          {isEditingProfile && (
            <TenantProfileEditorSkin
              tenantName={row.tenant_name}
              saving={tenantProfile.status === "saving"}
              error={tenantProfile.error}
              onCancel={() => {
                setIsEditingProfile(false);
                tenantProfile.clearError();
              }}
              onSave={(input) => {
                void tenantProfile.save(input).then((result) => {
                  if (!result) return;
                  setIsEditingProfile(false);
                  onTenantUpdated?.();
                });
              }}
            />
          )}
          <TenantLineInvitePanel
            tenantName={tenantDisplayName}
            roomNumber={row.room_number}
            inviteCode={row.invite_code}
            inviteUrl={row.invite_url}
            lineLinked={row.line_linked}
          />

          {!row.invoice_id && !paidInvoice && (
            <>
              {includeUtilities ? (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-500">
                    {t("owner.meter.moveInStatus", {
                      date: row.move_in_date,
                    })}
                  </p>
                  {needsBaseline && !meterLocked && (
                    <MeterBaselineFormSkin
                      saving={meterBaseline.status === "saving"}
                      error={meterBaseline.error}
                      onSave={(water, electric) => {
                        void meterBaseline.save(water, electric).then((ok) => {
                          if (!ok) return;
                          void meterHistory.reload();
                          onTenantUpdated?.();
                        });
                      }}
                    />
                  )}
                  <MeterReadCard
                    kind="water"
                    prev={row.water_prev}
                    currValue={meters.water}
                    rate={waterRate}
                    disabled={disabled || meterLocked}
                    onCurrChange={(value) =>
                      onMeterChange(row.tenant_id, value, meters.electric)
                    }
                    photoSlot={
                      <MeterPhotoVaultSkin
                        planTier={planTier}
                        photos={meterPhotos.photos.filter(
                          (p) => p.utility_type === "water",
                        )}
                        utilityOnly="water"
                        compact
                        disabled={disabled || meterLocked}
                        uploading={meterPhotos.status === "uploading"}
                        error={meterPhotos.error}
                        onUpload={(_, file) =>
                          void meterPhotos.upload("water", file)
                        }
                      />
                    }
                  />
                  <MeterReadCard
                    kind="electric"
                    prev={row.electric_prev}
                    currValue={meters.electric}
                    rate={electricRate}
                    disabled={disabled || meterLocked}
                    onCurrChange={(value) =>
                      onMeterChange(row.tenant_id, meters.water, value)
                    }
                    photoSlot={
                      <MeterPhotoVaultSkin
                        planTier={planTier}
                        photos={meterPhotos.photos.filter(
                          (p) => p.utility_type === "electric",
                        )}
                        utilityOnly="electric"
                        compact
                        disabled={disabled || meterLocked}
                        uploading={meterPhotos.status === "uploading"}
                        error={meterPhotos.error}
                        onUpload={(_, file) =>
                          void meterPhotos.upload("electric", file)
                        }
                      />
                    }
                  />
                </div>
              ) : (
                <p className="text-sm text-zinc-500">{t("owner.billing.rentOnly")}</p>
              )}
            </>
          )}

          {row.invoice_status === "pending" && row.line_linked && onRemind && (
            <div className="space-y-2">
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
                  className={`min-h-12 w-full rounded-lg border text-base font-medium disabled:cursor-not-allowed disabled:opacity-50 ${REMINDER_TIER_BUTTON_CLASS[row.reminder_recommended]}`}
                >
                  <EasyModeCtaIcon name="remind" />
                  {reminderDisabled
                    ? t("owner.reminder.sending")
                    : remindedTenantId === row.tenant_id
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

          {pendingInvoice && (
            <IssuedInvoiceSkin
              invoice={pendingInvoice}
              disabled={disabled}
              savingAction={overrideSavingAction}
              meterPhotos={meterPhotos.photos}
              onApprove={(input) => onApprove(pendingInvoice.id, input)}
            />
          )}

          {scanningAnomalyInvoice && (
            <IssuedInvoiceSkin
              invoice={scanningAnomalyInvoice}
              variant="scanningAnomaly"
              disabled={disabled}
              savingAction={overrideSavingAction}
              meterPhotos={meterPhotos.photos}
              onApprove={(input) => onApprove(scanningAnomalyInvoice.id, input)}
            />
          )}

          {scanningInvoice && (
            <OverrideSkin
              invoice={scanningInvoice}
              disabled={disabled}
              savingAction={overrideSavingAction}
              autoVerifyEnabled={autoVerifyEnabled}
              billingHref={billingHref}
              onAutoVerify={() => onAutoVerify(scanningInvoice.id)}
              onReject={(note) => onReject(scanningInvoice.id, note)}
              onApprove={(input) => onApprove(scanningInvoice.id, input)}
            />
          )}

          {paidInvoice && (
            <PaidInvoiceSkin invoice={paidInvoice} />
          )}

          <div className="space-y-3 border-t border-zinc-100 pt-4">
            <DepositTrackerSkin
              planTier={planTier}
              deposit={depositTracker.deposit}
              disabled={disabled}
              saving={depositTracker.status === "saving"}
              error={depositTracker.error}
              onSave={(input) => void depositTracker.save(input)}
            />
            <MoveChecklistSkin
              planTier={planTier}
              disabled={disabled}
              busy={tenantDocs.status === "uploading"}
              onUpload={(docType, file) => void tenantDocs.upload(docType, file)}
            />
            <DocumentVaultSkin
              planTier={planTier}
              documents={tenantDocs.documents}
              disabled={disabled}
              busy={
                tenantDocs.status === "uploading" || tenantDocs.status === "deleting"
              }
              error={tenantDocs.error}
              onUpload={(docType, file) => void tenantDocs.upload(docType, file)}
              onDelete={(id) => void tenantDocs.remove(id)}
            />
            <ContractLeaseSkin
              planTier={planTier}
              disabled={disabled}
              loading={leaseContract.status === "loading"}
              error={leaseContract.error}
              onGenerate={() => {
                void leaseContract.generate().then((ok) => {
                  if (ok) void tenantDocs.reload();
                });
              }}
            />
            {includeUtilities && (
              <MeterHistoryList
                rows={meterHistory.rows}
                loading={meterHistory.status === "loading"}
              />
            )}
          </div>
        </div>

        {showBillingFooter && onSaveAndNext && onIssueRoom && (
          <RoomDetailBillingFooterSkin
            totalAmount={total_amount}
            metersComplete={metersComplete}
            includeUtilities={includeUtilities}
            savingAction={roomDetailSaving}
            disabled={disabled}
            hasNextRoom={hasNextRoom}
            readyCount={readyCount}
            onSaveAndNext={onSaveAndNext}
            onIssueRoom={onIssueRoom}
          />
        )}
      </div>
    </div>
  );
}
