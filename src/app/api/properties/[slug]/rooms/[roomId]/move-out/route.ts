import { NextResponse } from "next/server";
import { getOwnerQuota } from "@/services/ownerQuotaService";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import {
  moveOutTenant,
  roomLifecycleErrorMessageKey,
} from "@/services/roomLifecycleService";

function lifecycleErrorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "MOVE_OUT_FAILED";
  const key = roomLifecycleErrorMessageKey(code);
  return NextResponse.json(
    { error: code, messageKey: key },
    { status: code === "FORBIDDEN" ? 403 : 400 },
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string; roomId: string }> },
) {
  try {
    const { slug, roomId } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const result = await moveOutTenant(auth.ownerId, slug, roomId);
    const quota = await getOwnerQuota(auth.ownerId);

    return NextResponse.json({
      ok: true,
      result,
      quota: {
        room_count: quota.room_count,
        room_limit: quota.room_limit,
        rooms_remaining: quota.rooms_remaining,
      },
    });
  } catch (error) {
    console.error("[rooms.moveOut.POST]", { roomId: (await context.params).roomId }, error);
    return lifecycleErrorResponse(error);
  }
}
