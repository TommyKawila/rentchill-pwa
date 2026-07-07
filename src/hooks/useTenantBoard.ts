"use client";

import { useCallback, useEffect, useState } from "react";
import { useInvoiceEngine } from "@/hooks/useInvoiceEngine";
import { getInvoiceForTenantMonth, saveInvoice } from "@/services/invoiceService";
import {
  getRoomById,
  getTenantById,
  getTenantByLineUserId,
} from "@/services/tenantService";
import type { Invoice, Room, Tenant } from "@/services/types";

const WATER_RATE = 10;
const ELECTRIC_RATE = 7;
const DEMO_WATER_UNIT = 12;
const DEMO_ELECTRIC_UNIT = 85;

type BoardState = {
  tenant: Tenant;
  room: Room;
  invoice: Invoice | null;
};

type TenantIdentity = {
  enabled?: boolean;
  tenantId?: string | null;
  lineUserId?: string | null;
};

export function useTenantBoard({
  enabled = true,
  tenantId,
  lineUserId,
}: TenantIdentity) {
  const { status: engineStatus, generateInvoice } = useInvoiceEngine();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [board, setBoard] = useState<BoardState | null>(null);

  const loadBoard = useCallback(async () => {
    if (!tenantId && !lineUserId) {
      setIsLoading(false);
      setError("ไม่พบข้อมูลผู้ใช้");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tenant = lineUserId
        ? await getTenantByLineUserId(lineUserId)
        : await getTenantById(tenantId!);

      if (!tenant) {
        setBoard(null);
        setError(
          lineUserId
            ? "ไม่พบลูกบ้านที่ผูกกับ LINE นี้"
            : "ไม่พบข้อมูลลูกบ้าน",
        );
        return;
      }

      const room = await getRoomById(tenant.room_id);
      if (!room) {
        setBoard(null);
        setError("ไม่พบข้อมูลห้องพัก");
        return;
      }

      const invoice = await getInvoiceForTenantMonth(tenant.id);
      setBoard({ tenant, room, invoice });
    } catch {
      setBoard(null);
      setError("โหลดข้อมูลไม่สำเร็จ — ตรวจสอบการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, lineUserId]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    void loadBoard();
  }, [enabled, loadBoard]);

  const createBill = useCallback(async () => {
    if (!board) return;

    const invoice = await generateInvoice(
      board.tenant,
      board.room,
      DEMO_WATER_UNIT,
      DEMO_ELECTRIC_UNIT,
      WATER_RATE,
      ELECTRIC_RATE,
    );

    if (!invoice) {
      setError("สร้างบิลไม่สำเร็จ");
      return;
    }

    const saved = await saveInvoice(invoice);
    setBoard({ ...board, invoice: saved });
  }, [board, generateInvoice]);

  return {
    board,
    isLoading,
    error,
    engineStatus,
    reload: loadBoard,
    createBill,
  };
}
