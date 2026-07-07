import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenant Board",
};

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
