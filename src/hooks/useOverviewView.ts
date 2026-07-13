"use client";

import { useCallback, useEffect, useState } from "react";

export type OverviewView = "grid" | "pie" | "bar";

export const OVERVIEW_VIEW_STORAGE_KEY = "rentchill_overview_view";

const VALID_VIEWS: OverviewView[] = ["grid", "pie", "bar"];

function parseView(raw: string | null): OverviewView {
  if (raw && VALID_VIEWS.includes(raw as OverviewView)) {
    return raw as OverviewView;
  }
  return "grid";
}

export function useOverviewView() {
  const [view, setViewState] = useState<OverviewView>("grid");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setViewState(parseView(localStorage.getItem(OVERVIEW_VIEW_STORAGE_KEY)));
    setReady(true);
  }, []);

  const setView = useCallback((next: OverviewView) => {
    setViewState(next);
    localStorage.setItem(OVERVIEW_VIEW_STORAGE_KEY, next);
  }, []);

  return { view, setView, ready };
}
