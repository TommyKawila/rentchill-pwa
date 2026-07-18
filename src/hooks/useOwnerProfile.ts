"use client";

import { useCallback, useEffect, useState } from "react";
import type { OwnerProfile } from "@/services/ownerProfileService";

type ProfileStatus = "idle" | "loading" | "error";

export function useOwnerProfile() {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [status, setStatus] = useState<ProfileStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/owner/profile");
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        profile?: OwnerProfile;
      };

      if (!response.ok || !payload.ok || !payload.profile) {
        throw new Error(payload.error ?? "โหลดโปรไฟล์ไม่สำเร็จ");
      }

      setProfile(payload.profile);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดโปรไฟล์ไม่สำเร็จ");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { profile, status, error, reload: load };
}
