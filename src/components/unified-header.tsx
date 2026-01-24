"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, type FC } from "react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./theme-toggle";
import { useLanguage } from "@/contexts/language-context";
import { useBoxContext } from "@/app/contexts/box-context";
import { motion } from "framer-motion";
import {
  Home,
  FolderKanban,
  Workflow,
  Box,
  Menu,
  X,
  Building2,
  Languages,
  Plus,
} from "lucide-react";

type NavigationItem = {
  labelKey: string;
  href: string;
  icon: React.ReactNode;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    labelKey: "nav.home",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
  {
    labelKey: "nav.projects",
    href: "/project",
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    labelKey: "nav.workflow",
    href: "/workflow",
    icon: <Workflow className="h-5 w-5" />,
  },
  {
    labelKey: "nav.viewer",
    href: "/project/viewer",
    icon: <Box className="h-5 w-5" />,
  },
];

/**
 * UnifiedHeader - Clean and modern header for Ascend Platform
 */
export const UnifiedHeader: FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Try to get box context, but handle if not available
  let createRoom: (() => void) | null = null;
  try {
    const boxContext = useBoxContext();
    createRoom = boxContext.createRoom;
  } catch {
    // Context not available (not in a page with BoxProvider)
  }

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
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        isScrolled && "shadow-sm"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-bold">Ascend</span>
              <span className="text-xs text-muted-foreground">
                {language === "en" ? "Platform" : "Nền tảng"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 border-b border-border/70">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-1 pb-3 pt-2 text-sm font-medium transition-none transform-none",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <span>{t(item.labelKey)}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-linear-to-r from-sky-400/20 via-sky-400 to-sky-400/20 shadow-[0_0_10px_rgba(56,189,248,0.6)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Create Room Button - Only show on viewer page */}
            {createRoom && pathname.includes("/viewer") && (
              <button
                onClick={createRoom}
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                title={language === "en" ? "Create Room" : "Tạo phòng"}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {language === "en" ? "Create Room" : "Tạo phòng"}
                </span>
              </button>
            )}
            
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "en" ? "vi" : "en")}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-none transform-none hover:bg-accent hover:text-accent-foreground"
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "en" ? "VI" : "EN"}</span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle size="icon-sm" className="transition-none transform-none" />

            {/* Mobile Menu Button */}
            <button
              className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-none transform-none hover:bg-accent hover:text-accent-foreground md:hidden"
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
          <nav className="border-t py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {item.icon}
                    <span>{t(item.labelKey)}</span>
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
