"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
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
import { IssuedInvoiceSkin } from "@/components/skins/minimal/IssuedInvoiceSkin";
import { OwnerSlipApprovedSkin } from "@/components/skins/minimal/OwnerSlipApprovedSkin";
import { SlipRejectReasonSkin } from "@/components/skins/minimal/SlipRejectReasonSkin";
import {
  SlipVerificationFooter,
  SlipVerificationSkin,
} from "@/components/skins/minimal/SlipVerificationSkin";
import { PaidInvoiceSkin } from "@/components/skins/minimal/PaidInvoiceSkin";
import {
  InvoiceGeneratorSkin,
  buildGeneratorBillPayload,
  type InvoiceGeneratorIssueInput,
} from "@/components/skins/minimal/InvoiceGeneratorSkin";
import { InvoiceLinePreviewSkin } from "@/components/skins/minimal/InvoiceLinePreviewSkin";
import {
  copyBillPlainText,
  shareBillPlainText,
  sendBillToLine,
} from "@/services/billSendClientService";
import type { RoomDetailSavingAction } from "@/components/skins/minimal/RoomDetailBillingFooterSkin";
import { statusMessageKey } from "@/services/i18n/translate";
import { useMeterPhotos } from "@/hooks/useMeterPhotos";
import { useMeterHistory } from "@/hooks/useMeterHistory";
import { useMeterBaseline } from "@/hooks/useMeterBaseline";
import { useTenantDocuments } from "@/hooks/useTenantDocuments";
import { useLeaseContract } from "@/hooks/useLeaseContract";
import { useDepositTracker } from "@/hooks/useDepositTracker";
import type { PlanTier } from "@/services/propertyQuotaService";
import { canSendBillViaLineOa } from "@/services/planLimits";
import type { WaterBillingMode } from "@/services/propertyBillingSettingsService";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import type { InvoiceOverrideRow } from "@/services/invoiceOverrideService";
import type { ApproveInvoiceInput, OverrideSavingAction } from "@/hooks/useInvoiceOverride";
import { useTenantProfile } from "@/hooks/useTenantProfile";
import { TenantPersonIcon } from "@/components/skins/minimal/TenantPersonIcon";
import { isMeterEntryLocked } from "@/services/propertyBillingSettingsService";
import type { PropertyPaymentAccount } from "@/services/types";
import type { BillLinePayload } from "@/services/line/billFlexMessage";
import { useTenantInvoiceHistory } from "@/hooks/useTenantInvoiceHistory";
import { RoomMoveOutDangerSkin } from "@/components/skins/minimal/RoomMoveOutDangerSkin";
import { RoomRatesSummarySkin } from "@/components/skins/minimal/RoomRatesSummarySkin";
import { RoomInvoiceHistorySkin } from "@/components/skins/minimal/RoomInvoiceHistorySkin";
import { RoomBillingReminderPanelSkin } from "@/components/skins/minimal/RoomBillingReminderPanelSkin";
import type { MessageKey } from "@/services/i18n/messages";
import type { ReminderDaySettings, ReminderTier } from "@/services/paymentReminderTier";

interface RoomDetailModalProps {
  row: MonthlyBillingRow;
  propertySlug: string;
  propertyName: string;
  coverUrl?: string | null;
  planTier: PlanTier;
  billingMonth: string;
  billingDay: number;
  includeUtilities: boolean;
  waterBillingMode: WaterBillingMode;
  defaultWaterFlatBaht: number;
  waterRate: number;
  electricRate: number;
  reminderSettings: ReminderDaySettings;
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
  onIssueRoom?: (input: InvoiceGeneratorIssueInput) => Promise<boolean>;
  paymentAccount?: PropertyPaymentAccount | null;
  approveSuccess?: boolean;
  moveOutSaving?: boolean;
  moveOutErrorKey?: MessageKey | null;
  onMoveOut?: () => Promise<void>;
}

function roomStatusLabel(
  row: MonthlyBillingRow,
  t: ReturnType<typeof useLocale>["t"],
) {
  if (row.invoice_status === "pending") return t("owner.invoice.issuedPending");
  if (row.invoice_status) return t(statusMessageKey(row.invoice_status));
  return t("status.noBill");
}

type DetailTab = "general" | "billing" | "documents";

const DETAIL_TABS: { id: DetailTab; labelKey: MessageKey }[] = [
  { id: "general", labelKey: "owner.roomDetail.tab.general" },
  { id: "billing", labelKey: "owner.roomDetail.tab.billing" },
  { id: "documents", labelKey: "owner.roomDetail.tab.documents" },
];

export function RoomDetailModal({
  row,
  propertySlug,
  propertyName,
  coverUrl,
  planTier,
  billingMonth,
  billingDay,
  includeUtilities,
  waterBillingMode,
  defaultWaterFlatBaht,
  waterRate,
  electricRate,
  reminderSettings,
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
  paymentAccount = null,
  approveSuccess = false,
  moveOutSaving = false,
  moveOutErrorKey = null,
  onMoveOut,
}: RoomDetailModalProps) {
  const { t } = useLocale();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>("general");
  const [entered, setEntered] = useState(false);
  const [slipRejectOpen, setSlipRejectOpen] = useState(false);
  const [linePreview, setLinePreview] = useState<BillLinePayload | null>(null);
  const [sendingLine, setSendingLine] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
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
  const invoiceHistory = useTenantInvoiceHistory(row.tenant_id);
  const meterLocked = isMeterEntryLocked(row);
  const showBillingGenerator =
    !row.invoice_id &&
    !paidInvoice &&
    !(includeUtilities && !row.electric_prev);
  const showSlipReview =
    Boolean(scanningInvoice) && detailTab === "billing" && !approveSuccess;
  const issueMode = Boolean(
    showBillingGenerator && onIssueRoom && !showSlipReview && !approveSuccess,
  );

  const handleCopyBillText = async (input: InvoiceGeneratorIssueInput) => {
    const payload = buildGeneratorBillPayload(
      row,
      input,
      meters,
      includeUtilities,
      waterBillingMode,
      waterRate,
      electricRate,
    );
    try {
      await copyBillPlainText(payload);
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("[RoomDetailModal.copyBill]", { tenantId: row.tenant_id }, err);
    }
  };

  const handleSaveAndSend = async (input: InvoiceGeneratorIssueInput) => {
    if (!onIssueRoom) return;
    const ok = await onIssueRoom(input);
    if (!ok) return;
    const payload = buildGeneratorBillPayload(
      row,
      input,
      meters,
      includeUtilities,
      waterBillingMode,
      waterRate,
      electricRate,
    );
    if (canSendBillViaLineOa(planTier)) {
      setLinePreview(payload);
      return;
    }
    try {
      await copyBillPlainText(payload);
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 2000);
      onTenantUpdated?.();
    } catch (err) {
      console.error("[RoomDetailModal.copyBill]", { tenantId: row.tenant_id }, err);
    }
  };

  const handleConfirmSendLine = async () => {
    if (!linePreview) return;
    setSendingLine(true);
    try {
      if (row.line_linked) {
        await sendBillToLine({
          propertySlug,
          tenantId: row.tenant_id,
          billingMonth: linePreview.billingMonth,
        });
        setLinePreview(null);
        onTenantUpdated?.();
        onClose();
        return;
      }
      await shareBillPlainText(linePreview);
      setLinePreview(null);
      onTenantUpdated?.();
    } catch (err) {
      console.error(
        "[RoomDetailModal.sendLine]",
        { tenantId: row.tenant_id, billingMonth: linePreview.billingMonth },
        err,
      );
    } finally {
      setSendingLine(false);
    }
  };

  useEffect(() => {
    setIsEditingProfile(false);
    setSlipRejectOpen(false);
    const scanningWithSlip =
      row.invoice_status === "scanning" && Boolean(scanningInvoice);
    if (showBillingGenerator && onIssueRoom) {
      setDetailTab("billing");
    } else {
      setDetailTab(scanningWithSlip ? "billing" : "general");
    }
    tenantProfile.clearError();
    // Reset tab only when opening a different room — not on billing refresh.
  }, [row.tenant_id]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

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
    <div
      className={`fixed inset-0 z-50 flex justify-center ${
        issueMode ? "items-stretch" : "items-end sm:items-center"
      }`}
    >
      <button
        type="button"
        aria-label={t("owner.rooms.close")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 flex flex-col overflow-hidden transition-transform duration-300 ease-out ${
          issueMode
            ? `h-[100dvh] max-h-[100dvh] w-full max-w-[390px] bg-rc-bg ${
                entered ? "translate-x-0" : "translate-x-full"
              }`
            : `max-h-[90vh] w-full max-w-xl rounded-t-xl border border-zinc-100 bg-white sm:rounded-xl ${
                entered ? "translate-x-0" : "translate-x-full sm:translate-x-0"
              }`
        }`}
      >
        {issueMode ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
            <InvoiceGeneratorSkin
              row={row}
              propertyName={propertyName}
              coverUrl={coverUrl}
              billingMonth={billingMonth}
              includeUtilities={includeUtilities}
              waterBillingMode={waterBillingMode}
              defaultWaterFlatBaht={defaultWaterFlatBaht}
              waterRate={waterRate}
              electricRate={electricRate}
              meters={meters}
              onMeterChange={(water, electric) =>
                onMeterChange(row.tenant_id, water, electric)
              }
              paymentAccount={paymentAccount}
              planTier={planTier}
              meterPhotos={meterPhotos.photos}
              meterPhotosUploading={meterPhotos.status === "uploading"}
              meterPhotosError={meterPhotos.error}
              onMeterPhotoUpload={(kind, file) =>
                void meterPhotos.upload(kind, file)
              }
              needsBaseline={needsBaseline}
              meterLocked={meterLocked}
              meterBaselineSaving={meterBaseline.status === "saving"}
              meterBaselineError={meterBaseline.error}
              onSaveBaseline={(water, electric) => {
                void meterBaseline.save(water, electric).then((ok) => {
                  if (!ok) return;
                  void meterHistory.reload();
                  onTenantUpdated?.();
                });
              }}
              savingAction={roomDetailSaving}
              disabled={disabled}
              hasNextRoom={hasNextRoom}
              readyCount={readyCount}
              onBack={onClose}
              onSaveAndNext={onSaveAndNext}
              onSaveAndSend={(input) => void handleSaveAndSend(input)}
              onCopyText={(input) => void handleCopyBillText(input)}
            />
            {copySuccess && (
              <p className="text-sm text-rc-green-ink">
                {t("owner.invoiceGen.copySuccess")}
              </p>
            )}
          </div>
        ) : (
          <>
        <header className="relative z-20 shrink-0 flex items-start justify-between gap-3 border-b border-zinc-100 bg-white px-4 py-3">
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

        <div
          role="tablist"
          aria-label={t("owner.roomDetail.tab.general")}
          className="relative z-20 flex min-h-[64px] shrink-0 items-center gap-2 overflow-x-auto border-b border-zinc-100 bg-white px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {DETAIL_TABS.map((tab) => {
            const active = detailTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setDetailTab(tab.id)}
                className={`inline-flex min-h-12 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
                  active
                    ? "border-rc-green bg-rc-green text-white"
                    : "border-zinc-100 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {detailTab === "general" && (
            <>
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
              <RoomRatesSummarySkin
                propertySlug={propertySlug}
                row={row}
                includeUtilities={includeUtilities}
                waterBillingMode={waterBillingMode}
                defaultWaterFlatBaht={defaultWaterFlatBaht}
                waterRate={waterRate}
                electricRate={electricRate}
                meters={meters}
                disabled={disabled}
              />
              <div className="space-y-3">
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
              </div>
              {onMoveOut ? (
                <RoomMoveOutDangerSkin
                  roomNumber={row.room_number}
                  invoiceStatus={row.invoice_status}
                  saving={moveOutSaving}
                  errorKey={moveOutErrorKey}
                  onMoveOut={onMoveOut}
                />
              ) : null}
            </>
          )}

          {detailTab === "billing" && (
            <>
              {row.invoice_status === "pending" && row.line_linked && onRemind && (
                <RoomBillingReminderPanelSkin
                  row={row}
                  billingMonth={billingMonth}
                  billingDay={billingDay}
                  settings={reminderSettings}
                  disabled={disabled}
                  canRemind={canRemind}
                  reminderDisabled={reminderDisabled}
                  remindedTenantId={remindedTenantId}
                  onRemind={onRemind}
                />
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

              {approveSuccess && <OwnerSlipApprovedSkin />}

              {scanningInvoice && !approveSuccess && (
                <SlipVerificationSkin
                  invoice={scanningInvoice}
                  disabled={disabled}
                  savingAction={overrideSavingAction}
                  autoVerifyEnabled={autoVerifyEnabled}
                  billingHref={billingHref}
                  onAutoVerify={() => onAutoVerify(scanningInvoice.id)}
                />
              )}

              {paidInvoice && <PaidInvoiceSkin invoice={paidInvoice} />}

              {includeUtilities && (
                <MeterHistoryList
                  rows={meterHistory.rows}
                  loading={meterHistory.status === "loading"}
                />
              )}

              <RoomInvoiceHistorySkin
                invoices={invoiceHistory.invoices}
                loading={invoiceHistory.status === "loading"}
                error={invoiceHistory.error}
              />
            </>
          )}

          {detailTab === "documents" && (
            <DocumentVaultSkin
              planTier={planTier}
              variant="tab"
              documents={tenantDocs.documents}
              disabled={disabled}
              busy={
                tenantDocs.status === "uploading" || tenantDocs.status === "deleting"
              }
              error={tenantDocs.error}
              onUpload={(docType, file) => void tenantDocs.upload(docType, file)}
              onDelete={(id) => void tenantDocs.remove(id)}
            />
          )}
        </div>

        {showSlipReview && scanningInvoice && (
          <SlipVerificationFooter
            busy={Boolean(disabled || overrideSavingAction)}
            savingAction={overrideSavingAction}
            onApprove={() => onApprove(scanningInvoice.id)}
            onRejectClick={() => setSlipRejectOpen(true)}
          />
        )}
        </div>
          </>
        )}
      </div>

      {slipRejectOpen && scanningInvoice && (
        <SlipRejectReasonSkin
          busy={Boolean(disabled || overrideSavingAction)}
          saving={overrideSavingAction === "reject"}
          onConfirm={(note) => {
            onReject(scanningInvoice.id, note);
            setSlipRejectOpen(false);
          }}
          onCancel={() => setSlipRejectOpen(false)}
        />
      )}

      {linePreview && (
        <InvoiceLinePreviewSkin
          payload={linePreview}
          lineLinked={row.line_linked}
          sending={sendingLine}
          onConfirm={() => void handleConfirmSendLine()}
          onCancel={() => {
            if (!sendingLine) setLinePreview(null);
          }}
        />
      )}
    </div>
  );
}
