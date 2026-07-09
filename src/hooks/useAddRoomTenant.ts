"use client";

import { useCallback, useState } from "react";
import type { AddRoomTenantResult } from "@/services/roomTenantService";

export type AddRoomTenantForm = {
  room_number: string;
  base_rent_price: number;
  tenant_name: string;
  phone_number: string;
};

type AddStatus = "idle" | "saving" | "error";

export function useAddRoomTenant(propertySlug: string) {
  const [status, setStatus] = useState<AddStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(
    async (form: AddRoomTenantForm) => {
      setStatus("saving");
      setError(null);

      try {
        const response = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            property_slug: propertySlug,
            ...form,
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          message?: string;
          result?: AddRoomTenantResult;
        };

        if (!response.ok || !payload.ok || !payload.result) {
          throw new Error(payload.message ?? payload.error ?? "เพิ่มห้องไม่สำเร็จ");
        }

        setStatus("idle");
        return payload.result;
      } catch (err) {
        setStatus("error");
        const message = err instanceof Error ? err.message : "เพิ่มห้องไม่สำเร็จ";
        setError(message);
        throw err;
      }
    },
    [propertySlug],
  );

  return { add, status, error };
}
