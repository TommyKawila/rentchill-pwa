"use client";

import { useLocale } from "@/components/LocaleProvider";
import { BillHistoryList } from "@/components/skins/minimal/BillHistoryList";
import { ContactLandlordSkin } from "@/components/skins/minimal/ContactLandlordSkin";
import { InvoiceSkin } from "@/components/skins/minimal/InvoiceSkin";
import { TenantPaymentSuccessSkin } from "@/components/skins/minimal/TenantPaymentSuccessSkin";
import { dueDateFromBillingMonth } from "@/services/billingDueDateService";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { TenantBottomNavSkin } from "@/components/skins/minimal/TenantBottomNavSkin";
import { TenantMaintenanceFormSkin } from "@/components/skins/minimal/TenantMaintenanceFormSkin";
import { TenantMaintenanceListSkin } from "@/components/skins/minimal/TenantMaintenanceListSkin";
import { TenantMeterPhotosSkin } from "@/components/skins/minimal/TenantMeterPhotosSkin";
import { TenantVaultSkin } from "@/components/skins/minimal/TenantVaultSkin";
import type { PaymentFeedback } from "@/hooks/usePaymentEngine";
import type { useTenantMaintenance } from "@/hooks/useTenantMaintenance";
import type { useTenantVault } from "@/hooks/useTenantVault";
import type { MeterPhotoRow } from "@/services/meterPhotoService";
import type { TenantDocumentRow } from "@/services/documentVaultService";
import type { PropertyContact, Invoice } from "@/services/types";
import type {
  TenantBoardTab,
  TenantNavBadges,
} from "@/services/tenantBoardNavService";

type TenantMaintenanceState = ReturnType<typeof useTenantMaintenance>;
type TenantVaultState = ReturnType<typeof useTenantVault>;

interface TenantBoardShellSkinProps {
  welcomeName: string;
  roomNumber: string;
  activeTab: TenantBoardTab;
  badges: TenantNavBadges;
  onTabChange: (tab: TenantBoardTab) => void;
  displayInvoice: Invoice | null;
  isCurrentInvoice: boolean;
  boardInvoice: Invoice | null;
  invoiceHistory: Invoice[];
  viewingInvoice: Invoice | null;
  onSelectHistoryInvoice: (invoice: Invoice) => void;
  onBackToCurrentInvoice: () => void;
  meterPhotos: MeterPhotoRow[];
  tenantName: string;
  isPaying: boolean;
  slipPreviewUrl?: string | null;
  slipAttached?: boolean;
  paymentSuccess?: boolean;
  onAttachSlip?: () => void;
  onClearSlip?: () => void;
  onConfirmPay?: () => void;
  paymentError: string | null;
  paymentFeedback: PaymentFeedback | null;
  documents: TenantDocumentRow[];
  canUploadDocuments: boolean;
  canSignContract: boolean;
  vault: TenantVaultState;
  onVaultReload: () => void;
  tenantMaintenance: TenantMaintenanceState;
  contact: PropertyContact | null;
  currency?: string;
}

export function TenantBoardShellSkin({
  welcomeName,
  roomNumber,
  activeTab,
  badges,
  onTabChange,
  displayInvoice,
  isCurrentInvoice,
  boardInvoice,
  invoiceHistory,
  viewingInvoice,
  onSelectHistoryInvoice,
  onBackToCurrentInvoice,
  meterPhotos,
  tenantName,
  isPaying,
  slipPreviewUrl = null,
  slipAttached = false,
  paymentSuccess = false,
  onAttachSlip,
  onClearSlip,
  onConfirmPay,
  paymentError,
  paymentFeedback,
  documents,
  canUploadDocuments,
  canSignContract,
  vault,
  onVaultReload,
  tenantMaintenance,
  contact,
  currency = "THB",
}: TenantBoardShellSkinProps) {
  const { t, locale } = useLocale();

  const hasLease = documents.some((doc) => doc.doc_type === "lease");
  const signed = documents.some((doc) => doc.doc_type === "contract_signed");
  const showVault = canUploadDocuments || canSignContract;

  return (
    <>
      <header className="border-b border-zinc-100 px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {activeTab === "bill" ? (
              <>
                <p className="text-sm font-medium uppercase tracking-wide text-rc-green">
                  {t("tenant.board.tag")}
                </p>
                <h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-900">
                  {t("tenant.board.title")}
                </h1>
              </>
            ) : null}
            <p
              className={
                activeTab === "bill"
                  ? "mt-1 text-base text-zinc-600"
                  : "text-base font-medium text-zinc-900"
              }
            >
              {t("tenant.board.greetingRoom", {
                name: welcomeName,
                room: roomNumber,
              })}
            </p>
          </div>
          <LocaleToggleSkin />
        </div>
      </header>

      <div className="pb-24">
        {activeTab === "bill" && (
          <>
            {viewingInvoice && (
              <div className="border-b border-zinc-100 bg-white px-4 py-3">
                <button
                  type="button"
                  onClick={onBackToCurrentInvoice}
                  className="inline-flex min-h-12 items-center text-base text-zinc-600 underline"
                >
                  {t("tenant.history.backToCurrent")}
                </button>
              </div>
            )}
            {displayInvoice ? (
              <>
                {paymentSuccess && isCurrentInvoice && <TenantPaymentSuccessSkin />}
                <InvoiceSkin
                  invoice={displayInvoice}
                  tenantName={tenantName}
                  roomNumber={roomNumber}
                  propertyName={contact?.property_name}
                  dueDateLabel={
                    contact && displayInvoice.status === "pending"
                      ? dueDateFromBillingMonth(
                          displayInvoice.billing_month,
                          contact.billing_day,
                          locale,
                        )
                      : null
                  }
                  isPaying={isPaying}
                  meterPhotos={isCurrentInvoice ? meterPhotos : []}
                  promptPay={contact?.payment_prompt_pay ?? null}
                  bankAccount={contact?.payment_bank_account ?? null}
                  receiverName={contact?.payment_receiver_name ?? null}
                  slipPreviewUrl={isCurrentInvoice ? slipPreviewUrl : null}
                  slipAttached={isCurrentInvoice ? slipAttached : false}
                  onAttachSlip={isCurrentInvoice ? onAttachSlip : undefined}
                  onClearSlip={isCurrentInvoice ? onClearSlip : undefined}
                  onConfirmPay={isCurrentInvoice ? onConfirmPay : undefined}
                  currency={currency}
                />
                {isCurrentInvoice && (
                  <TenantMeterPhotosSkin photos={meterPhotos} />
                )}
                {invoiceHistory.length > 0 && (
                  <BillHistoryList
                    invoices={invoiceHistory}
                    selectedMonth={viewingInvoice?.billing_month ?? null}
                    onSelect={onSelectHistoryInvoice}
                    currency={currency}
                  />
                )}
                {paymentError && isCurrentInvoice && (
                  <p className="px-6 pb-4 text-center text-sm text-red-600">
                    {paymentError}
                  </p>
                )}
                {paymentFeedback?.autoVerified &&
                  isCurrentInvoice &&
                  boardInvoice?.status === "paid" && (
                    <p className="px-6 pb-4 text-center text-sm text-rc-success-ink">
                      {t("tenant.board.slipVerified")}
                    </p>
                  )}
                {paymentFeedback?.manualReviewOnly &&
                  isCurrentInvoice &&
                  boardInvoice?.status === "scanning" && (
                    <p className="px-6 pb-4 text-center text-sm text-zinc-600">
                      {t("tenant.board.slipManualReview")}
                    </p>
                  )}
                {(paymentFeedback?.message && !paymentFeedback.autoVerified) ||
                (isCurrentInvoice &&
                  boardInvoice?.slip_rejection_note &&
                  boardInvoice.status === "pending") ? (
                  <p className="px-6 pb-4 text-center text-sm text-red-600">
                    {boardInvoice?.slip_rejection_note ?? paymentFeedback?.message}
                  </p>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 p-6 text-center">
                <p className="text-base text-zinc-600">{t("tenant.board.noBill")}</p>
                <p className="text-sm text-zinc-500">{t("tenant.board.waitOwner")}</p>
                <button
                  type="button"
                  onClick={() => onTabChange("contact")}
                  className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
                >
                  {t("tenant.board.goContact")} →
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "maintenance" && (
          <>
            <TenantMaintenanceListSkin
              tickets={tenantMaintenance.tickets}
              loading={tenantMaintenance.ticketsLoading}
            />
            <TenantMaintenanceFormSkin
              disabled={tenantMaintenance.status === "submitting"}
              submitting={tenantMaintenance.status === "submitting"}
              success={tenantMaintenance.status === "success"}
              fieldErrors={tenantMaintenance.fieldErrors}
              onSubmit={(input) => {
                void tenantMaintenance.submit(input);
              }}
              onSubmitAnother={tenantMaintenance.reset}
            />
            {tenantMaintenance.error && (
              <p className="px-6 pb-4 text-center text-sm text-red-600">
                {tenantMaintenance.error}
              </p>
            )}
          </>
        )}

        {activeTab === "contact" &&
          (contact ? (
            <ContactLandlordSkin contact={contact} />
          ) : (
            <p className="p-6 text-center text-base text-zinc-500">
              {t("tenant.contact.unavailable")}
            </p>
          ))}

        {activeTab === "documents" && (
          <>
            {showVault ? (
              <TenantVaultSkin
                documents={documents}
                canUpload={canUploadDocuments}
                canSign={canSignContract}
                hasLease={hasLease}
                signed={signed}
                disabled={vault.status === "uploading" || vault.status === "signing"}
                onUpload={(docType, file) => {
                  void vault.upload(docType, file).then(() => onVaultReload());
                }}
                onSign={(file) => {
                  void vault.sign(file).then(() => onVaultReload());
                }}
              />
            ) : (
              <p className="p-6 text-center text-base text-zinc-500">
                {t("tenant.documents.starterEmpty")}
              </p>
            )}
            {vault.error && (
              <p className="px-6 pb-4 text-center text-sm text-red-600">
                {vault.error}
              </p>
            )}
          </>
        )}
      </div>

      <TenantBottomNavSkin
        activeTab={activeTab}
        badges={badges}
        onTabChange={onTabChange}
      />
    </>
  );
}
