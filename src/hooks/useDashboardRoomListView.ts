"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import {
  DASHBOARD_QUICK_FILTERS,
  ROOM_LIST_PAGE_SIZE,
  countByFilter,
  dashboardQuickCounts,
  dashboardQuickFilterFromHash,
  filterRoomRows,
  matchesVacantRoomQuery,
  roomFilterFromHash,
  type DashboardQuickFilter,
  type RoomListFilter,
  type RoomListFilterContext,
} from "@/services/roomListFilterService";
import type { VacantRoomRow } from "@/services/vacantRoomService";

function quickToRoomFilter(quick: DashboardQuickFilter): RoomListFilter {
  if (quick === "vacant") return "vacant";
  return quick;
}

export function useDashboardRoomListView<T extends MonthlyBillingRow>(
  rows: T[],
  vacantRooms: VacantRoomRow[],
  ctx: RoomListFilterContext,
  propertyName?: string,
  listHash?: string,
) {
  const [query, setQueryState] = useState("");
  const [filter, setFilterState] = useState<DashboardQuickFilter>("all");
  const [visibleCount, setVisibleCount] = useState(ROOM_LIST_PAGE_SIZE);

  const hashRoomFilter = useMemo(
    () => roomFilterFromHash(listHash ?? ""),
    [listHash],
  );

  const counts = useMemo(
    () => dashboardQuickCounts(rows, ctx, vacantRooms.length),
    [rows, ctx, vacantRooms.length],
  );

  useEffect(() => {
    setQueryState("");
    setFilterState(dashboardQuickFilterFromHash(listHash ?? "") ?? "all");
    setVisibleCount(ROOM_LIST_PAGE_SIZE);
  }, [rows, vacantRooms, listHash]);

  const roomFilter = hashRoomFilter ?? quickToRoomFilter(filter);

  const chipFilter = useMemo((): DashboardQuickFilter | null => {
    if (hashRoomFilter === "unpaid") return "unpaid";
    if (hashRoomFilter) return null;
    return filter;
  }, [hashRoomFilter, filter]);

  const filteredRows = useMemo(
    () =>
      filter === "vacant" && !hashRoomFilter
        ? []
        : filterRoomRows(rows, roomFilter, query, ctx, propertyName),
    [rows, roomFilter, filter, hashRoomFilter, query, ctx, propertyName],
  );

  const filteredVacant = useMemo(() => {
    if (hashRoomFilter) return [];
    if (filter !== "vacant" && filter !== "all") return [];
    const list =
      filter === "vacant"
        ? vacantRooms
        : filter === "all"
          ? []
          : vacantRooms;
    if (filter !== "vacant") return [];
    return vacantRooms.filter((room) =>
      matchesVacantRoomQuery(room.room_number, query, propertyName),
    );
  }, [filter, hashRoomFilter, vacantRooms, query, propertyName]);

  const visibleRows = useMemo(
    () => filteredRows.slice(0, visibleCount),
    [filteredRows, visibleCount],
  );

  const visibleVacant = useMemo(
    () => filteredVacant.slice(0, visibleCount),
    [filteredVacant, visibleCount],
  );

  const totalFiltered =
    filter === "vacant" && !hashRoomFilter
      ? filteredVacant.length
      : filteredRows.length;
  const hasMore =
    filter === "vacant" && !hashRoomFilter
      ? visibleVacant.length < filteredVacant.length
      : visibleCount < filteredRows.length;

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    setVisibleCount(ROOM_LIST_PAGE_SIZE);
  }, []);

  const setFilter = useCallback((value: DashboardQuickFilter) => {
    setFilterState(value);
    setVisibleCount(ROOM_LIST_PAGE_SIZE);
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ROOM_LIST_PAGE_SIZE);
  }, []);

  const clearFilters = useCallback(() => {
    setQueryState("");
    setFilterState("all");
    setVisibleCount(ROOM_LIST_PAGE_SIZE);
  }, []);

  return {
    query,
    filter,
    chipFilter,
    counts,
    fullCounts: countByFilter(rows, ctx),
    filteredRows,
    filteredVacant,
    visibleRows,
    visibleVacant,
    hasMore,
    totalFiltered,
    remaining: Math.max(
      0,
      totalFiltered -
        (filter === "vacant" ? visibleVacant.length : visibleRows.length),
    ),
    setQuery,
    setFilter,
    loadMore,
    clearFilters,
  };
}

export { DASHBOARD_QUICK_FILTERS };
