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
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b border-zinc-200/50 bg-white/80 shadow-sm backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
          : "border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
            >
              {/* Logo Icon */}
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 transition-shadow group-hover:shadow-blue-500/40">
                <Sparkles className="h-5 w-5 text-white" />
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              {/* Logo Text */}
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                  Digital BIM
                </h1>
                <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Web3D Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  )}
                >
                  {/* Active background */}
                  <span
                    className={cn(
                      "absolute inset-0 rounded-lg transition-all",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-500/10"
                        : "bg-transparent group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800"
                    )}
                  />
                  {/* Icon */}
                  <span className="relative z-10">{item.icon}</span>
                  {/* Label */}
                  <span className="relative z-10">{item.label}</span>
                  {/* Badge */}
                  {item.badge && (
                    <span className="relative z-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions Section */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              className="hidden items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-500 transition-all hover:border-zinc-300 hover:bg-zinc-100 sm:flex dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
              onClick={() => {}}
            >
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline">Search...</span>
              <kbd className="hidden rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 lg:inline dark:bg-zinc-700 dark:text-zinc-400">
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <button className="relative rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white">
              <Bell className="h-5 w-5" />
              {/* Notification dot */}
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500">
                <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-75" />
              </span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Avatar / Profile */}
            <button className="hidden h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-semibold text-white transition-transform hover:scale-105 sm:flex">
              DB
            </button>

            {/* Mobile Menu Button */}
            <button
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="border-t border-zinc-200 py-4 md:hidden dark:border-zinc-800">
            <div className="flex flex-col gap-1">
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default UnifiedHeader;
