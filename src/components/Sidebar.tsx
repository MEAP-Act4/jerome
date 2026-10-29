"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePreferences } from "./preferences/PreferencesProvider";
import {
  LayoutDashboard,
  BookOpen,
  Database,
  GraduationCap,
  TrendingUp,
  Settings,
  LifeBuoy,
  Sparkles,
  MoreHorizontal,
  X,
} from "lucide-react";

const workspaceItems = [
  { href: "/", icon: LayoutDashboard, label: "Overview" },
  { href: "/subjects", icon: BookOpen, label: "Subjects" },
  { href: "/knowledge-base", icon: Database, label: "Knowledge base" },
  { href: "/ai-tutor", icon: GraduationCap, label: "AI tutor" },
  { href: "/progress", icon: TrendingUp, label: "Progress" },
];

const secondaryItems = [
  { href: "/preferences", icon: Settings, label: "Preferences" },
  { href: "/help", icon: LifeBuoy, label: "Help Center" },
];

export default function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { preferences } = usePreferences();
  const { profile } = preferences;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-green-950/40 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[244px] flex-col bg-green-950 transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-green-100/10 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Sparkles className="h-4.5 w-4.5 text-green-950" strokeWidth={2.5} />
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight text-cream-50">
              JEROME
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-md text-green-100/50 transition-colors hover:bg-green-100/10 hover:text-green-100 lg:hidden"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-green-100/40">
          Workspace
        </p>
        <ul className="space-y-1">
          {workspaceItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive(item.href)
                    ? "bg-green-100/10 text-green-100"
                    : "text-green-100/50 hover:bg-green-100/5 hover:text-green-100/80"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-green-100/40">
            Account
          </p>
          <ul className="space-y-1">
            {secondaryItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive(item.href)
                      ? "bg-green-100/10 text-green-100"
                      : "text-green-100/50 hover:bg-green-100/5 hover:text-green-100/80"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="border-t border-green-100/10 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-green-950"
            style={{ backgroundColor: profile.avatarColor }}
          >
            {(profile.avatarInitials || "EM").slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-cream-50">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="truncate text-xs text-green-100/50">
              {profile.grade} · {profile.strand}
            </p>
          </div>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md text-green-100/40 transition-colors hover:bg-green-100/10 hover:text-green-100/70"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      </aside>
    </>
  );
}
