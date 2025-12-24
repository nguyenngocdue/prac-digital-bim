"use client";

import Link from "next/link";
import type { FC } from "react";
import ThemeToggle from "./theme-toggle";

/**
 * Header - Main application header with logo and theme toggle
 */
export const Header: FC = () => {
  return (
    <header className="w-full border-b border-zinc-200 bg-background p-4 dark:border-zinc-700">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Prac Digital BIM — Web3D
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
