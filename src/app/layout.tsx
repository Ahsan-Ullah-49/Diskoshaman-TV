import "@fontsource-variable/manrope";
import "lenis/dist/lenis.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteScroll } from "@/components/site-scroll";
import { StudioCursor } from "@/components/studio-cursor";
import { StudioMotionProvider } from "@/components/studio-motion";
import { ThemeProvider } from "@/components/theme-provider";
import { pages, site } from "@/content/site";
import { indexable } from "@/lib/metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: pages.home.description,
  robots: indexable
    ? { index: true, follow: true }
    : { index: false, follow: true },
  icons: { icon: { url: site.logo, type: "image/webp" } },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <StudioMotionProvider>
            <SiteScroll />
            <StudioCursor />
            <a className="skip-link" href="#main-content">
              Skip to content
            </a>
            <SiteHeader />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </StudioMotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
