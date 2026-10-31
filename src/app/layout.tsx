import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ButtonRipple } from "@/components/ButtonRipple";
import { SmoothScroll } from "@/components/SmoothScroll";
import { site } from "@/config/site";
import { themeScript } from "@/lib/theme";
import "./globals.css";

// Self-hosted by next/font: no requests to font services from the visitor's browser (CFX-WEB-landing AC-44).
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { title: site.title, description: site.description, siteName: site.name, type: "website" },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the inline theme script sets data-theme on <html> before React hydrates.
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <SmoothScroll />
        <ButtonRipple />
        {children}
      </body>
    </html>
  );
}
