"use client";

import { Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { MobileFrame } from "@/components/frames/MobileFrame";
import { InviteCodeSkin } from "@/components/skins/minimal/InviteCodeSkin";
import { InvoiceSkin } from "@/components/skins/minimal/InvoiceSkin";
import { PdpaConsentSkin } from "@/components/skins/minimal/PdpaConsentSkin";
import { useLineAuth } from "@/hooks/useLineAuth";
import { usePaymentEngine } from "@/hooks/usePaymentEngine";
import { usePdpaConsent } from "@/hooks/usePdpaConsent";
import { useTenantBoard } from "@/hooks/useTenantBoard";
import { useTenantLink } from "@/hooks/useTenantLink";

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

function TenantBoardContent() {
  const slipInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const inviteFromUrl = searchParams.get("invite") ?? "";

  const {
    isLoading: authLoading,
    error: authError,
    lineUserId,
    profile,
    isInClient,
    statusMessage,
  } = useLineAuth();

  const devTenantId =
    searchParams.get("tenant_id") ??
    process.env.NEXT_PUBLIC_DEV_TENANT_ID ??
    null;

  const authReady = !authLoading;
  const useDevFallback = authReady && !isInClient && !!devTenantId;
  const boardEnabled =
    authReady && ((isInClient && !!lineUserId) || useDevFallback);

  const { board, isLoading, error, needsLink, reload, patchInvoice } =
    useTenantBoard({
      enabled: boardEnabled,
      lineUserId: isInClient ? lineUserId : null,
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

  if (authLoading) return <AuthLoading message={statusMessage} />;

  if (isInClient && authError && !lineUserId) {
    return (
      <MobileFrame>
        <div className="flex min-h-[420px] items-center justify-center p-6 text-center text-sm text-zinc-600">
          {authError}
        </div>
      </MobileFrame>
    );
  }

  if (authReady && isInClient && !lineUserId) {
    return (
      <MobileFrame>
        <div className="flex min-h-[420px] items-center justify-center p-6 text-center text-sm text-zinc-600">
          กำลังเข้าสู่ระบบ LINE...
        </div>
      </MobileFrame>
    );
  }

  if (authReady && !lineUserId && !useDevFallback) {
    return (
      <MobileFrame>
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-2 p-6 text-center text-sm text-zinc-600">
          <p>เปิดลิงก์จากแอป LINE</p>
        </div>
      </MobileFrame>
    );
  }

  if (isLoading) {
    return <AuthLoading message="กำลังโหลดข้อมูล..." />;
  }

  if (needsLink && lineUserId) {
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
          {error ?? "ไม่พบข้อมูล"}
        </div>
      </MobileFrame>
    );
  }

  const welcomeName = profile?.displayName ?? board.tenant.name;

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
        <p className="text-xs font-medium uppercase tracking-wide text-green-600">
          บิลค่าเช่า
        </p>
        <h1 className="mt-1 text-lg font-semibold text-zinc-900">
          บิลค่าเช่าประจำเดือน
        </h1>
        <p className="mt-1 text-sm text-zinc-600">สวัสดี {welcomeName}</p>
      </header>

      {board.invoice ? (
        <>
          <input
            ref={slipInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file || !board.invoice) return;

              void submitSlip(board.invoice.id, board.tenant.id, file).then(
                (invoice) => {
                  if (!invoice) return;
                  patchInvoice(invoice);
                  void reload();
                },
              );
            }}
          />
          <InvoiceSkin
            invoice={board.invoice}
            tenantName={board.tenant.name}
            roomNumber={board.room.room_number}
            isPaying={paymentStatus === "uploading"}
            onPay={() => slipInputRef.current?.click()}
          />
          {paymentError && (
            <p className="px-6 pb-4 text-center text-sm text-red-600">
              {paymentError}
            </p>
          )}
          {paymentFeedback?.autoVerified && board.invoice.status === "paid" && (
            <p className="px-6 pb-4 text-center text-sm text-green-700">
              ตรวจสอบสลิปอัตโนมัติผ่านแล้ว
            </p>
          )}
          {(paymentFeedback?.message && !paymentFeedback.autoVerified) ||
          (board.invoice.slip_rejection_note && board.invoice.status === "pending") ? (
            <p className="px-6 pb-4 text-center text-sm text-red-600">
              {board.invoice.slip_rejection_note ?? paymentFeedback?.message}
            </p>
          ) : null}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <p className="text-sm text-zinc-600">ยังไม่มีบิลเดือนนี้</p>
          <p className="text-xs text-zinc-500">รอเจ้าของหอออกบิลให้</p>
        </div>
      )}
    </MobileFrame>
  );
}

export default function TenantBoardPage() {
  return (
    <Suspense fallback={<AuthLoading message="กำลังโหลด..." />}>
      <TenantBoardContent />
    </Suspense>
  );
}
