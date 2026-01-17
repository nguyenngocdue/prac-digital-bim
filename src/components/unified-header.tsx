"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, type FC } from "react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./theme-toggle";
import {
  Home,
  FolderKanban,
  Workflow,
  Box,
  Bell,
  Search,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    label: "Projects",
    href: "/project",
    icon: <FolderKanban className="h-4 w-4" />,
  },
  {
    label: "Workflow",
    href: "/workflow",
    icon: <Workflow className="h-4 w-4" />,
    badge: "New",
  },
  {
    label: "3D Viewer",
    href: "/project/viewer",
    icon: <Box className="h-4 w-4" />,
  },
];

/**
 * UnifiedHeader - Modern header combining navigation and actions
 */
export const UnifiedHeader: FC = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll for header blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActiveRoute = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-slate-200/70 bg-gradient-to-b from-white/95 via-white/90 to-slate-50/80 text-slate-900 transition-all duration-300 dark:border-slate-800/80 dark:from-slate-950/90 dark:via-slate-950/90 dark:to-slate-900/80 dark:text-white",
        isScrolled && "shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl"
      )}
    >
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_55%)] opacity-70 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="group flex items-center gap-3 transition-transform hover:scale-[1.01]"
              >
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.25)] dark:from-slate-200 dark:via-slate-100 dark:to-white">
                  <Sparkles className="h-5 w-5 text-white dark:text-slate-900" />
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-900/10" />
                </div>
                <div className="hidden sm:flex flex-col leading-none">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500 dark:text-slate-400">
                    Digital BIM
                  </span>
                  <span className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    Workflow Studio
                  </span>
                </div>
              </Link>
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Workspace
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] text-white dark:bg-white dark:text-slate-900">
                  Alpha Lab
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center rounded-full border border-slate-200/70 bg-white/80 p-1 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70">
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all",
                      isActive
                        ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    )}
                  >
                    <span className="text-inherit">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-slate-500 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300">
                <Search className="h-4 w-4" />
                <input
                  className="w-40 bg-transparent text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
                  placeholder="Search models, nodes..."
                />
                <kbd className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  ⌘K
                </kbd>
              </div>

              <button className="relative rounded-full border border-slate-200/70 bg-white/80 p-2 text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500">
                  <span className="absolute inset-0 animate-ping rounded-full bg-rose-500 opacity-70" />
                </span>
              </button>

              <ThemeToggle
                size="icon-sm"
                className="rounded-full border border-slate-200/70 bg-white/80 text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800"
              />

              <button className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-gradient-to-br from-slate-900 to-slate-600 text-[11px] font-semibold text-white shadow-sm transition hover:scale-105 sm:flex dark:border-slate-700 dark:from-white dark:to-slate-200 dark:text-slate-900">
                DB
              </button>

              <button
                className="rounded-full border border-slate-200/70 bg-white/80 p-2 text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 md:hidden dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <nav className="border-t border-slate-200/70 py-4 md:hidden dark:border-slate-800/70">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-slate-500 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-300">
                  <Search className="h-4 w-4" />
                  <input
                    className="w-full bg-transparent text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
                    placeholder="Search models, nodes..."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  {NAVIGATION_ITEMS.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition-all",
                          isActive
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          {item.icon}
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default UnifiedHeader;
