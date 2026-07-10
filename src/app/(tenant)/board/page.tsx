"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { MobileFrame } from "@/components/frames/MobileFrame";
import { BillHistoryList } from "@/components/skins/minimal/BillHistoryList";
import { ContactLandlordSkin } from "@/components/skins/minimal/ContactLandlordSkin";
import { InviteCodeSkin } from "@/components/skins/minimal/InviteCodeSkin";
import { InvoiceSkin } from "@/components/skins/minimal/InvoiceSkin";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { OwnerLineConnectPanel } from "@/components/skins/minimal/OwnerLineConnectPanel";
import { PdpaConsentSkin } from "@/components/skins/minimal/PdpaConsentSkin";
import { TenantMeterPhotosSkin } from "@/components/skins/minimal/TenantMeterPhotosSkin";
import { TenantVaultSkin } from "@/components/skins/minimal/TenantVaultSkin";
import { useTenantVault } from "@/hooks/useTenantVault";
import {
  canTenantSignContract,
  canTenantUploadDocuments,
} from "@/services/planLimits";
import { useLineAuth } from "@/hooks/useLineAuth";
import { usePaymentEngine } from "@/hooks/usePaymentEngine";
import { usePdpaConsent } from "@/hooks/usePdpaConsent";
import { useTenantBoard } from "@/hooks/useTenantBoard";
import { useTenantLink } from "@/hooks/useTenantLink";
import type { Invoice } from "@/services/types";

function AuthLoading({ message }: { message: string }) {
  return (
    <MobileFrame>
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-2 p-6 text-sm text-zinc-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        <p>{message}</p>
      </div>
    </MobileFrame>
  );
}

function TenantBoardMain() {
  const { t } = useLocale();
  const slipInputRef = useRef<HTMLInputElement>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const searchParams = useSearchParams();
  const inviteFromUrl = searchParams.get("invite") ?? "";

  const {
    isLoading: authLoading,
    error: authError,
    lineUserId,
    profile,
    statusMessage,
  } = useLineAuth();

  const devTenantId =
    searchParams.get("tenant_id") ??
    process.env.NEXT_PUBLIC_DEV_TENANT_ID ??
    null;

  const authReady = !authLoading;
  const useDevFallback = authReady && !lineUserId && !!devTenantId;
  const boardEnabled = authReady && (!!lineUserId || useDevFallback);

  const { board, isLoading, error, needsLink, reload, patchInvoice } =
    useTenantBoard({
      enabled: boardEnabled,
      lineUserId: useDevFallback ? null : lineUserId,
      tenantId: useDevFallback ? devTenantId : null,
    });

  const {
    status: linkStatus,
    error: linkError,
    link: linkTenant,
  } = useTenantLink();

  const {
    status: paymentStatus,
    error: paymentError,
    feedback: paymentFeedback,
    submitSlip,
  } = usePaymentEngine();

  const {
    status: consentStatus,
    error: consentError,
    acceptConsent,
  } = usePdpaConsent();

  const vault = useTenantVault({
    tenantId: board?.tenant.id ?? "",
    propertySlug: board?.propertySlug ?? "",
    roomId: board?.room.id ?? "",
    planTier: board?.planTier ?? "starter",
    enabled: !!board,
  });

  if (authLoading) return <AuthLoading message={statusMessage} />;

  if (authError && !lineUserId) {
    return (
      <MobileFrame>
        <div className="flex min-h-[420px] items-center justify-center p-6 text-center text-sm text-zinc-600">
          {authError}
        </div>
      </MobileFrame>
    );
  }

  if (authReady && !lineUserId && !useDevFallback) {
    return (
      <MobileFrame>
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-2 p-6 text-center text-sm text-zinc-600">
          {inviteFromUrl ? (
            <>
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
              <p>{t("tenant.board.loggingIn")}</p>
            </>
          ) : (
            <p>{t("tenant.board.openInLine")}</p>
          )}
        </div>
      </MobileFrame>
    );
  }

  if (isLoading) {
    return <AuthLoading message={t("tenant.board.loading")} />;
  }

  const showInvite =
    !!lineUserId && !board && (needsLink || Boolean(inviteFromUrl));

  if (showInvite) {
    return (
      <MobileFrame>
        <InviteCodeSkin
          initialCode={inviteFromUrl}
          disabled={linkStatus === "linking"}
          error={linkError}
          onSubmit={(code) => {
            void linkTenant(code, lineUserId).then((result) => {
              if (result) void reload();
            });
          }}
        />
      </MobileFrame>
    );
  }

  if (error || !board) {
    return (
      <MobileFrame>
        <div className="flex min-h-[420px] items-center justify-center p-6 text-center text-sm text-zinc-600">
          {error ?? t("tenant.board.notFound")}
        </div>
      </MobileFrame>
    );
  }

  const welcomeName = profile?.displayName ?? board.tenant.name;
  const displayInvoice = viewingInvoice ?? board.invoice;
  const isCurrentInvoice =
    !viewingInvoice ||
    viewingInvoice.billing_month === board.invoice?.billing_month;

  if (!board.tenant.pdpa_consented_at) {
    return (
      <MobileFrame>
        <PdpaConsentSkin
          tenantName={welcomeName}
          disabled={consentStatus === "submitting"}
          onAccept={() => {
            void acceptConsent(board.tenant.id).then((ok) => {
              if (ok) void reload();
            });
          }}
        />
        {consentError && (
          <p className="px-6 pb-4 text-center text-sm text-red-600">{consentError}</p>
        )}
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <header className="border-b border-zinc-200 px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              {t("tenant.board.tag")}
            </p>
            <h1 className="mt-1 text-lg font-semibold text-zinc-900">
              {t("tenant.board.title")}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              {t("tenant.board.greeting", { name: welcomeName })}
            </p>
          </div>
          <LocaleToggleSkin />
        </div>
      </header>

      {displayInvoice ? (
        <>
          <input
            ref={slipInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file || !board.invoice || !isCurrentInvoice) return;

              void submitSlip(board.invoice.id, board.tenant.id, file).then(
                (invoice) => {
                  if (!invoice) return;
                  patchInvoice(invoice);
                  setViewingInvoice(null);
                  void reload();
                },
              );
            }}
          />
          {viewingInvoice && (
            <div className="border-b border-zinc-200 bg-white px-4 py-2">
              <button
                type="button"
                onClick={() => setViewingInvoice(null)}
                className="text-xs text-zinc-600 underline"
              >
                {t("tenant.history.backToCurrent")}
              </button>
            </div>
          )}
          <InvoiceSkin
            invoice={displayInvoice}
            tenantName={board.tenant.name}
            roomNumber={board.room.room_number}
            isPaying={paymentStatus === "uploading"}
            meterPhotos={isCurrentInvoice ? board.meterPhotos : []}
            onPay={() => {
              if (isCurrentInvoice) slipInputRef.current?.click();
            }}
          />
          {isCurrentInvoice && <TenantMeterPhotosSkin photos={board.meterPhotos} />}
          {board.invoiceHistory.length > 0 && (
            <BillHistoryList
              invoices={board.invoiceHistory}
              selectedMonth={viewingInvoice?.billing_month ?? null}
              onSelect={(invoice) => setViewingInvoice(invoice)}
            />
          )}
          {paymentError && isCurrentInvoice && (
            <p className="px-6 pb-4 text-center text-sm text-red-600">
              {paymentError}
            </p>
          )}
          {paymentFeedback?.autoVerified &&
            isCurrentInvoice &&
            board.invoice?.status === "paid" && (
            <p className="px-6 pb-4 text-center text-sm text-green-700">
              {t("tenant.board.slipVerified")}
            </p>
          )}
          {paymentFeedback?.manualReviewOnly &&
            isCurrentInvoice &&
            board.invoice?.status === "scanning" && (
              <p className="px-6 pb-4 text-center text-sm text-zinc-600">
                {t("tenant.board.slipManualReview")}
              </p>
            )}
          {(paymentFeedback?.message && !paymentFeedback.autoVerified) ||
          (isCurrentInvoice &&
            board.invoice?.slip_rejection_note &&
            board.invoice.status === "pending") ? (
            <p className="px-6 pb-4 text-center text-sm text-red-600">
              {board.invoice?.slip_rejection_note ?? paymentFeedback?.message}
            </p>
          ) : null}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <p className="text-sm text-zinc-600">{t("tenant.board.noBill")}</p>
          <p className="text-xs text-zinc-500">{t("tenant.board.waitOwner")}</p>
        </div>
      )}

      {board && (
        <TenantVaultSkin
          documents={board.documents}
          canUpload={canTenantUploadDocuments(board.planTier)}
          canSign={canTenantSignContract(board.planTier)}
          hasLease={board.documents.some((doc) => doc.doc_type === "lease")}
          signed={board.documents.some((doc) => doc.doc_type === "contract_signed")}
          disabled={vault.status === "uploading" || vault.status === "signing"}
          onUpload={(docType, file) => {
            void vault.upload(docType, file).then(() => reload());
          }}
          onSign={(file) => {
            void vault.sign(file).then(() => reload());
          }}
        />
      )}
      {vault.error && (
        <p className="px-6 pb-4 text-center text-sm text-red-600">{vault.error}</p>
      )}

      {board.contact && <ContactLandlordSkin contact={board.contact} />}
    </MobileFrame>
  );
}

function TenantBoardContent() {
  const searchParams = useSearchParams();
  const ownerConnectSlug = searchParams.get("owner_connect");
  const ownerConnectToken = searchParams.get("token");

  if (ownerConnectSlug && ownerConnectToken) {
    return (
      <OwnerLineConnectPanel
        propertySlug={ownerConnectSlug}
        token={ownerConnectToken}
      />
    );
  }

  return <TenantBoardMain />;
}

export default function TenantBoardPage() {
  const { t } = useLocale();

  return (
    <Suspense fallback={<AuthLoading message={t("common.loading")} />}>
      <TenantBoardContent />
    </Suspense>
  );
}
