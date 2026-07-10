"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { TenantDocumentRow } from "@/services/documentVaultService";
import {
  canTenantSignContract,
  canTenantUploadDocuments,
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
    <section className="border-t border-zinc-200 px-6 py-4 space-y-4">
      {canUpload && (
        <div>
          <p className="text-xs font-medium text-zinc-700">{t("tenant.docVault.title")}</p>
          <div className="mt-2 flex gap-2">
            <select
              value={docType}
              disabled={disabled}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              className="min-h-11 flex-1 rounded-lg border border-zinc-200 px-3 text-xs"
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
              className="min-h-11 rounded-lg border border-zinc-200 px-4 text-xs font-medium"
            >
              {t("owner.docVault.upload")}
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
          <p className="text-xs font-medium text-zinc-700">{t("tenant.contract.signTitle")}</p>
          <canvas
            ref={canvasRef}
            width={280}
            height={120}
            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white touch-none"
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
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={clearCanvas}
              className="min-h-11 flex-1 rounded-lg border border-zinc-200 text-xs"
            >
              {t("tenant.contract.clear")}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => void submitSignature()}
              className="min-h-11 flex-1 rounded-lg bg-zinc-900 text-xs font-medium text-white disabled:opacity-50"
            >
              {t("tenant.contract.submitSign")}
            </button>
          </div>
        </div>
      )}

      {signed && (
        <p className="text-xs text-green-700">{t("tenant.contract.signed")}</p>
      )}

      {documents.length > 0 && (
        <ul className="space-y-1 text-xs text-zinc-600">
          {documents.map((doc) => (
            <li key={doc.id}>
              <a href={doc.public_url} target="_blank" rel="noopener noreferrer" className="underline">
                {doc.label ?? doc.doc_type}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
