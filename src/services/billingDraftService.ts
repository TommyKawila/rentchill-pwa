export async function saveBillingDraft(input: {
  propertySlug: string;
  roomId: string;
  tenantId: string;
  billingMonth: string;
  water: number;
  electric: number;
}) {
  const response = await fetch(
    `/api/properties/${encodeURIComponent(input.propertySlug)}/rooms/${encodeURIComponent(input.roomId)}/meter-readings`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: input.tenantId,
        billing_month: input.billingMonth,
        water_reading: input.water,
        electric_reading: input.electric,
      }),
    },
  );

  const payload = (await response.json()) as { ok?: boolean; error?: string };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? "บันทึกมิเตอร์ไม่สำเร็จ");
  }
}
