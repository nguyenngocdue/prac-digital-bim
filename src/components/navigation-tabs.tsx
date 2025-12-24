"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import { cn } from "@/lib/utils";

type NavigationTab = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const NAVIGATION_TABS: NavigationTab[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Projects",
    href: "/project",
  },
  {
    label: "Workflow",
    href: "/workflow",
  },
  {
    label: "3D Viewer",
    href: "/project/viewer",
  },
] as const;

/**
 * Navigation Tabs - Horizontal tab navigation below header
 */
export const NavigationTabs: FC = () => {
  const pathname = usePathname();

  const isActiveTab = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="w-full border-b border-zinc-200 bg-background dark:border-zinc-700"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-7xl">
        {NAVIGATION_TABS.map((tab) => {
          const isActive = isActiveTab(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors",
                "hover:text-zinc-900 dark:hover:text-zinc-50",
                isActive
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400"
              )}
            >
              {tab.icon && <span className="text-lg">{tab.icon}</span>}
              <span>{tab.label}</span>

              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-50" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default NavigationTabs;
