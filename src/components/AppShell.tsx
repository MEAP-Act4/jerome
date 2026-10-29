"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({
  children,
  breadcrumb = "Overview",
}: {
  children: React.ReactNode;
  breadcrumb?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col lg:ml-[244px]">
        <Topbar breadcrumb={breadcrumb} onMenu={() => setMenuOpen(true)} />
        <main className="flex flex-1 justify-center px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="w-full max-w-[1180px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
