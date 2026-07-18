import { createAdminClient } from "@/services/supabase/admin";
import { listOwnerProperties } from "@/services/ownerPropertyService";
import type { MaintenanceTicketCategory } from "@/services/types";

export type AnalyticsTimeframe = "this_year" | "last_year" | "last_3_months";

export type AnalyticsSummary = {
  grossRevenue: number;
  totalExpenses: number;
  netProfit: number;
  occupancyRate: number;
};

export type AnalyticsMonthlyRow = {
  month: string;
  revenue: number;
  expense: number;
};

export type AnalyticsTopRoom = {
  propertySlug: string;
  propertyName: string;
  roomId: string;
  roomNumber: string;
  revenue: number;
  expense: number;
  netProfit: number;
};

export type AnalyticsExpenseCategory = {
  category: MaintenanceTicketCategory;
  amount: number;
  pct: number;
};

export type AnalyticsFilterRoom = {
  id: string;
  room_number: string;
};

export type AnalyticsReport = {
  timeframe: AnalyticsTimeframe;
  summary: AnalyticsSummary;
  monthly: AnalyticsMonthlyRow[];
  topRooms: AnalyticsTopRoom[];
  expenseByCategory: AnalyticsExpenseCategory[];
  filterRooms: AnalyticsFilterRoom[];
};

type RangeMeta = {
  months: string[];
  startIso: string;
  endIso: string;
};

function getRange(timeframe: AnalyticsTimeframe): RangeMeta {
  const now = new Date();
  const year = now.getFullYear();

  if (timeframe === "this_year") {
    const months = Array.from({ length: 12 }, (_, i) =>
      `${year}-${String(i + 1).padStart(2, "0")}`,
    );
    return {
      months,
      startIso: `${year}-01-01T00:00:00.000Z`,
      endIso: `${year + 1}-01-01T00:00:00.000Z`,
    };
  }

  if (timeframe === "last_year") {
    const y = year - 1;
    const months = Array.from({ length: 12 }, (_, i) =>
      `${y}-${String(i + 1).padStart(2, "0")}`,
    );
    return {
      months,
      startIso: `${y}-01-01T00:00:00.000Z`,
      endIso: `${year}-01-01T00:00:00.000Z`,
    };
  }

  const months: string[] = [];
  for (let i = 2; i >= 0; i -= 1) {
    const d = new Date(year, now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const [fy, fm] = months[0].split("-").map(Number);
  const end = new Date(year, now.getMonth() + 1, 1);

  return {
    months,
    startIso: new Date(fy, fm - 1, 1).toISOString(),
    endIso: end.toISOString(),
  };
}

async function resolvePropertyIds(ownerId: string, propertySlug?: string | null) {
  const properties = await listOwnerProperties(ownerId);
  if (!propertySlug || propertySlug === "portfolio") {
    return { properties, propertyIds: properties.map((p) => p.id) };
  }
  const match = properties.find((p) => p.slug === propertySlug);
  if (!match) throw new Error("ไม่พบหอพัก");
  return { properties: [match], propertyIds: [match.id] };
}

function monthFromIso(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getAnalyticsReport(input: {
  ownerId: string;
  timeframe: AnalyticsTimeframe;
  propertySlug?: string | null;
  roomId?: string | null;
}): Promise<AnalyticsReport> {
  const range = getRange(input.timeframe);
  const { properties, propertyIds } = await resolvePropertyIds(
    input.ownerId,
    input.propertySlug,
  );

  if (propertyIds.length === 0) {
    return {
      timeframe: input.timeframe,
      summary: {
        grossRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        occupancyRate: 0,
      },
      monthly: range.months.map((month) => ({ month, revenue: 0, expense: 0 })),
      topRooms: [],
      expenseByCategory: [],
      filterRooms: [],
    };
  }

  const supabase = createAdminClient();
  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  let invoiceQuery = supabase
    .from("invoices")
    .select(
      "total_amount, billing_month, room_id, property_id, rooms(room_number), properties(slug, name)",
    )
    .eq("status", "paid")
    .in("property_id", propertyIds)
    .in("billing_month", range.months);

  if (input.roomId) invoiceQuery = invoiceQuery.eq("room_id", input.roomId);

  let expenseQuery = supabase
    .from("maintenance_tickets")
    .select(
      "expense_amount, category, created_at, room_id, property_id, rooms(room_number), properties(slug, name)",
    )
    .in("property_id", propertyIds)
    .not("expense_amount", "is", null)
    .gte("created_at", range.startIso)
    .lt("created_at", range.endIso);

  if (input.roomId) expenseQuery = expenseQuery.eq("room_id", input.roomId);

  let roomsQuery = supabase
    .from("rooms")
    .select("id, room_number, status, property_id")
    .in("property_id", propertyIds)
    .order("room_number");

  if (input.propertySlug && input.propertySlug !== "portfolio") {
    roomsQuery = roomsQuery.eq("property_id", propertyIds[0]);
  }

  const [{ data: invoices, error: invError }, { data: expenses, error: expError }, { data: rooms, error: roomError }] =
    await Promise.all([invoiceQuery, expenseQuery, roomsQuery]);

  if (invError) throw invError;
  if (expError) throw expError;
  if (roomError) throw roomError;

  const revenueByMonth = new Map<string, number>();
  const expenseByMonth = new Map<string, number>();
  for (const m of range.months) {
    revenueByMonth.set(m, 0);
    expenseByMonth.set(m, 0);
  }

  type RoomAgg = {
    propertySlug: string;
    propertyName: string;
    roomId: string;
    roomNumber: string;
    revenue: number;
    expense: number;
  };
  const roomAgg = new Map<string, RoomAgg>();

  const ensureRoom = (
    roomId: string,
    roomNumber: string,
    propertyId: string,
    propertySlug: string,
    propertyName: string,
  ) => {
    if (!roomAgg.has(roomId)) {
      roomAgg.set(roomId, {
        propertySlug,
        propertyName,
        roomId,
        roomNumber,
        revenue: 0,
        expense: 0,
      });
    }
    return roomAgg.get(roomId)!;
  };

  let grossRevenue = 0;
  for (const row of invoices ?? []) {
    const amount = Number(row.total_amount);
    if (!Number.isFinite(amount)) continue;
    const month = String(row.billing_month);
    grossRevenue += amount;
    revenueByMonth.set(month, (revenueByMonth.get(month) ?? 0) + amount);

    const roomRaw = row.rooms as { room_number: string } | { room_number: string }[] | null;
    const propRaw = row.properties as
      | { slug: string; name: string }
      | { slug: string; name: string }[]
      | null;
    const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
    const prop = Array.isArray(propRaw) ? propRaw[0] : propRaw;
    const propertyId = String(row.property_id);
    const fallback = propertyMap.get(propertyId);

    const agg = ensureRoom(
      String(row.room_id),
      room?.room_number ?? "-",
      propertyId,
      prop?.slug ?? fallback?.slug ?? "",
      prop?.name ?? fallback?.name ?? "",
    );
    agg.revenue += amount;
  }

  const categoryTotals = new Map<MaintenanceTicketCategory, number>();
  let totalExpenses = 0;

  for (const row of expenses ?? []) {
    const amount = Number(row.expense_amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    totalExpenses += amount;
    const month = monthFromIso(String(row.created_at));
    expenseByMonth.set(month, (expenseByMonth.get(month) ?? 0) + amount);

    const category = row.category as MaintenanceTicketCategory;
    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + amount);

    const roomRaw = row.rooms as { room_number: string } | { room_number: string }[] | null;
    const propRaw = row.properties as
      | { slug: string; name: string }
      | { slug: string; name: string }[]
      | null;
    const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
    const prop = Array.isArray(propRaw) ? propRaw[0] : propRaw;
    const propertyId = String(row.property_id);
    const fallback = propertyMap.get(propertyId);

    const agg = ensureRoom(
      String(row.room_id),
      room?.room_number ?? "-",
      propertyId,
      prop?.slug ?? fallback?.slug ?? "",
      prop?.name ?? fallback?.name ?? "",
    );
    agg.expense += amount;
  }

  const totalRooms = (rooms ?? []).length;
  const occupiedRooms = (rooms ?? []).filter((r) => r.status === "occupied").length;
  const occupancyRate =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const monthly = range.months.map((month) => ({
    month,
    revenue: revenueByMonth.get(month) ?? 0,
    expense: expenseByMonth.get(month) ?? 0,
  }));

  const topRooms = [...roomAgg.values()]
    .map((r) => ({ ...r, netProfit: r.revenue - r.expense }))
    .sort((a, b) => b.netProfit - a.netProfit)
    .slice(0, 8);

  const expenseByCategory = [...categoryTotals.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      pct: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const filterRooms =
    input.propertySlug && input.propertySlug !== "portfolio"
      ? (rooms ?? []).map((r) => ({
          id: String(r.id),
          room_number: String(r.room_number),
        }))
      : [];

  return {
    timeframe: input.timeframe,
    summary: {
      grossRevenue,
      totalExpenses,
      netProfit: grossRevenue - totalExpenses,
      occupancyRate,
    },
    monthly,
    topRooms,
    expenseByCategory,
    filterRooms,
  };
}
