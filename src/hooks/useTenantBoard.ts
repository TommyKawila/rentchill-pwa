"use client";

import { useCallback, useEffect, useState } from "react";
import { getInvoiceForTenantMonth } from "@/services/invoiceService";
import {
  getRoomById,
  getTenantById,
  getTenantByLineUserId,
} from "@/services/tenantService";
import type { Invoice, Room, Tenant } from "@/services/types";

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

  useEffect(() => {
    if (!enabled || board?.invoice?.status !== "scanning") return;

    const intervalId = window.setInterval(() => {
      void loadBoard();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [enabled, board?.invoice?.status, board?.invoice?.id, loadBoard]);

  useEffect(() => {
    if (!enabled) return;

    const onVisible = () => {
      if (document.visibilityState === "visible") void loadBoard();
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [enabled, loadBoard]);

  const patchInvoice = useCallback((invoice: Invoice) => {
    setBoard((prev) => (prev ? { ...prev, invoice } : prev));
  }, []);

  return {
    board,
    isLoading,
    error,
    reload: loadBoard,
    patchInvoice,
  };
}
