"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";

type ThemeToggleProps = {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
};

const ThemeToggle = ({
  className,
  size = "sm",
  variant = "ghost",
}: ThemeToggleProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTheme(stored);
        document.documentElement.classList.toggle("dark", stored === "dark");
        return;
      }
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    } catch {
      // ignore
    }
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={toggle}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default ThemeToggle;
