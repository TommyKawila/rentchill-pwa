import webpush from "web-push";
import { createAdminClient } from "@/services/supabase/admin";

export type PushSubscriptionInput = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type WebPushPayload = {
  title: string;
  body: string;
  url: string;
};

let vapidConfigured = false;

function configureVapid() {
  if (vapidConfigured) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject =
    process.env.VAPID_SUBJECT ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "mailto:support@rentchill.app";

  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export function isWebPushConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
  );
}

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}

export async function upsertOwnerPushSubscription(
  ownerId: string,
  input: PushSubscriptionInput,
  userAgent?: string | null,
) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("owner_push_subscriptions").upsert(
    {
      owner_id: ownerId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      user_agent: userAgent?.slice(0, 512) ?? null,
    },
    { onConflict: "owner_id,endpoint" },
  );

  if (error) throw error;
}

export async function deleteOwnerPushSubscription(
  ownerId: string,
  endpoint: string,
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("owner_push_subscriptions")
    .delete()
    .eq("owner_id", ownerId)
    .eq("endpoint", endpoint);

  if (error) throw error;
}

async function getOwnerIdForPropertySlug(propertySlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("owner_id")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (error) throw error;
  const ownerId = data?.owner_id ? String(data.owner_id) : null;
  return ownerId;
}

async function listOwnerSubscriptions(ownerId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("owner_push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("owner_id", ownerId);

  if (error) throw error;
  return data ?? [];
}

export async function sendWebPushToOwner(
  ownerId: string,
  payload: WebPushPayload,
) {
  if (!configureVapid()) return { sent: 0, failed: 0, skipped: true as const };

  const rows = await listOwnerSubscriptions(ownerId);
  if (rows.length === 0) return { sent: 0, failed: 0, skipped: false as const };

  const body = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: String(row.endpoint),
          keys: {
            p256dh: String(row.p256dh),
            auth: String(row.auth),
          },
        },
        body,
      );
      sent++;
    } catch (error) {
      failed++;
      const statusCode =
        error && typeof error === "object" && "statusCode" in error
          ? Number((error as { statusCode: number }).statusCode)
          : 0;
      if (statusCode === 404 || statusCode === 410) {
        await deleteOwnerPushSubscription(ownerId, String(row.endpoint));
      }
      console.error("[sendWebPushToOwner]", error);
    }
  }

  return { sent, failed, skipped: false as const };
}

export async function safeSendOwnerPropertyWebPush(input: {
  propertySlug: string;
  title: string;
  body: string;
  url: string;
}) {
  try {
    if (!isWebPushConfigured()) {
      return { sent: 0, failed: 0, skipped: true as const };
    }

    const ownerId = await getOwnerIdForPropertySlug(input.propertySlug);
    if (!ownerId) return { sent: 0, failed: 0, skipped: true as const };

    return await sendWebPushToOwner(ownerId, {
      title: input.title,
      body: input.body,
      url: input.url,
    });
  } catch (error) {
    console.error("[safeSendOwnerPropertyWebPush]", error);
    return { sent: 0, failed: 1, skipped: false as const };
  }
}
