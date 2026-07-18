"use client";

import { useRef, useState } from "react";

const ACTION_WIDTH = 128;

interface SwipeDocCardSkinProps {
  children: React.ReactNode;
  onDelete: () => void;
  onShare: () => void;
  deleteLabel: string;
  shareLabel: string;
  disabled?: boolean;
}

export function SwipeDocCardSkin({
  children,
  onDelete,
  onShare,
  deleteLabel,
  shareLabel,
  disabled,
}: SwipeDocCardSkinProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);

  const clamp = (value: number) =>
    Math.max(-ACTION_WIDTH, Math.min(0, value));

  const onPointerDown = (event: React.PointerEvent) => {
    if (disabled) return;
    dragging.current = true;
    startX.current = event.clientX - offset;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging.current || disabled) return;
    setOffset(clamp(event.clientX - startX.current));
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setOffset((prev) => (prev < -ACTION_WIDTH / 2 ? -ACTION_WIDTH : 0));
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-y-0 right-0 flex w-32">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setOffset(0);
            onShare();
          }}
          className="flex min-h-12 flex-1 items-center justify-center bg-rc-green-soft text-sm font-medium text-rc-green-ink disabled:opacity-50"
        >
          {shareLabel}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setOffset(0);
            onDelete();
          }}
          className="flex min-h-12 flex-1 items-center justify-center bg-red-50 text-sm font-medium text-red-600 disabled:opacity-50"
        >
          {deleteLabel}
        </button>
      </div>

      <div
        className="relative touch-pan-y bg-white transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </div>
    </div>
  );
}
