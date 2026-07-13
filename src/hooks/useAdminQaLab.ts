"use client";

import { useCallback, useEffect, useState } from "react";
import type { PlanTier } from "@/services/propertyQuotaService";
import type { LinePushType } from "@/services/linePushQuotaService";
import type { LinePushMode } from "@/services/line/linePushMode";
import type {
  SeedLineMode,
  SeedMode,
  SeedStatusMix,
} from "@/services/devPropertySeedService";

export type QaOwnerSnapshot = {
  owner_id: string;
  email: string;
  plan_tier: string;
  status: string;
  expires_at: string | null;
  room_count: number;
  properties: Array<{ id: string; slug: string; name: string }>;
};

export type QaLineLog = {
  id: string;
  message_type: string;
  line_user_id: string;
  charged: boolean;
  simulated: boolean;
  created_at: string;
  property_slug: string | null;
  property_name: string | null;
};

type ApiError = { error?: string };

export function useAdminQaLab() {
  const [ownerEmail, setOwnerEmail] = useState("");
  const [snapshot, setSnapshot] = useState<QaOwnerSnapshot | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  const [planTier, setPlanTier] = useState<PlanTier>("pro");
  const [planLoading, setPlanLoading] = useState(false);
  const [planMessage, setPlanMessage] = useState<string | null>(null);

  const [propertySlug, setPropertySlug] = useState("");
  const [roomCount, setRoomCount] = useState(20);
  const [seedMode, setSeedMode] = useState<SeedMode>("replace");
  const [lineMode, setLineMode] = useState<SeedLineMode>("synthetic");
  const [statusMix, setStatusMix] = useState<SeedStatusMix>("mixed");
  const [withMeters, setWithMeters] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const [pushMode, setPushMode] = useState<LinePushMode>("dry_run");
  const [testRecipientId, setTestRecipientId] = useState<string | null>(null);
  const [lineTypes, setLineTypes] = useState<LinePushType[]>([]);
  const [previewType, setPreviewType] = useState<LinePushType>("bill_issued");
  const [previewText, setPreviewText] = useState("");
  const [logs, setLogs] = useState<QaLineLog[]>([]);
  const [lineLoading, setLineLoading] = useState(true);
  const [lineError, setLineError] = useState<string | null>(null);

  const [testLineUserId, setTestLineUserId] = useState("U_DEV_TEST");
  const [testPushLoading, setTestPushLoading] = useState(false);
  const [testPushMessage, setTestPushMessage] = useState<string | null>(null);

  const loadSnapshot = useCallback(async (email: string) => {
    const normalized = email.trim();
    if (!normalized) return;
    setSnapshotLoading(true);
    setSnapshotError(null);
    try {
      const res = await fetch(
        `/api/admin/dev/override-plan?email=${encodeURIComponent(normalized)}`,
      );
      const data = (await res.json()) as { snapshot?: QaOwnerSnapshot } & ApiError;
      if (!res.ok) throw new Error(data.error ?? "LOAD_FAILED");
      setSnapshot(data.snapshot ?? null);
      const firstSlug = data.snapshot?.properties[0]?.slug;
      if (firstSlug) setPropertySlug(firstSlug);
      if (data.snapshot?.plan_tier) {
        setPlanTier(data.snapshot.plan_tier as PlanTier);
      }
    } catch (e) {
      setSnapshot(null);
      setSnapshotError(e instanceof Error ? e.message : "LOAD_FAILED");
    } finally {
      setSnapshotLoading(false);
    }
  }, []);

  const loadLineLab = useCallback(async (type?: LinePushType) => {
    setLineLoading(true);
    setLineError(null);
    try {
      const params = new URLSearchParams();
      if (type) params.set("preview", type);
      const res = await fetch(`/api/admin/dev/line-mode?${params.toString()}`);
      const data = (await res.json()) as {
        mode?: { mode: LinePushMode; test_recipient_id: string | null };
        logs?: QaLineLog[];
        types?: LinePushType[];
        preview?: { text: string };
      } & ApiError;
      if (!res.ok) throw new Error(data.error ?? "LOAD_FAILED");
      if (data.mode) {
        setPushMode(data.mode.mode);
        setTestRecipientId(data.mode.test_recipient_id);
      }
      setLogs(data.logs ?? []);
      setLineTypes(data.types ?? []);
      if (data.preview) setPreviewText(data.preview.text);
    } catch (e) {
      setLineError(e instanceof Error ? e.message : "LOAD_FAILED");
    } finally {
      setLineLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLineLab(previewType);
  }, [loadLineLab, previewType]);

  const overridePlan = useCallback(async () => {
    setPlanLoading(true);
    setPlanMessage(null);
    try {
      const res = await fetch("/api/admin/dev/override-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_email: ownerEmail, plan_tier: planTier }),
      });
      const data = (await res.json()) as { result?: { property_slug?: string } } & ApiError;
      if (!res.ok) throw new Error(data.error ?? "OVERRIDE_FAILED");
      setPlanMessage("OK");
      if (data.result?.property_slug) setPropertySlug(data.result.property_slug);
      await loadSnapshot(ownerEmail);
    } catch (e) {
      setPlanMessage(e instanceof Error ? e.message : "OVERRIDE_FAILED");
    } finally {
      setPlanLoading(false);
    }
  }, [ownerEmail, planTier, loadSnapshot]);

  const seedRooms = useCallback(async () => {
    setSeedLoading(true);
    setSeedMessage(null);
    try {
      const res = await fetch("/api/admin/dev/seed-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_slug: propertySlug,
          room_count: roomCount,
          mode: seedMode,
          line_mode: lineMode,
          status_mix: statusMix,
          with_meters: withMeters,
        }),
      });
      const data = (await res.json()) as {
        result?: { rooms_created: number; synthetic_line_count: number };
      } & ApiError;
      if (!res.ok) throw new Error(data.error ?? "SEED_FAILED");
      const r = data.result;
      setSeedMessage(
        r ? `${r.rooms_created}|${r.synthetic_line_count}` : "OK",
      );
      if (ownerEmail) await loadSnapshot(ownerEmail);
      await loadLineLab(previewType);
    } catch (e) {
      setSeedMessage(e instanceof Error ? e.message : "SEED_FAILED");
    } finally {
      setSeedLoading(false);
    }
  }, [
    propertySlug,
    roomCount,
    seedMode,
    lineMode,
    statusMix,
    withMeters,
    ownerEmail,
    loadSnapshot,
    loadLineLab,
    previewType,
  ]);

  const sendTestPush = useCallback(async () => {
    setTestPushLoading(true);
    setTestPushMessage(null);
    try {
      const res = await fetch("/api/admin/dev/test-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_user_id: testLineUserId,
          message_type: previewType,
          property_slug: propertySlug || undefined,
        }),
      });
      const data = (await res.json()) as ApiError;
      if (!res.ok) throw new Error(data.error ?? "PUSH_FAILED");
      setTestPushMessage("OK");
      await loadLineLab(previewType);
    } catch (e) {
      setTestPushMessage(e instanceof Error ? e.message : "PUSH_FAILED");
    } finally {
      setTestPushLoading(false);
    }
  }, [testLineUserId, previewType, propertySlug, loadLineLab]);

  return {
    ownerEmail,
    setOwnerEmail,
    snapshot,
    snapshotLoading,
    snapshotError,
    loadSnapshot,
    planTier,
    setPlanTier,
    planLoading,
    planMessage,
    overridePlan,
    propertySlug,
    setPropertySlug,
    roomCount,
    setRoomCount,
    seedMode,
    setSeedMode,
    lineMode,
    setLineMode,
    statusMix,
    setStatusMix,
    withMeters,
    setWithMeters,
    seedLoading,
    seedMessage,
    seedRooms,
    pushMode,
    testRecipientId,
    lineTypes,
    previewType,
    setPreviewType,
    previewText,
    logs,
    lineLoading,
    lineError,
    loadLineLab,
    testLineUserId,
    setTestLineUserId,
    testPushLoading,
    testPushMessage,
    sendTestPush,
  };
}
