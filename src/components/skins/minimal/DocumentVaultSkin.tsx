"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { RoomDetailSectionRow } from "@/components/skins/minimal/RoomDetailSectionRow";
import { RoomDetailSubModalShell } from "@/components/skins/minimal/RoomDetailSubModalShell";
import type { MessageKey } from "@/services/i18n/messages";
import type { TenantDocumentRow } from "@/services/documentVaultService";
import {
  allowedDocumentTypes,
  canUseDocumentVault,
  type DocumentType,
} from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";

interface DocumentVaultSkinProps {
  planTier: PlanTier;
  documents: TenantDocumentRow[];
  disabled?: boolean;
  busy?: boolean;
  error?: string | null;
  onUpload: (docType: DocumentType, file: File) => void;
  onDelete: (documentId: string) => void;
}

const DOC_LABEL_KEYS: Record<DocumentType, MessageKey> = {
  id_card: "owner.docVault.idCard",
  passport: "owner.docVault.passport",
  lease: "owner.docVault.lease",
  contract_signed: "owner.docVault.contractSigned",
  move_in: "owner.docVault.moveIn",
  move_out: "owner.docVault.moveOut",
  deposit_receipt: "owner.docVault.deposit",
};

export function DocumentVaultSkin({
  planTier,
  documents,
  disabled,
  busy,
  error,
  onUpload,
  onDelete,
}: DocumentVaultSkinProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<DocumentType>("id_card");

  if (!canUseDocumentVault(planTier)) {
    return (
      <p className="text-sm text-zinc-500">{t("owner.docVault.upgradeHint")}</p>
    );
  }

  const types = allowedDocumentTypes(planTier);
  const summary =
    documents.length > 0
      ? t("owner.docVault.summary", { count: String(documents.length) })
      : t("owner.docVault.summaryEmpty");

  return (
    <>
      <RoomDetailSectionRow
        title={t("owner.docVault.title")}
        summary={summary}
        disabled={disabled}
        onOpen={() => setOpen(true)}
      />

      {open && (
        <RoomDetailSubModalShell
          title={t("owner.docVault.title")}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <select
                value={docType}
                disabled={disabled || busy}
                onChange={(event) => setDocType(event.target.value as DocumentType)}
                className="min-h-12 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-base"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {t(DOC_LABEL_KEYS[type])}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={disabled || busy}
                onClick={() => fileRef.current?.click()}
                className="min-h-12 rounded-lg border border-zinc-200 bg-white px-4 text-base font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? t("common.saving") : t("owner.docVault.upload")}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) onUpload(docType, file);
                }}
              />
            </div>

            {documents.length > 0 && (
              <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-white">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex min-h-12 items-center justify-between gap-3 px-4 py-2 text-base"
                  >
                    <a
                      href={doc.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-zinc-800 hover:underline"
                    >
                      {doc.label ?? t(DOC_LABEL_KEYS[doc.doc_type])}
                    </a>
                    <button
                      type="button"
                      disabled={disabled || busy}
                      onClick={() => onDelete(doc.id)}
                      className="inline-flex min-h-12 shrink-0 items-center text-sm text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {t("owner.docVault.delete")}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </RoomDetailSubModalShell>
      )}
    </>
  );
}
