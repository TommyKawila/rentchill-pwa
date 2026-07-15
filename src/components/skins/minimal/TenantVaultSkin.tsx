"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { TenantDocumentRow } from "@/services/documentVaultService";
import {
  TENANT_UPLOAD_DOC_TYPES,
  type DocumentType,
} from "@/services/planLimits";

interface TenantVaultSkinProps {
  documents: TenantDocumentRow[];
  canUpload: boolean;
  canSign: boolean;
  hasLease: boolean;
  signed: boolean;
  disabled?: boolean;
  onUpload: (docType: DocumentType, file: File) => void;
  onSign: (file: File) => void;
}

export function TenantVaultSkin({
  documents,
  canUpload,
  canSign,
  hasLease,
  signed,
  disabled,
  onUpload,
  onSign,
}: TenantVaultSkinProps) {
  const { t } = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [docType, setDocType] = useState<DocumentType>("id_card");
  const [drawing, setDrawing] = useState(false);

  if (!canUpload && !canSign) return null;

  const startDraw = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#18181b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const moveDraw = (x: number, y: number) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const pointerPos = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const submitSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) return;
    onSign(new File([blob], "signature.png", { type: "image/png" }));
    clearCanvas();
  };

  return (
    <section className="space-y-4 border-t border-zinc-100 px-6 py-4">
      {canUpload && (
        <div>
          <p className="text-sm font-medium text-zinc-900">{t("tenant.docVault.title")}</p>
          <div className="mt-3 flex gap-3">
            <select
              value={docType}
              disabled={disabled}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              className="min-h-12 flex-1 rounded-lg border border-zinc-200 px-3 text-base"
            >
              {TENANT_UPLOAD_DOC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === "id_card"
                    ? t("owner.docVault.idCard")
                    : t("owner.docVault.passport")}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileRef.current?.click()}
              className="min-h-12 rounded-lg border border-zinc-200 px-4 text-base font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {disabled ? t("common.saving") : t("owner.docVault.upload")}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) onUpload(docType, file);
              }}
            />
          </div>
        </div>
      )}

      {canSign && hasLease && !signed && (
        <div>
          <p className="text-sm font-medium text-zinc-900">{t("tenant.contract.signTitle")}</p>
          <canvas
            ref={canvasRef}
            width={280}
            height={120}
            className="mt-3 w-full rounded-lg border border-zinc-200 bg-white touch-none"
            onPointerDown={(e) => {
              const { x, y } = pointerPos(e);
              startDraw(x, y);
            }}
            onPointerMove={(e) => {
              const { x, y } = pointerPos(e);
              moveDraw(x, y);
            }}
            onPointerUp={() => setDrawing(false)}
            onPointerLeave={() => setDrawing(false)}
          />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={clearCanvas}
              className="flex min-h-12 flex-1 items-center justify-center rounded-lg border border-zinc-200 text-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("tenant.contract.clear")}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => void submitSignature()}
              className="flex min-h-14 flex-1 items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {disabled ? t("common.saving") : t("tenant.contract.submitSign")}
            </button>
          </div>
        </div>
      )}

      {signed && (
        <p className="text-sm text-green-600">{t("tenant.contract.signed")}</p>
      )}

      {documents.length > 0 && (
        <ul className="space-y-2 text-base text-zinc-600">
          {documents.map((doc) => (
            <li key={doc.id}>
              <a
                href={doc.public_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center underline"
              >
                {doc.label ?? doc.doc_type}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
