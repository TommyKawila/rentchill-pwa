"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import { usePathname } from "next/navigation";

export function AppSerwistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBoard = pathname.startsWith("/board");
  const disableSerwist = process.env.NODE_ENV === "development" || isBoard;

  return (
    <SerwistProvider swUrl="/serwist/sw.js" disable={disableSerwist}>
      {children}
    </SerwistProvider>
  );
}
