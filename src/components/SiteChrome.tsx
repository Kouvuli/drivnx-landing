import Link from "next/link";
import { site } from "@/config/site";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#ai-privacy", label: "AI & privacy" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-1 text-lg font-bold tracking-tight">
          {site.name}
          {/* Brand mark (CFX-WEB-landing AC-53): the only place orange appears on the page. */}
          <span aria-hidden="true" data-brand-dot className="size-1.5 translate-y-1 rounded-full bg-brand" />
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex gap-6 text-sm font-medium text-muted">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/#early-access"
            className="fx inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-semibold text-on-accent [--fx-fill:var(--color-accent-strong)]"
          >
            Join early access
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line py-10 text-sm text-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-ink">{site.name}</p>
          <p className="mt-1">{site.operator}</p>
          <a href={`mailto:${site.email}`} className="mt-1 inline-block underline decoration-brand/60">
            {site.email}
          </a>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/privacy" className="transition-colors hover:text-ink">
                Privacy policy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
