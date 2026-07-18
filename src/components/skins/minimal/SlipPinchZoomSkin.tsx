"use client";

import { useCallback, useRef, useState } from "react";

interface SlipPinchZoomSkinProps {
  src: string;
  alt: string;
  containerClassName?: string;
}

export function SlipPinchZoomSkin({
  src,
  alt,
  containerClassName,
}: SlipPinchZoomSkinProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const pinchRef = useRef<{
    dist: number;
    scale: number;
    panX: number;
    panY: number;
    lastX: number;
    lastY: number;
  } | null>(null);

  const clampScale = (value: number) => Math.min(4, Math.max(1, value));

  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (event.touches.length === 2) {
        const [a, b] = [event.touches[0], event.touches[1]];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        pinchRef.current = {
          dist,
          scale,
          panX: translate.x,
          panY: translate.y,
          lastX: 0,
          lastY: 0,
        };
      } else if (event.touches.length === 1 && scale > 1) {
        pinchRef.current = {
          dist: 0,
          scale,
          panX: translate.x,
          panY: translate.y,
          lastX: event.touches[0].clientX,
          lastY: event.touches[0].clientY,
        };
      }
    },
    [scale, translate.x, translate.y],
  );

  const onTouchMove = useCallback((event: React.TouchEvent) => {
    const pinch = pinchRef.current;
    if (!pinch) return;
    event.preventDefault();

    if (event.touches.length === 2 && pinch.dist > 0) {
      const [a, b] = [event.touches[0], event.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      setScale(clampScale(pinch.scale * (dist / pinch.dist)));
    } else if (event.touches.length === 1 && pinch.dist === 0) {
      const dx = event.touches[0].clientX - pinch.lastX;
      const dy = event.touches[0].clientY - pinch.lastY;
      setTranslate({ x: pinch.panX + dx, y: pinch.panY + dy });
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    pinchRef.current = null;
    setScale((current) => {
      if (current <= 1) {
        setTranslate({ x: 0, y: 0 });
        return 1;
      }
      return current;
    });
  }, []);

  const onDoubleClick = useCallback(() => {
    setScale((current) => {
      if (current > 1) {
        setTranslate({ x: 0, y: 0 });
        return 1;
      }
      return 2;
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 touch-none ${containerClassName ?? "h-[55vh]"}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        onDoubleClick={onDoubleClick}
        className="h-full w-full object-contain transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      />
    </div>
  );
}
