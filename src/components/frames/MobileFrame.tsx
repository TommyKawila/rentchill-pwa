import type { ReactNode } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto min-h-screen max-w-md border-x border-zinc-100 bg-white">
        {children}
      </div>
    </div>
  );
}
