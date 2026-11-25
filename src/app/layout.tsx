import "@fontsource-variable/manrope";
import "lenis/dist/lenis.css";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteScroll } from "@/components/site-scroll";
import { StudioCursor } from "@/components/studio-cursor";
import { MotionToggle, StudioMotionProvider } from "@/components/studio-motion";
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
            <footer className="site-footer">
              <div className="container footer-content">
                <Link href="/">
                  <strong>{site.name}</strong>
                  <span>{site.location}</span>
                </Link>
                <a href={`mailto:${site.email}`}>{site.email}</a>
                <MotionToggle className="footer-motion" showLabel />
                {!indexable && <small>Working preview · Draft copy</small>}
              </div>
            </footer>
          </StudioMotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
