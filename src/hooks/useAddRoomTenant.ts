"use client";

import { useCallback, useState } from "react";
import type { AddRoomTenantResult, AddVacantRoomResult } from "@/services/roomTenantService";

export type AddRoomTenantForm = {
  mode: "tenant";
  room_number: string;
  base_rent_price: number;
  tenant_name: string;
  phone_number: string;
  move_in_date: string;
  water_reading: number;
  electric_reading: number;
};

export type AddVacantRoomForm = {
  mode: "vacant";
  room_number: string;
  base_rent_price: number;
};

export type AddRoomForm = AddRoomTenantForm | AddVacantRoomForm;

type AddStatus = "idle" | "saving" | "error";

export function useAddRoomTenant(propertySlug: string) {
  const [status, setStatus] = useState<AddStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(
    async (form: AddRoomForm) => {
      setStatus("saving");
      setError(null);

      try {
        const response = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            property_slug: propertySlug,
            vacant: form.mode === "vacant",
            room_number: form.room_number,
            base_rent_price: form.base_rent_price,
            ...(form.mode === "tenant"
              ? {
                  tenant_name: form.tenant_name,
                  phone_number: form.phone_number,
                  move_in_date: form.move_in_date,
                  water_reading: form.water_reading,
                  electric_reading: form.electric_reading,
                }
              : {}),
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          message?: string;
          vacant?: boolean;
          result?: AddRoomTenantResult | AddVacantRoomResult;
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
