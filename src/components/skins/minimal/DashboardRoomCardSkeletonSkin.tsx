"use client";

export function DashboardRoomCardSkeletonSkin() {
  return (
    <div
      className="flex h-[88px] animate-pulse items-center gap-3 rounded-xl border border-zinc-100 bg-white px-3"
      aria-hidden
    >
      <div className="h-14 w-14 shrink-0 rounded-md bg-zinc-100" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-zinc-100" />
        <div className="h-3 w-1/2 rounded bg-zinc-100" />
      </div>
      <div className="h-6 w-16 shrink-0 rounded-full bg-zinc-100" />
    </div>
  );
}
