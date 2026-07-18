import { createAdminClient } from "@/services/supabase/admin";

export async function fetchPropertyBentoContext(
  propertySlug: string,
  billingMonth: string,
): Promise<{ assetValue: number | null; monthlyExpenses: number }> {
  const supabase = createAdminClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, asset_value")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property) {
    return { assetValue: null, monthlyExpenses: 0 };
  }

  const [year, month] = billingMonth.split("-").map(Number);
  const startIso = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const endIso = new Date(Date.UTC(year, month, 1)).toISOString();

  const { data: tickets, error: ticketError } = await supabase
    .from("maintenance_tickets")
    .select("expense_amount")
    .eq("property_id", property.id)
    .gte("created_at", startIso)
    .lt("created_at", endIso);

  if (ticketError) throw ticketError;

  const monthlyExpenses = (tickets ?? []).reduce(
    (sum, row) => sum + Number(row.expense_amount ?? 0),
    0,
  );

  return {
    assetValue:
      property.asset_value != null ? Number(property.asset_value) : null,
    monthlyExpenses,
  };
}
