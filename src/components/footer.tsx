"use client";

import Link from "next/link";
import type { FC } from "react";

// Constants
const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/app", label: "Projects" },
  { href: "/privacy", label: "Privacy" },
] as const;

const COMPANY_NAME = "Prac Digital BIM" as const;

// Component
export const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t border-zinc-100 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        {/* Copyright Section */}
        <div className="text-center md:text-left">
          © {currentYear} {COMPANY_NAME}
        </div>

        {/* Navigation Links */}
        <nav aria-label="Footer navigation">
          <ul className="flex gap-4">
            {FOOTER_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="transition-colors hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
