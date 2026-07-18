"use client";

import { FileText, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { SwipeDocCardSkin } from "@/components/skins/minimal/SwipeDocCardSkin";
import type { MessageKey } from "@/services/i18n/messages";
import type { TenantDocumentRow } from "@/services/documentVaultService";
import {
  allowedDocumentTypes,
  canAccessDocuments,
  canUseDocumentVault,
  canUseStarterManualDocs,
  documentCountLimit,
  STARTER_MANUAL_DOC_LIMIT,
  type DocumentType,
} from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";

const DOC_LABEL_KEYS: Record<DocumentType, MessageKey> = {
  id_card: "owner.docVault.idCard",
  passport: "owner.docVault.passport",
  lease: "owner.docVault.lease",
  contract_signed: "owner.docVault.contractSigned",
  move_in: "owner.docVault.moveIn",
  move_out: "owner.docVault.moveOut",
  deposit_receipt: "owner.docVault.deposit",
};

function isImageMime(mime: string) {
  return mime.startsWith("image/");
}

interface DocumentVaultSkinProps {
  planTier: PlanTier;
  documents: TenantDocumentRow[];
  disabled?: boolean;
  busy?: boolean;
  error?: string | null;
  variant?: "section" | "tab";
  onUpload: (docType: DocumentType, file: File) => void;
  onDelete: (documentId: string) => void;
}

export function DocumentVaultSkin({
  planTier,
  documents,
  disabled,
  busy,
  error,
  variant = "tab",
  onUpload,
  onDelete,
}: DocumentVaultSkinProps) {
  const { t } = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<DocumentType>("id_card");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (!canAccessDocuments(planTier)) {
    return (
      <p className="text-sm text-zinc-500">
        {t("owner.docVault.upgradeHint")}{" "}
        <a href="/billing?plan=growth" className="font-medium text-rc-green-ink underline">
          {t("owner.upgrade.cta")}
        </a>
      </p>
    );
  }

  const starterManual = canUseStarterManualDocs(planTier);
  const types = allowedDocumentTypes(planTier);
  const docLimit = documentCountLimit(planTier);

  const labelFor = (doc: TenantDocumentRow) =>
    doc.label ?? t(DOC_LABEL_KEYS[doc.doc_type]);

  const openUpload = (type: DocumentType) => {
    setDocType(type);
    setPickerOpen(false);
    fileRef.current?.click();
  };

  const shareDoc = async (doc: TenantDocumentRow) => {
    const title = labelFor(doc);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url: doc.public_url });
        return;
      }
    } catch {
      // user cancelled or share failed
    }
    window.open(doc.public_url, "_blank", "noopener,noreferrer");
  };

  const onCardTap = (doc: TenantDocumentRow) => {
    if (isImageMime(doc.mime_type)) {
      setLightboxUrl(doc.public_url);
      return;
    }
    window.open(doc.public_url, "_blank", "noopener,noreferrer");
  };

  const grid = (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {documents.map((doc) => (
        <SwipeDocCardSkin
          key={doc.id}
          disabled={disabled || busy}
          deleteLabel={t("owner.docVault.delete")}
          shareLabel={t("owner.docVault.share")}
          onDelete={() => onDelete(doc.id)}
          onShare={() => void shareDoc(doc)}
        >
          <button
            type="button"
            onClick={() => onCardTap(doc)}
            className="flex w-full flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white text-left"
          >
            <div className="aspect-square w-full bg-zinc-50">
              {isImageMime(doc.mime_type) ? (
                <img
                  src={doc.public_url}
                  alt={labelFor(doc)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-2 text-zinc-500">
                  <FileText className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                  <span className="line-clamp-2 text-center text-xs font-medium">
                    PDF
                  </span>
                </div>
              )}
            </div>
            <p className="truncate px-2 py-2 text-sm font-medium text-zinc-800">
              {labelFor(doc)}
            </p>
          </button>
        </SwipeDocCardSkin>
      ))}
    </div>
  );

  const atLimit = docLimit !== null && documents.length >= docLimit;

  const body = (
    <div className="relative pb-20">
      {starterManual && (
        <p className="mb-3 text-sm text-zinc-500">
          {t("owner.docVault.starterHint", { limit: STARTER_MANUAL_DOC_LIMIT })}
          {!canUseDocumentVault(planTier) && (
            <>
              {" "}
              <a href="/billing?plan=growth" className="font-medium text-rc-green-ink underline">
                {t("owner.upgrade.cta")}
              </a>
            </>
          )}
        </p>
      )}
      {documents.length === 0 ? (
        <p className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
          {t("owner.docVault.emptyHint")}
        </p>
      ) : (
        grid
      )}

      <button
        type="button"
        disabled={disabled || busy || atLimit}
        aria-label={t("owner.docVault.upload")}
        onClick={() => setPickerOpen(true)}
        className="absolute bottom-4 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-rc-green text-white shadow-sm hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-6 w-6" strokeWidth={2} aria-hidden />
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onUpload(docType, file);
        }}
      />

      {pickerOpen && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-zinc-900/40 sm:items-center">
          <button
            type="button"
            aria-label={t("owner.rooms.close")}
            className="absolute inset-0"
            onClick={() => setPickerOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-t-xl border border-zinc-100 bg-white p-4 sm:rounded-xl">
            <p className="text-base font-semibold text-zinc-900">
              {t("owner.docVault.pickType")}
            </p>
            <ul className="mt-3 space-y-2">
              {types.map((type) => (
                <li key={type}>
                  <button
                    type="button"
                    disabled={disabled || busy}
                    onClick={() => openUpload(type)}
                    className="flex min-h-12 w-full items-center rounded-lg border border-zinc-100 bg-zinc-50 px-4 text-left text-base font-medium text-zinc-800 hover:bg-zinc-100 disabled:opacity-50"
                  >
                    {t(DOC_LABEL_KEYS[type])}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {lightboxUrl && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-900/90 p-4">
          <button
            type="button"
            aria-label={t("owner.rooms.close")}
            className="absolute inset-0"
            onClick={() => setLightboxUrl(null)}
          />
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
          <img
            src={lightboxUrl}
            alt=""
            className="relative z-10 max-h-[85vh] max-w-full rounded-lg object-contain"
          />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );

  if (variant === "section") {
    return body;
  }

  return body;
}
