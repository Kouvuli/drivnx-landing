// Theme choice (CFX-WEB-landing AC-28, AC-29). No stored choice means dark (revision 4: dark for every first-time visitor).

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const THEME_EVENT = "themechange";

/** Runs inline in <head> before first paint, so a stored choice never flashes the other theme. */
export const themeScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this visit.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** Calls `onChange` when the toggle changes the theme. */
export function subscribeTheme(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}
