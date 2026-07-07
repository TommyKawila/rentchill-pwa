"use client";

import { useEffect, useRef, useState } from "react";
import { initLiff } from "@/services/liff/initLiff";

export type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
};

type LineAuthState = {
  isLoading: boolean;
  error: string | null;
  lineUserId: string | null;
  profile: LineProfile | null;
  isInClient: boolean;
  statusMessage: string;
};

const INIT_TIMEOUT_MS = 15_000;

function getLoginRedirectUri() {
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}`;
}

export function useLineAuth() {
  const startedRef = useRef(false);
  const [state, setState] = useState<LineAuthState>({
    isLoading: true,
    error: null,
    lineUserId: null,
    profile: null,
    isInClient: false,
    statusMessage: "Authenticating securely...",
  });

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      setState({
        isLoading: false,
        error: "Missing NEXT_PUBLIC_LIFF_ID",
        lineUserId: null,
        profile: null,
        isInClient: false,
        statusMessage: "",
      });
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(() => {
      if (cancelled) return;
      setState({
        isLoading: false,
        error: "LIFF init timeout — ลองปิดแล้วเปิดใหม่",
        lineUserId: null,
        profile: null,
        isInClient: false,
        statusMessage: "",
      });
    }, INIT_TIMEOUT_MS);

    void initLiff(liffId)
      .then(async (liff) => {
        if (cancelled) return;
        clearTimeout(timeout);

        const isInClient = liff.isInClient();

        if (!liff.isLoggedIn()) {
          setState((prev) => ({
            ...prev,
            statusMessage: "กำลังเข้าสู่ระบบ LINE...",
          }));
          liff.login({ redirectUri: getLoginRedirectUri() });
          return;
        }

        const profile = await liff.getProfile();
        if (cancelled) return;

        setState({
          isLoading: false,
          error: null,
          lineUserId: profile.userId,
          profile,
          isInClient,
          statusMessage: "",
        });
      })
      .catch((err) => {
        if (cancelled) return;
        clearTimeout(timeout);

        setState({
          isLoading: false,
          error: err instanceof Error ? err.message : "LIFF init failed",
          lineUserId: null,
          profile: null,
          isInClient: false,
          statusMessage: "",
        });
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  return state;
}
