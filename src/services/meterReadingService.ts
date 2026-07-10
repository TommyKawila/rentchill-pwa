import { createAdminClient } from "@/services/supabase/admin";
import {
  calculateFromDialReadings,
  getCurrentBillingMonth,
} from "@/services/invoiceCalculator";
import type { MeterKind, MeterReading, MeterReadingSource } from "@/services/types";

export type MeterDialSnapshot = {
  value: number;
  recorded_at: string;
  source: MeterReadingSource;
  billing_month: string | null;
};

export type RoomMeterContext = {
  water_prev: MeterDialSnapshot | null;
  electric_prev: MeterDialSnapshot | null;
};

function mapReading(row: Record<string, unknown>): MeterReading {
  return {
    id: String(row.id),
    property_id: String(row.property_id),
    room_id: String(row.room_id),
    tenant_id: row.tenant_id ? String(row.tenant_id) : null,
    kind: row.kind as MeterKind,
    reading_value: Number(row.reading_value),
    recorded_at: String(row.recorded_at),
    source: row.source as MeterReadingSource,
    billing_month: row.billing_month ? String(row.billing_month) : null,
    invoice_id: row.invoice_id ? String(row.invoice_id) : null,
    photo_media_id: row.photo_media_id ? String(row.photo_media_id) : null,
  };
}

export async function getLatestReading(
  roomId: string,
  kind: MeterKind,
  beforeBillingMonth?: string,
): Promise<MeterReading | null> {
  const supabase = createAdminClient();
  let query = supabase
    .from("meter_readings")
    .select("*")
    .eq("room_id", roomId)
    .eq("kind", kind)
    .order("recorded_at", { ascending: false })
    .limit(1);

  if (beforeBillingMonth) {
    query = query.or(
      `billing_month.is.null,billing_month.lt.${beforeBillingMonth}`,
    );
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? mapReading(data) : null;
}

export async function getRoomMeterContext(
  roomId: string,
  billingMonth = getCurrentBillingMonth(),
): Promise<RoomMeterContext> {
  const [water, electric] = await Promise.all([
    getLatestReading(roomId, "water", billingMonth),
    getLatestReading(roomId, "electric", billingMonth),
  ]);

  const toSnapshot = (reading: MeterReading | null): MeterDialSnapshot | null =>
    reading
      ? {
          value: reading.reading_value,
          recorded_at: reading.recorded_at,
          source: reading.source,
          billing_month: reading.billing_month,
        }
      : null;

  return {
    water_prev: toSnapshot(water),
    electric_prev: toSnapshot(electric),
  };
}

export async function getDraftBillingReadings(
  roomIds: string[],
  billingMonth: string,
) {
  if (roomIds.length === 0) return new Map<string, { water?: number; electric?: number }>();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("meter_readings")
    .select("room_id, kind, reading_value")
    .in("room_id", roomIds)
    .eq("billing_month", billingMonth)
    .eq("source", "billing")
    .is("invoice_id", null);

  if (error) throw error;

  const map = new Map<string, { water?: number; electric?: number }>();
  for (const row of data ?? []) {
    const roomId = String(row.room_id);
    const entry = map.get(roomId) ?? {};
    if (row.kind === "water") entry.water = Number(row.reading_value);
    if (row.kind === "electric") entry.electric = Number(row.reading_value);
    map.set(roomId, entry);
  }
  return map;
}

export async function createMoveInReadings(input: {
  propertyId: string;
  roomId: string;
  tenantId: string;
  waterReading: number;
  electricReading: number;
}) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const rows = [
    {
      property_id: input.propertyId,
      room_id: input.roomId,
      tenant_id: input.tenantId,
      kind: "water" as const,
      reading_value: input.waterReading,
      recorded_at: now,
      source: "move_in" as const,
      billing_month: null,
    },
    {
      property_id: input.propertyId,
      room_id: input.roomId,
      tenant_id: input.tenantId,
      kind: "electric" as const,
      reading_value: input.electricReading,
      recorded_at: now,
      source: "move_in" as const,
      billing_month: null,
    },
  ];

  const { error } = await supabase.from("meter_readings").insert(rows);
  if (error) throw error;
}

export async function upsertBillingReading(input: {
  propertyId: string;
  roomId: string;
  tenantId: string;
  kind: MeterKind;
  readingValue: number;
  billingMonth: string;
}) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: existing, error: readError } = await supabase
    .from("meter_readings")
    .select("id")
    .eq("room_id", input.roomId)
    .eq("kind", input.kind)
    .eq("billing_month", input.billingMonth)
    .eq("source", "billing")
    .is("invoice_id", null)
    .maybeSingle();

  if (readError) throw readError;

  if (existing) {
    const { error } = await supabase
      .from("meter_readings")
      .update({
        reading_value: input.readingValue,
        recorded_at: now,
        tenant_id: input.tenantId,
      })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("meter_readings").insert({
    property_id: input.propertyId,
    room_id: input.roomId,
    tenant_id: input.tenantId,
    kind: input.kind,
    reading_value: input.readingValue,
    recorded_at: now,
    source: "billing",
    billing_month: input.billingMonth,
  });
  if (error) throw error;
}

export async function linkBillingReadingsToInvoice(input: {
  roomId: string;
  billingMonth: string;
  invoiceId: string;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("meter_readings")
    .update({ invoice_id: input.invoiceId })
    .eq("room_id", input.roomId)
    .eq("billing_month", input.billingMonth)
    .eq("source", "billing");
  if (error) throw error;
}

export async function getMeterHistory(roomId: string, limit = 24) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("meter_readings")
    .select("*")
    .eq("room_id", roomId)
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapReading);
}

export type MeterHistoryMonthRow = {
  billing_month: string | null;
  label: string;
  water_prev: number | null;
  water_curr: number | null;
  water_units: number | null;
  electric_prev: number | null;
  electric_curr: number | null;
  electric_units: number | null;
  recorded_at: string | null;
  source: MeterReadingSource;
};

export function buildMeterHistoryRows(readings: MeterReading[]): MeterHistoryMonthRow[] {
  const sorted = [...readings].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
  );

  const waterReadings = sorted.filter((r) => r.kind === "water");
  const electricReadings = sorted.filter((r) => r.kind === "electric");

  const buildPairs = (list: MeterReading[]) => {
    const pairs: Array<{
      prev: number | null;
      curr: number;
      units: number | null;
      recorded_at: string;
      billing_month: string | null;
      source: MeterReadingSource;
    }> = [];

    for (let i = 0; i < list.length; i++) {
      const curr = list[i];
      const prev = i > 0 ? list[i - 1].reading_value : null;
      let units: number | null = null;
      if (prev != null && curr.source !== "move_in") {
        units = Math.round((curr.reading_value - prev) * 100) / 100;
      }
      pairs.push({
        prev,
        curr: curr.reading_value,
        units,
        recorded_at: curr.recorded_at,
        billing_month: curr.billing_month,
        source: curr.source,
      });
    }
    return pairs;
  };

  const waterPairs = buildPairs(waterReadings);
  const electricPairs = buildPairs(electricReadings);

  const keys = new Set<string>();
  for (const p of [...waterPairs, ...electricPairs]) {
    keys.add(p.billing_month ?? "move_in");
  }

  const rows: MeterHistoryMonthRow[] = [...keys]
    .sort((a, b) => {
      if (a === "move_in") return 1;
      if (b === "move_in") return -1;
      return b.localeCompare(a);
    })
    .map((key) => {
      const water = waterPairs.find(
        (p) => (p.billing_month ?? "move_in") === key,
      );
      const electric = electricPairs.find(
        (p) => (p.billing_month ?? "move_in") === key,
      );
      return {
        billing_month: key === "move_in" ? null : key,
        label: key,
        water_prev: water?.prev ?? null,
        water_curr: water?.curr ?? null,
        water_units: water?.units ?? null,
        electric_prev: electric?.prev ?? null,
        electric_curr: electric?.curr ?? null,
        electric_units: electric?.units ?? null,
        recorded_at: water?.recorded_at ?? electric?.recorded_at ?? null,
        source: water?.source ?? electric?.source ?? "billing",
      };
    });

  return rows;
}

export function computeDialBilling(input: {
  baseRent: number;
  waterPrev: number;
  waterCurr: number;
  electricPrev: number;
  electricCurr: number;
  waterRate: number;
  electricRate: number;
}) {
  return calculateFromDialReadings(
    input.baseRent,
    input.waterPrev,
    input.waterCurr,
    input.electricPrev,
    input.electricCurr,
    input.waterRate,
    input.electricRate,
  );
}
