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
import { PaidInvoiceSkin } from "@/components/skins/minimal/PaidInvoiceSkin";
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
import { useTenantProfile } from "@/hooks/useTenantProfile";
import { TenantPersonIcon } from "@/components/skins/minimal/TenantPersonIcon";

interface RoomDetailModalProps {
  row: MonthlyBillingRow;
  propertySlug: string;
  planTier: PlanTier;
  billingMonth: string;
  includeUtilities: boolean;
  waterRate: number;
  electricRate: number;
  reviewInvoice?: InvoiceOverrideRow | null;
  paidInvoice?: InvoiceOverrideRow | null;
  autoVerifyEnabled?: boolean;
  billingHref?: string;
  disabled?: boolean;
  canRemind?: boolean;
  reminderDisabled?: boolean;
  remindedTenantId?: string | null;
  onClose: () => void;
  onMeterChange: (tenantId: string, water: string, electric: string) => void;
  meters: { water: string; electric: string };
  onRemind?: (tenantId: string) => void;
  onSaveMeters: (invoiceId: string, water: number, electric: number) => void;
  onAutoVerify: (invoiceId: string) => void;
  onReject: (invoiceId: string, note?: string) => void;
  onApprove: (invoiceId: string, slipUrl?: string) => void;
  onTenantUpdated?: () => void;
}

function isLocked(status: MonthlyBillingRow["invoice_status"]) {
  return status === "paid" || status === "scanning";
}

export function RoomDetailModal({
  row,
  propertySlug,
  planTier,
  billingMonth,
  includeUtilities,
  waterRate,
  electricRate,
  reviewInvoice,
  paidInvoice,
  autoVerifyEnabled,
  billingHref,
  disabled,
  canRemind,
  reminderDisabled,
  remindedTenantId,
  onClose,
  onMeterChange,
  meters,
  onRemind,
  onSaveMeters,
  onAutoVerify,
  onReject,
  onApprove,
  onTenantUpdated,
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
  const locked = isLocked(row.invoice_status);

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
        className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-xl border border-zinc-200 bg-white sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <div className="flex min-w-0 items-start gap-x-3">
            <TenantPersonIcon className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />
            <div>
              <p className="text-base font-bold tracking-tight text-zinc-900">
                {t("common.room", { number: row.room_number })}
              </p>
              <p className="text-xs text-zinc-500">
                {tenantDisplayName}
                {row.invoice_status
                  ? ` · ${t(statusMessageKey(row.invoice_status))}`
                  : ` · ${t("status.noBill")}`}
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
              className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600"
            >
              {t("owner.rooms.close")}
            </button>
          </div>
        </header>

        <div className="space-y-4 overflow-y-auto px-4 py-4">
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

          {!reviewInvoice && !paidInvoice && (
            <>
              {includeUtilities ? (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500">
                    {t("owner.meter.moveInStatus", {
                      date: row.move_in_date,
                    })}
                  </p>
                  {needsBaseline && !locked && (
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
                    disabled={disabled || locked}
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
                        disabled={disabled || locked}
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
                    disabled={disabled || locked}
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
                        disabled={disabled || locked}
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
                <p className="text-xs text-zinc-500">{t("owner.billing.rentOnly")}</p>
              )}
              <p className="text-sm font-medium">
                {t("common.total")} ฿{total_amount.toLocaleString("th-TH")}
              </p>
            </>
          )}

          {row.invoice_status === "pending" && row.line_linked && onRemind && (
            <button
              type="button"
              disabled={disabled || reminderDisabled || !canRemind}
              onClick={() => onRemind(row.tenant_id)}
              className="w-full rounded-md border border-amber-300 bg-amber-50 py-2 text-sm font-medium text-amber-900 disabled:opacity-50"
            >
              <EasyModeCtaIcon name="remind" />
              {remindedTenantId === row.tenant_id
                ? t("owner.reminder.sent")
                : t("owner.reminder.send")}
            </button>
          )}

          {reviewInvoice && (
            <OverrideSkin
              invoice={reviewInvoice}
              disabled={disabled}
              autoVerifyEnabled={autoVerifyEnabled}
              billingHref={billingHref}
              onSaveMeters={(w, e) => onSaveMeters(reviewInvoice.id, w, e)}
              onAutoVerify={() => onAutoVerify(reviewInvoice.id)}
              onReject={(note) => onReject(reviewInvoice.id, note)}
              onApprove={(slipUrl) => onApprove(reviewInvoice.id, slipUrl)}
            />
          )}

          {paidInvoice && !reviewInvoice && (
            <PaidInvoiceSkin invoice={paidInvoice} />
          )}

          <div className="space-y-2 border-t border-zinc-100 pt-4">
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
      </div>
    </div>
  );
}
