"use client";

import { useCallback, useEffect, useState } from "react";
import type { TenantDocumentRow } from "@/services/documentVaultService";
import type { DocumentType } from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";
import { canUseDocumentVault } from "@/services/planLimits";

type DocStatus = "idle" | "loading" | "uploading" | "deleting" | "error";

export function useTenantDocuments(
  propertySlug: string,
  roomId: string,
  tenantId: string,
  planTier: PlanTier,
) {
  const [documents, setDocuments] = useState<TenantDocumentRow[]>([]);
  const [status, setStatus] = useState<DocStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertySlug || !roomId || !tenantId || !canUseDocumentVault(planTier)) {
      setDocuments([]);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(roomId)}/documents?tenant_id=${encodeURIComponent(tenantId)}`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        documents?: TenantDocumentRow[];
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "โหลดเอกสารไม่สำเร็จ");
      }

      setDocuments(payload.documents ?? []);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดเอกสารไม่สำเร็จ");
    }
  }, [propertySlug, roomId, tenantId, planTier]);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = useCallback(
    async (docType: DocumentType, file: File) => {
      setStatus("uploading");
      setError(null);

      try {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("doc_type", docType);
        formData.set("tenant_id", tenantId);

        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(roomId)}/documents`,
          { method: "POST", body: formData },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          document?: TenantDocumentRow;
        };

        if (!response.ok || !payload.ok || !payload.document) {
          throw new Error(payload.error ?? "อัปโหลดไม่สำเร็จ");
        }

        setDocuments((prev) => [payload.document!, ...prev]);
        setStatus("idle");
        return payload.document;
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
        return null;
      }
    },
    [propertySlug, roomId, tenantId],
  );

  const remove = useCallback(
    async (documentId: string) => {
      setStatus("deleting");
      setError(null);

      try {
        const params = new URLSearchParams({ tenant_id: tenantId });
        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(roomId)}/documents/${encodeURIComponent(documentId)}?${params}`,
          { method: "DELETE" },
        );
        const payload = (await response.json()) as { ok?: boolean; error?: string };

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "ลบไม่สำเร็จ");
        }

        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
        setStatus("idle");
        return true;
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
        return false;
      }
    },
    [propertySlug, roomId, tenantId],
  );

  return { documents, status, error, reload: load, upload, remove };
}
