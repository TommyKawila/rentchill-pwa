import { createBrowserClient } from "@/services/supabase/client";
import type { PlanTier } from "@/services/propertyQuotaService";
import type { TenantDocumentRow } from "@/services/documentVaultService";

function mapDoc(row: Record<string, unknown>): TenantDocumentRow {
  return {
    id: String(row.id),
    doc_type: row.doc_type as TenantDocumentRow["doc_type"],
    label: row.label ? String(row.label) : null,
    public_url: String(row.public_url),
    mime_type: String(row.mime_type),
    uploaded_by: row.uploaded_by as "owner" | "tenant",
    created_at: String(row.created_at),
  };
}

export async function getPropertyVaultMeta(propertyId: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("properties")
    .select("slug, plan_tier")
    .eq("id", propertyId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    slug: String(data.slug),
    planTier: String(data.plan_tier) as PlanTier,
  };
}

export async function fetchTenantVaultDocuments(tenantId: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("tenant_documents")
    .select("id, doc_type, label, public_url, mime_type, uploaded_by, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapDoc);
}
