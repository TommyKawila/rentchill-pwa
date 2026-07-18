import { createAdminClient } from "@/services/supabase/admin";
import { auditInvoiceIssue } from "@/services/auditLogService";
import {
  calculateInvoiceAmounts,
  computeIssueAmounts,
  getCurrentBillingMonth,
  totalWithExtras,
} from "@/services/invoiceCalculator";
import { isMissingInvoiceExtraColumns } from "@/services/invoiceFields";
import { safeNotifyBillIssued } from "@/services/notificationService";
import type { InvoiceExtraItem } from "@/services/types";
import {
  DEFAULT_REMINDER_DAYS,
  buildReminderTimeline,
  normalizeReminderDaySettings,
  resolveReminderState,
  type ReminderTier,
  type ReminderTimeline,
} from "@/services/paymentReminderTier";
import { buildTenantInviteUrl } from "@/services/tenantLinkService";
import {
  computeDialBilling,
  getDraftBillingReadings,
  getRoomMeterContext,
  linkBillingReadingsToInvoice,
  upsertBillingReading,
} from "@/services/meterReadingService";
import type { PropertyBillingSettings } from "@/services/propertyBillingSettingsService";
import type { InvoiceStatus } from "@/services/types";
import type { MeterDialSnapshot } from "@/services/meterReadingService";

export type MonthlyBillingRow = {
  tenant_id: string;
  tenant_name: string;
  tenant_title_prefix: string | null;
  room_id: string;
  room_number: string;
  base_rent_price: number;
  move_in_date: string;
  invoice_id: string | null;
  invoice_status: InvoiceStatus | null;
  slip_rejection_note: string | null;
  slip_submitted_at: string | null;
  invoice_total_amount: number | null;
  water_unit: number | null;
  electric_unit: number | null;
  water_prev: MeterDialSnapshot | null;
  electric_prev: MeterDialSnapshot | null;
  water_curr: number | null;
  electric_curr: number | null;
  invite_code: string;
  line_linked: boolean;
  invite_url: string;
  issued_at: string | null;
  reminder_tier_sent: ReminderTier | null;
  reminder_recommended: ReminderTier | null;
  reminder_can_send: boolean;
  reminder_days_until_soft: number | null;
  reminder_timeline: ReminderTimeline | null;
};

export type BillingEntry = {
  tenant_id: string;
  room_id: string;
  water_curr?: number;
  electric_curr: number;
  water_flat_baht?: number;
  billing_month?: string;
  extra_items?: InvoiceExtraItem[];
  include_promptpay_qr?: boolean;
};

async function getPropertyContext(propertySlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, billing_day, meter_reminder_days_before, reminder_soft_days, reminder_firm_days, reminder_final_days, include_utilities, water_billing_mode, water_flat_baht, water_rate_per_unit, electric_rate_per_unit",
    )
    .eq("slug", propertySlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบหอพัก");

  const reminder = normalizeReminderDaySettings({
    soft: Number(data.reminder_soft_days ?? DEFAULT_REMINDER_DAYS.soft),
    firm: Number(data.reminder_firm_days ?? DEFAULT_REMINDER_DAYS.firm),
    final: Number(data.reminder_final_days ?? DEFAULT_REMINDER_DAYS.final),
  });

  const settings: PropertyBillingSettings = {
    billing_day: Number(data.billing_day ?? 1),
    meter_reminder_days_before: Number(data.meter_reminder_days_before ?? 3),
    reminder_soft_days: reminder.soft,
    reminder_firm_days: reminder.firm,
    reminder_final_days: reminder.final,
    include_utilities: data.include_utilities !== false,
    water_billing_mode:
      data.water_billing_mode === "meter" ? "meter" : "flat",
    water_flat_baht: Number(data.water_flat_baht ?? 0),
    water_rate_per_unit: Number(data.water_rate_per_unit ?? 10),
    electric_rate_per_unit: Number(data.electric_rate_per_unit ?? 7),
  };

  return { propertyId: String(data.id), settings };
}

export async function getMonthlyBillingRows(propertySlug: string) {
  const { propertyId, settings } = await getPropertyContext(propertySlug);
  const billingMonth = getCurrentBillingMonth();
  const supabase = createAdminClient();

  const { data: tenants, error } = await supabase
    .from("tenants")
    .select(
      "id, name, title_prefix, room_id, line_user_id, invite_code, move_in_date, rooms!inner(id, room_number, base_rent_price, status, property_id)",
    )
    .eq("rooms.property_id", propertyId)
    .eq("rooms.status", "occupied");

  if (error) throw error;

  const tenantIds = (tenants ?? []).map((row) => String(row.id));
  const roomIds = (tenants ?? []).map((row) => {
    const roomRaw = row.rooms as { id: string } | { id: string }[];
    const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
    return String(room.id);
  });

  const invoicesByTenant = new Map<
    string,
    {
      id: string;
      status: InvoiceStatus;
      total_amount: number;
      water_unit: number;
      electric_unit: number;
      water_prev: number | null;
      water_curr: number | null;
      electric_prev: number | null;
      electric_curr: number | null;
      issued_at: string | null;
      reminder_tier_sent: ReminderTier | null;
      slip_rejection_note: string | null;
      slip_submitted_at: string | null;
    }
  >();

  if (tenantIds.length > 0) {
    const { data: invoices, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        "id, tenant_id, status, total_amount, water_unit, electric_unit, water_prev, water_curr, electric_prev, electric_curr, issued_at, reminder_tier_sent, slip_rejection_note, slip_submitted_at",
      )
      .eq("billing_month", billingMonth)
      .in("tenant_id", tenantIds);

    if (invoiceError) throw invoiceError;

    for (const invoice of invoices ?? []) {
      const tierSent = invoice.reminder_tier_sent;
      invoicesByTenant.set(String(invoice.tenant_id), {
        id: String(invoice.id),
        status: invoice.status as InvoiceStatus,
        total_amount: Number(invoice.total_amount),
        water_unit: Number(invoice.water_unit),
        electric_unit: Number(invoice.electric_unit),
        water_prev:
          invoice.water_prev != null ? Number(invoice.water_prev) : null,
        water_curr:
          invoice.water_curr != null ? Number(invoice.water_curr) : null,
        electric_prev:
          invoice.electric_prev != null ? Number(invoice.electric_prev) : null,
        electric_curr:
          invoice.electric_curr != null ? Number(invoice.electric_curr) : null,
        issued_at: invoice.issued_at ? String(invoice.issued_at) : null,
        reminder_tier_sent:
          tierSent === "soft" || tierSent === "firm" || tierSent === "final"
            ? tierSent
            : null,
        slip_rejection_note: invoice.slip_rejection_note
          ? String(invoice.slip_rejection_note)
          : null,
        slip_submitted_at: invoice.slip_submitted_at
          ? String(invoice.slip_submitted_at)
          : null,
      });
    }
  }

  const draftReadings = await getDraftBillingReadings(roomIds, billingMonth);

  const rows: MonthlyBillingRow[] = await Promise.all(
    (tenants ?? []).map(async (row) => {
      const roomRaw = row.rooms as
        | { id: string; room_number: string; base_rent_price: number }
        | { id: string; room_number: string; base_rent_price: number }[];
      const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
      const invoice = invoicesByTenant.get(String(row.id));
      const meterContext = await getRoomMeterContext(room.id, billingMonth);
      const draft = draftReadings.get(room.id);

      const waterCurr =
        invoice?.water_curr ??
        draft?.water ??
        null;
      const electricCurr =
        invoice?.electric_curr ??
        draft?.electric ??
        null;

      return {
        tenant_id: String(row.id),
        tenant_name: String(row.name),
        tenant_title_prefix: row.title_prefix ? String(row.title_prefix) : null,
        room_id: room.id,
        room_number: room.room_number,
        base_rent_price: Number(room.base_rent_price),
        move_in_date: String(row.move_in_date),
        invoice_id: invoice?.id ?? null,
        invoice_status: invoice?.status ?? null,
        slip_rejection_note: invoice?.slip_rejection_note ?? null,
        slip_submitted_at: invoice?.slip_submitted_at ?? null,
        invoice_total_amount: invoice?.total_amount ?? null,
        water_unit: invoice ? invoice.water_unit : null,
        electric_unit: invoice ? invoice.electric_unit : null,
        water_prev: invoice?.water_prev != null
          ? {
              value: invoice.water_prev,
              recorded_at: meterContext.water_prev?.recorded_at ?? "",
              source: meterContext.water_prev?.source ?? "billing",
              billing_month: meterContext.water_prev?.billing_month ?? null,
            }
          : meterContext.water_prev,
        electric_prev: invoice?.electric_prev != null
          ? {
              value: invoice.electric_prev,
              recorded_at: meterContext.electric_prev?.recorded_at ?? "",
              source: meterContext.electric_prev?.source ?? "billing",
              billing_month: meterContext.electric_prev?.billing_month ?? null,
            }
          : meterContext.electric_prev,
        water_curr: waterCurr,
        electric_curr: electricCurr,
        invite_code: String(row.invite_code ?? ""),
        line_linked: Boolean(row.line_user_id),
        invite_url: row.invite_code
          ? buildTenantInviteUrl(String(row.invite_code))
          : "",
        issued_at: invoice?.issued_at ?? null,
        reminder_tier_sent: invoice?.reminder_tier_sent ?? null,
        ...(() => {
          const reminderSettings = {
            soft: settings.reminder_soft_days,
            firm: settings.reminder_firm_days,
            final: settings.reminder_final_days,
          };
          const state = resolveReminderState({
            billingMonth,
            billingDay: settings.billing_day,
            tierSent: invoice?.reminder_tier_sent ?? null,
            settings: reminderSettings,
          });
          const showTimeline =
            invoice?.status === "pending" && Boolean(row.line_user_id);
          const timeline = showTimeline
            ? buildReminderTimeline({
                billingMonth,
                billingDay: settings.billing_day,
                tierSent: invoice?.reminder_tier_sent ?? null,
                settings: reminderSettings,
              })
            : null;
          return {
            reminder_recommended: state.recommended,
            reminder_can_send: state.can_send,
            reminder_days_until_soft: state.days_until_soft,
            reminder_timeline: timeline,
          };
        })(),
      };
    }),
  );

  rows.sort((a, b) => a.room_number.localeCompare(b.room_number, "th"));

  return { billingMonth, rows, settings };
}

export async function generateMonthlyInvoices(
  propertySlug: string,
  entries: BillingEntry[],
  options?: { ownerId?: string; deferLineNotify?: boolean },
) {
  const { propertyId, settings } = await getPropertyContext(propertySlug);
  const supabase = createAdminClient();
  const recordedAt = new Date().toISOString();
  const resultBillingMonth =
    entries[0]?.billing_month ?? getCurrentBillingMonth();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const entry of entries) {
    const billingMonth = entry.billing_month ?? getCurrentBillingMonth();
    const extraItems = entry.extra_items ?? [];
    const includePromptPayQr = entry.include_promptpay_qr !== false;

    if (settings.include_utilities) {
      const usesFlatWater = entry.water_flat_baht !== undefined;
      if (usesFlatWater) {
        if (
          entry.electric_curr === undefined ||
          entry.electric_curr < 0 ||
          Number.isNaN(entry.electric_curr)
        ) {
          throw new Error("METER_REQUIRED");
        }
        if (
          entry.water_flat_baht! < 0 ||
          !Number.isFinite(entry.water_flat_baht)
        ) {
          throw new Error("METER_REQUIRED");
        }
      } else if (
        entry.water_curr === undefined ||
        entry.electric_curr === undefined ||
        entry.water_curr < 0 ||
        entry.electric_curr < 0 ||
        Number.isNaN(entry.water_curr) ||
        Number.isNaN(entry.electric_curr)
      ) {
        throw new Error("METER_REQUIRED");
      }
    }

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, line_user_id, room_id, rooms!inner(property_id, base_rent_price, room_number)")
      .eq("id", entry.tenant_id)
      .eq("rooms.property_id", propertyId)
      .maybeSingle();

    if (tenantError) throw tenantError;
    if (!tenant) continue;

    const roomRaw = tenant.rooms as
      | { base_rent_price: number; room_number: string }
      | { base_rent_price: number; room_number: string }[];
    const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
    const baseRent = Number(room.base_rent_price);
    const roomId = String(tenant.room_id);

    let waterUnit = 0;
    let electricUnit = 0;
    let amounts = calculateInvoiceAmounts(baseRent, 0, 0);
    let waterPrev: number | null = null;
    let waterCurr: number | null = null;
    let electricPrev: number | null = null;
    let electricCurr: number | null = null;

    if (settings.include_utilities) {
      const meterContext = await getRoomMeterContext(roomId, billingMonth);
      const usesFlatWater = entry.water_flat_baht !== undefined;

      if (usesFlatWater) {
        if (!meterContext.electric_prev) {
          throw new Error("BASELINE_REQUIRED");
        }

        electricPrev = meterContext.electric_prev.value;
        electricCurr = entry.electric_curr;
        waterPrev = meterContext.water_prev?.value ?? null;
        waterCurr = waterPrev;

        const computed = computeIssueAmounts({
          baseRent,
          waterFlatBaht: entry.water_flat_baht!,
          electricPrev,
          electricCurr,
          electricRate: settings.electric_rate_per_unit,
        });
        waterUnit = computed.water_unit;
        electricUnit = computed.electric_unit;
        amounts = {
          water_amount: computed.water_amount,
          electric_amount: computed.electric_amount,
          total_amount: totalWithExtras(computed.total_amount, extraItems),
        };

        await upsertBillingReading({
          propertyId,
          roomId,
          tenantId: entry.tenant_id,
          kind: "electric",
          readingValue: electricCurr,
          billingMonth,
        });
      } else {
        if (!meterContext.water_prev || !meterContext.electric_prev) {
          throw new Error("BASELINE_REQUIRED");
        }

        waterPrev = meterContext.water_prev.value;
        if (entry.water_curr === undefined) {
          throw new Error("METER_REQUIRED");
        }
        waterCurr = entry.water_curr;
        electricPrev = meterContext.electric_prev.value;
        electricCurr = entry.electric_curr;

        const computed = computeDialBilling({
          baseRent,
          waterPrev,
          waterCurr,
          electricPrev,
          electricCurr,
          waterRate: settings.water_rate_per_unit,
          electricRate: settings.electric_rate_per_unit,
        });
        waterUnit = computed.water_unit;
        electricUnit = computed.electric_unit;
        amounts = {
          ...computed,
          total_amount: totalWithExtras(computed.total_amount, extraItems),
        };

        await upsertBillingReading({
          propertyId,
          roomId,
          tenantId: entry.tenant_id,
          kind: "water",
          readingValue: waterCurr,
          billingMonth,
        });
        await upsertBillingReading({
          propertyId,
          roomId,
          tenantId: entry.tenant_id,
          kind: "electric",
          readingValue: electricCurr,
          billingMonth,
        });
      }
    } else {
      amounts = {
        ...amounts,
        total_amount: totalWithExtras(amounts.total_amount, extraItems),
      };
    }

    const { data: existing, error: existingError } = await supabase
      .from("invoices")
      .select("id, status")
      .eq("tenant_id", entry.tenant_id)
      .eq("billing_month", billingMonth)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      skipped++;
      continue;
    }

    const invoicePayload = {
      water_unit: waterUnit,
      electric_unit: electricUnit,
      water_prev: waterPrev,
      water_curr: waterCurr,
      electric_prev: electricPrev,
      electric_curr: electricCurr,
      water_recorded_at: settings.include_utilities ? recordedAt : null,
      electric_recorded_at: settings.include_utilities ? recordedAt : null,
      water_rate_locked: settings.include_utilities
        ? settings.water_rate_per_unit
        : null,
      electric_rate_locked: settings.include_utilities
        ? settings.electric_rate_per_unit
        : null,
      ...amounts,
    };

    const insertPayload = {
      property_id: propertyId,
      tenant_id: entry.tenant_id,
      room_id: tenant.room_id,
      billing_month: billingMonth,
      base_rent_amount: baseRent,
      status: "pending" as const,
      issued_at: new Date().toISOString(),
      extra_items: extraItems,
      include_promptpay_qr: includePromptPayQr,
      ...invoicePayload,
    };

    let insertedResult = await supabase
      .from("invoices")
      .insert(insertPayload)
      .select("id")
      .single();

    if (
      insertedResult.error &&
      isMissingInvoiceExtraColumns(insertedResult.error)
    ) {
      const { extra_items: _e, include_promptpay_qr: _q, ...legacyPayload } =
        insertPayload;
      insertedResult = await supabase
        .from("invoices")
        .insert(legacyPayload)
        .select("id")
        .single();
    }

    const { data: inserted, error } = insertedResult;

    if (error) throw error;
    if (inserted) {
      await linkBillingReadingsToInvoice({
        roomId,
        billingMonth,
        invoiceId: String(inserted.id),
      });
      if (options?.ownerId) {
        await auditInvoiceIssue({
          propertyId,
          roomId,
          tenantId: entry.tenant_id,
          ownerId: options.ownerId,
          billingMonth,
          totalAmount: amounts.total_amount,
          waterUnit: settings.include_utilities ? waterUnit : undefined,
          electricUnit: settings.include_utilities ? electricUnit : undefined,
        });
      }
    }
    created++;
    if (!options?.deferLineNotify) {
      void notifyBillIssued({
        propertySlug,
        lineUserId: tenant.line_user_id ? String(tenant.line_user_id) : null,
        roomNumber: room.room_number,
        billingMonth,
        totalAmount: amounts.total_amount,
        baseRentAmount: baseRent,
        waterAmount: amounts.water_amount,
        electricAmount: amounts.electric_amount,
        extraItems,
      });
    }
  }

  return { billingMonth: resultBillingMonth, created, updated, skipped };
}

async function notifyBillIssued(input: {
  propertySlug: string;
  lineUserId: string | null;
  roomNumber: string;
  billingMonth: string;
  totalAmount: number;
  baseRentAmount?: number;
  waterAmount?: number;
  electricAmount?: number;
  extraItems?: import("@/services/types").InvoiceExtraItem[];
}) {
  if (!input.lineUserId) return;
  await safeNotifyBillIssued({
    propertySlug: input.propertySlug,
    lineUserId: input.lineUserId,
    roomNumber: input.roomNumber,
    billingMonth: input.billingMonth,
    totalAmount: input.totalAmount,
    baseRentAmount: input.baseRentAmount,
    waterAmount: input.waterAmount,
    electricAmount: input.electricAmount,
    extraItems: input.extraItems,
  });
}
