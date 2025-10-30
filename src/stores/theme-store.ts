import { Theme } from "@/types/theme";
import {effect, signal} from "@preact/signals-react";

const defaultTheme = "dark" as Theme;
const storageKey = "twin-editor-theme";

/**
 *
 * @returns
 */
const initThem = () => {
  if (typeof window === "undefined") {
    // server-side: return a safe default
    return defaultTheme;
  }
  return (window.localStorage.getItem(storageKey) as Theme) || defaultTheme;
};

/**
 * from @https://ui.shadcn.com/docs/dark-mode/vite
 */
export class ThemeStore {
  /**
   * @params {Theme}
   */
  public appTheme = signal<Theme>(initThem());

  /**
   *
   */
  constructor() {
    // Only run effects that touch the DOM in the browser
    if (typeof window === "undefined") return;

    effect(() => {
      const root = window.document.documentElement;

      root.classList.remove("light", "dark");

      window.localStorage.setItem(storageKey, this.appTheme.value);

      if (this.appTheme.value === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";

        root.classList.add(systemTheme);
        return;
      }

      root.classList.add(this.appTheme.value);
    });
  }
}
