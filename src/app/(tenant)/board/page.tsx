"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { MobileFrame } from "@/components/frames/MobileFrame";
import { InviteCodeSkin } from "@/components/skins/minimal/InviteCodeSkin";
import { OwnerLineConnectPanel } from "@/components/skins/minimal/OwnerLineConnectPanel";
import { PdpaConsentSkin } from "@/components/skins/minimal/PdpaConsentSkin";
import { TenantBoardShellSkin } from "@/components/skins/minimal/TenantBoardShellSkin";
import { useLineAuth } from "@/hooks/useLineAuth";
import { usePaymentEngine } from "@/hooks/usePaymentEngine";
import { usePdpaConsent } from "@/hooks/usePdpaConsent";
import { useTenantBoard } from "@/hooks/useTenantBoard";
import { useTenantLink } from "@/hooks/useTenantLink";
import { useTenantMaintenance } from "@/hooks/useTenantMaintenance";
import { useTenantVault } from "@/hooks/useTenantVault";
import {
  canTenantSignContract,
  canTenantUploadDocuments,
} from "@/services/planLimits";
import {
  computeTenantNavBadges,
  tenantTabFromHash,
  tenantTabHash,
  type TenantBoardTab,
} from "@/services/tenantBoardNavService";
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
  const [hash, setHash] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const searchParams = useSearchParams();
  const inviteFromUrl = searchParams.get("invite") ?? "";

  const clearSlip = useCallback(() => {
    if (slipPreviewUrl) URL.revokeObjectURL(slipPreviewUrl);
    setSlipFile(null);
    setSlipPreviewUrl(null);
  }, [slipPreviewUrl]);

  useEffect(() => {
    return () => {
      if (slipPreviewUrl) URL.revokeObjectURL(slipPreviewUrl);
    };
  }, [slipPreviewUrl]);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    if (!window.location.hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#bill`);
      setHash("#bill");
    }
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const activeTab = useMemo(() => tenantTabFromHash(hash), [hash]);

  const handleTabChange = useCallback((tab: TenantBoardTab) => {
    const next = tenantTabHash(tab);
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}${next}`);
    setHash(next);
  }, []);

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
    planTier: board?.planTier ?? "free",
    enabled: !!board,
  });

  const tenantMaintenance = useTenantMaintenance(board?.tenant.id ?? null);

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

  const canUploadDocuments = canTenantUploadDocuments(board.planTier);
  const canSignContract = canTenantSignContract(board.planTier);
  const hasLease = board.documents.some((doc) => doc.doc_type === "lease");
  const signed = board.documents.some((doc) => doc.doc_type === "contract_signed");

  const badges = computeTenantNavBadges({
    invoiceStatus: board.invoice?.status,
    tickets: tenantMaintenance.tickets,
    canSign: canSignContract,
    hasLease,
    signed,
  });

  return (
    <MobileFrame>
      <TenantBoardShellSkin
        welcomeName={welcomeName}
        roomNumber={board.room.room_number}
        activeTab={activeTab}
        badges={badges}
        onTabChange={handleTabChange}
        displayInvoice={displayInvoice}
        isCurrentInvoice={isCurrentInvoice}
        boardInvoice={board.invoice}
        invoiceHistory={board.invoiceHistory}
        viewingInvoice={viewingInvoice}
        onSelectHistoryInvoice={setViewingInvoice}
        onBackToCurrentInvoice={() => setViewingInvoice(null)}
        meterPhotos={board.meterPhotos}
        tenantName={board.tenant.name}
        isPaying={paymentStatus === "uploading"}
        slipPreviewUrl={slipPreviewUrl}
        slipAttached={!!slipFile}
        paymentSuccess={paymentSuccess}
        onAttachSlip={() => {
          if (!isCurrentInvoice || !board.invoice) return;
          slipInputRef.current?.click();
        }}
        onClearSlip={clearSlip}
        onConfirmPay={() => {
          if (!slipFile || !board.invoice || !isCurrentInvoice) return;
          void submitSlip(board.invoice.id, board.tenant.id, slipFile).then(
            (invoice) => {
              if (!invoice) return;
              patchInvoice(invoice);
              setViewingInvoice(null);
              clearSlip();
              setPaymentSuccess(true);
              void reload();
            },
          );
        }}
        paymentError={paymentError}
        paymentFeedback={paymentFeedback}
        documents={board.documents}
        canUploadDocuments={canUploadDocuments}
        canSignContract={canSignContract}
        vault={vault}
        onVaultReload={() => void reload()}
        tenantMaintenance={tenantMaintenance}
        contact={board.contact}
        currency={board.currency}
      />
      <input
        ref={slipInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file || !board.invoice || !isCurrentInvoice) return;
          if (slipPreviewUrl) URL.revokeObjectURL(slipPreviewUrl);
          setSlipFile(file);
          setSlipPreviewUrl(URL.createObjectURL(file));
          setPaymentSuccess(false);
        }}
      />
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
