"use client";

import Link from "next/link";
import { Eye, Bell, Menu } from "lucide-react";
import { usePreferences } from "./preferences/PreferencesProvider";

export default function Topbar({
  breadcrumb,
  onMenu,
}: {
  breadcrumb: string;
  onMenu?: () => void;
}) {
  const { preferences } = usePreferences();
  const { profile } = preferences;

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-surface-border bg-surface-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface hover:text-text-primary lg:hidden"
        >
          <Menu className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted transition-colors hover:text-text-primary"
          >
            JEROME
          </Link>
          <span className="text-text-muted">/</span>
          <span className="font-medium text-text-primary">{breadcrumb}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
          aria-label="Accessibility settings"
        >
          <Eye className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#C05050] ring-2 ring-surface-white" />
        </button>
        <div className="mx-1 h-6 w-px bg-surface-border" />
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-green-950"
          style={{ backgroundColor: profile.avatarColor }}
        >
          {(profile.avatarInitials || "EM").slice(0, 2)}
        </div>
      </div>
    </header>
  );
}
