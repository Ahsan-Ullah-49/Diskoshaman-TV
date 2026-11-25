"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { bookingPath, pages } from "@/content/site";
import { ScrollTrigger, useGSAP } from "@/lib/motion";
import { HeaderNavigation } from "./header-navigation";
import { StudioMark } from "./brand/studio-mark";
import styles from "./site-header.module.css";

const desktopNavigation = "(min-width: 53rem)";

function BookingLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      className={`button button-cinematic button-gold ${styles.bookingButton}`}
      href={bookingPath}
      aria-label="Book a 20-minute call"
      onNavigate={onNavigate}
    >
      <i className={styles.bookingWash} aria-hidden="true" />
      <span className={styles.bookingLabel}>Book a call</span>
      <span className={styles.bookingArrow} aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}

function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      className={styles.themeButton}
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
    >
      <span className={styles.lightIcon}>
        <span className="visually-hidden">Switch to light theme</span>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </svg>
        {showLabel && <span aria-hidden="true">Light mode</span>}
      </span>
      <span className={styles.darkIcon}>
        <span className="visually-hidden">Switch to dark theme</span>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 8.7 8.7 0 1 0 20.5 14.3Z" />
        </svg>
        {showLabel && <span aria-hidden="true">Dark mode</span>}
      </span>
    </button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const drawerBacking = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useGSAP(
    () => {
      const element = header.current;
      if (!element) return;
      const update = () => {
        element.dataset.scroll = window.scrollY > 10 ? "raised" : "top";
      };
      update();
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: update,
        onRefresh: update,
      });
    },
    { scope: header, dependencies: [pathname], revertOnUpdate: true },
  );

  useEffect(() => {
    const desktop = window.matchMedia(desktopNavigation);
    const closeOnDesktop = () => {
      if (desktop.matches && dialog.current?.open) dialog.current.close();
    };

    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    // History navigation can also change the page while the mobile dialog is open.
    const menu = dialog.current;
    if (menu?.open && menu.hasAttribute("data-shown")) menu.close();
  }, [pathname]);

  function openMenu() {
    const menu = dialog.current;
    if (!menu || menu.open) return;
    menu.showModal();
    // Commit the offscreen frame before starting the two entrance transitions.
    drawerBacking.current?.getBoundingClientRect();
    menu.dataset.shown = "true";
    setMenuOpen(true);
  }

  function closeMenu() {
    const menu = dialog.current;
    if (!menu?.open || !menu.hasAttribute("data-shown")) return;
    delete menu.dataset.shown;
    setMenuOpen(false);
    // Keep native focus trapping and scroll lock until the last layer leaves.
    const exit = drawerBacking.current?.getAnimations() ?? [];
    void Promise.allSettled(exit.map((animation) => animation.finished)).then(
      () => {
        if (menu.open && !menu.hasAttribute("data-shown")) menu.close();
      },
    );
  }

  return (
    <header
      ref={header}
      className={styles.header}
      data-over-film={pathname === pages.home.path}
      data-scroll="top"
    >
      <div className={styles.surface} aria-hidden="true" />
      <div className={styles.emblemGlass} aria-hidden="true" />
      <div className={styles.bar}>
        <HeaderNavigation key={pathname} pathname={pathname} />
        <button
          type="button"
          className={styles.menuButton}
          aria-haspopup="dialog"
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          onClick={openMenu}
        >
          <span className={styles.menuGlyph} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="visually-hidden">Open menu</span>
        </button>
        <div className={styles.brand}>
          <StudioMark />
        </div>
        <div className={styles.actions}>
          <div className={styles.desktopTheme}>
            <ThemeToggle />
          </div>
          <BookingLink />
        </div>
      </div>

      <dialog
        ref={dialog}
        className={styles.dialog}
        id="mobile-navigation"
        data-lenis-prevent
        data-mobile-navigation
        aria-labelledby="mobile-menu-title"
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
        onClose={(event) => {
          delete event.currentTarget.dataset.shown;
          setMenuOpen(false);
        }}
      >
        <div
          ref={drawerBacking}
          className={styles.drawerBacking}
          aria-hidden="true"
        />
        <div className={styles.dialogPanel}>
          <div className={styles.dialogTop}>
            <h2 id="mobile-menu-title" className="visually-hidden">
              Main menu
            </h2>
            <Image
              className={styles.drawerLogo}
              src="/brand/studio-logo.png"
              alt="Diskoshaman TV"
              width={78}
              height={78}
              sizes="(max-width: 390px) 60px, 78px"
            />
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeMenu}
            >
              <span className="visually-hidden">Close menu</span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m5 5 14 14M19 5 5 19" />
              </svg>
            </button>
          </div>
          <HeaderNavigation
            key={pathname + String(menuOpen)}
            pathname={pathname}
            mobile
            onNavigate={closeMenu}
          />
          <div className={styles.drawerFooter}>
            <ThemeToggle showLabel />
            <BookingLink onNavigate={closeMenu} />
          </div>
        </div>
      </dialog>
    </header>
  );
}
