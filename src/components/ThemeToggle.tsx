"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { currentTheme, setTheme, subscribeTheme } from "@/lib/theme";

// CFX-WEB-landing AC-29. The label names the theme the button switches to; before hydration it is neutral.
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => null);
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => theme && setTheme(next)}
      aria-label={theme ? `Switch to ${next} theme` : "Switch theme"}
      className="press inline-flex size-10 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink"
    >
      {theme === "dark" ? <Sun aria-hidden="true" className="size-5" /> : <Moon aria-hidden="true" className="size-5" />}
    </button>
  );
}
