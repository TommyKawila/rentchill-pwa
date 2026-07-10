"use client";

import { useCallback, useEffect, useState } from "react";
import { getInvoiceForTenantMonth } from "@/services/invoiceService";
import { getPropertyContactById } from "@/services/propertyContactService";
import {
  getRoomById,
  getTenantById,
  getTenantByLineUserId,
} from "@/services/tenantService";
import { fetchTenantMeterPhotos } from "@/services/meterPhotoClientService";
import {
  fetchTenantVaultDocuments,
  getPropertyVaultMeta,
} from "@/services/documentVaultClientService";
import type { MeterPhotoRow } from "@/services/meterPhotoService";
import type { TenantDocumentRow } from "@/services/documentVaultService";
import type { PlanTier } from "@/services/propertyQuotaService";
import type { Invoice, PropertyContact, Room, Tenant } from "@/services/types";

type BoardState = {
  tenant: Tenant;
  room: Room;
  invoice: Invoice | null;
  contact: PropertyContact | null;
  meterPhotos: MeterPhotoRow[];
  documents: TenantDocumentRow[];
  propertySlug: string;
  planTier: PlanTier;
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
  const [needsLink, setNeedsLink] = useState(false);
  const [board, setBoard] = useState<BoardState | null>(null);

  const loadBoard = useCallback(async () => {
    if (!tenantId && !lineUserId) {
      setIsLoading(false);
      setError("ไม่พบข้อมูลผู้ใช้");
      return;
    }

    setIsLoading(true);
    setError(null);
    setNeedsLink(false);

    try {
      const tenant = lineUserId
        ? await getTenantByLineUserId(lineUserId)
        : await getTenantById(tenantId!);

      if (!tenant) {
        setBoard(null);
        if (lineUserId) {
          setNeedsLink(true);
          setError(null);
        } else {
          setNeedsLink(false);
          setError("ไม่พบข้อมูลลูกบ้าน");
        }
        return;
      }

      setNeedsLink(false);

      const room = await getRoomById(tenant.room_id);
      if (!room) {
        setBoard(null);
        setError("ไม่พบข้อมูลห้องพัก");
        return;
      }

      const invoice = await getInvoiceForTenantMonth(tenant.id);
      const contact = await getPropertyContactById(room.property_id);
      const propertyMeta = await getPropertyVaultMeta(room.property_id);
      const meterPhotos =
        invoice && room.property_id
          ? await fetchTenantMeterPhotos({
              roomId: room.id,
              propertyId: room.property_id,
              billingMonth: invoice.billing_month,
            })
          : [];
      const documents = await fetchTenantVaultDocuments(tenant.id);
      setBoard({
        tenant,
        room,
        invoice,
        contact,
        meterPhotos,
        documents,
        propertySlug: propertyMeta?.slug ?? "",
        planTier: propertyMeta?.planTier ?? "starter",
      });
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
    needsLink,
    reload: loadBoard,
    patchInvoice,
  };
}
