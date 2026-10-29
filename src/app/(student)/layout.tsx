"use client";

import { usePathname } from "next/navigation";
import AppShell from "@/components/AppShell";

function breadcrumbFor(pathname: string) {
  if (pathname === "/") return "Overview";
  const segment = pathname.split("/").filter(Boolean)[0] ?? "Overview";
  if (segment === "ai-tutor") return "AI tutor";
  if (segment === "knowledge-base") return "Knowledge base";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return <AppShell breadcrumb={breadcrumbFor(pathname)}>{children}</AppShell>;
}
