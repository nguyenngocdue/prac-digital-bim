"use client";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export default function Header() {
  return (
    <header className="w-full border-b border-zinc-200 bg-background p-4 dark:border-zinc-700 ">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Prac Digital BIM — Web3D
          </Link>
          <nav className="hidden md:flex gap-3 text-sm text-zinc-600 dark:text-zinc-300">
            <Link href="/project" className="hover:underline">Projects</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
