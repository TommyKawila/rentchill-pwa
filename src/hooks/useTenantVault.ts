"use client";

import { useCallback, useState } from "react";
import type { TenantDocumentRow } from "@/services/documentVaultService";
import type { DocumentType } from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";

type TenantVaultStatus = "idle" | "uploading" | "signing" | "error";

export function useTenantVault(input: {
  tenantId: string;
  propertySlug: string;
  roomId: string;
  planTier: PlanTier;
  enabled: boolean;
}) {
  const [status, setStatus] = useState<TenantVaultStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (docType: DocumentType, file: File) => {
      setStatus("uploading");
      setError(null);
      try {
        const formData = new FormData();
        formData.set("action", "upload");
        formData.set("tenant_id", input.tenantId);
        formData.set("property_slug", input.propertySlug);
        formData.set("room_id", input.roomId);
        formData.set("doc_type", docType);
        formData.set("file", file);

        const response = await fetch("/api/tenant/documents", {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          document?: TenantDocumentRow;
        };
        if (!response.ok || !payload.ok || !payload.document) {
          throw new Error(payload.error ?? "อัปโหลดไม่สำเร็จ");
        }
        setStatus("idle");
        return payload.document;
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
        return null;
      }
    },
    [input.tenantId, input.propertySlug, input.roomId],
  );

  const sign = useCallback(
    async (file: File) => {
      setStatus("signing");
      setError(null);
      try {
        const formData = new FormData();
        formData.set("action", "sign");
        formData.set("tenant_id", input.tenantId);
        formData.set("file", file);

        const response = await fetch("/api/tenant/documents", {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as { ok?: boolean; error?: string };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "เซ็นสัญญาไม่สำเร็จ");
        }
        setStatus("idle");
        return true;
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "เซ็นสัญญาไม่สำเร็จ");
        return null;
      }
    },
    [input.tenantId],
  );

  return {
    status,
    error,
    upload: input.enabled ? upload : async () => null,
    sign: input.enabled ? sign : async () => null,
  };
}
