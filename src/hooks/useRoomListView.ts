"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import {
  ROOM_LIST_PAGE_SIZE,
  countByFilter,
  defaultRoomListFilter,
  filterRoomRows,
  type RoomListFilter,
  type RoomListFilterContext,
} from "@/services/roomListFilterService";

export function useRoomListView<T extends MonthlyBillingRow>(
  rows: T[],
  ctx: RoomListFilterContext,
) {
  const [query, setQueryState] = useState("");
  const [filter, setFilterState] = useState<RoomListFilter>("all");
  const [visibleCount, setVisibleCount] = useState(ROOM_LIST_PAGE_SIZE);
  const [filterInitialized, setFilterInitialized] = useState(false);

  const counts = useMemo(() => countByFilter(rows, ctx), [rows, ctx]);

  useEffect(() => {
    if (filterInitialized) return;
    if (rows.length === 0) return;
    setFilterState(defaultRoomListFilter(counts));
    setFilterInitialized(true);
  }, [rows.length, counts, filterInitialized]);

  useEffect(() => {
    setFilterInitialized(false);
    setQueryState("");
    setVisibleCount(ROOM_LIST_PAGE_SIZE);
  }, [rows]);

  const filteredRows = useMemo(
    () => filterRoomRows(rows, filter, query, ctx),
    [rows, filter, query, ctx],
  );

  const visibleRows = useMemo(
    () => filteredRows.slice(0, visibleCount),
    [filteredRows, visibleCount],
  );

  const hasMore = visibleCount < filteredRows.length;

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    setVisibleCount(ROOM_LIST_PAGE_SIZE);
  }, []);

  const setFilter = useCallback((value: RoomListFilter) => {
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
    counts,
    filteredRows,
    visibleRows,
    hasMore,
    remaining: Math.max(0, filteredRows.length - visibleRows.length),
    setQuery,
    setFilter,
    loadMore,
    clearFilters,
  };
}
