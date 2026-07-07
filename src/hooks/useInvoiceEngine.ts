"use client";

import { useCallback, useState } from "react";
import type { Invoice, Room, Tenant } from "@/services/types";

type EngineStatus = "idle" | "calculating" | "success" | "error";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const getBillingMonth = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
};

export function useInvoiceEngine() {
  const [status, setStatus] = useState<EngineStatus>("idle");

  const generateInvoice = useCallback(
    async (
      tenant: Tenant,
      room: Room,
      currentWaterUnit: number,
      currentElectricUnit: number,
      waterRate: number,
      electricRate: number,
    ): Promise<Invoice | null> => {
      setStatus("calculating");

      try {
        const baseRentAmount = room.base_rent_price;
        const waterAmount = currentWaterUnit * waterRate;
        const electricAmount = currentElectricUnit * electricRate;
        const totalAmount = baseRentAmount + waterAmount + electricAmount;

        const invoice: Invoice = {
          id: crypto.randomUUID(),
          property_id: room.property_id,
          tenant_id: tenant.id,
          room_id: room.id,
          billing_month: getBillingMonth(),
          water_unit: currentWaterUnit,
          electric_unit: currentElectricUnit,
          base_rent_amount: baseRentAmount,
          water_amount: waterAmount,
          electric_amount: electricAmount,
          total_amount: totalAmount,
          status: "pending",
          slip_image_url: null,
          slip_rejection_note: null,
        };

        await delay(1000);

        setStatus("success");
        return invoice;
      } catch {
        setStatus("error");
        return null;
      }
    },
    [],
  );

  return { status, generateInvoice };
};
