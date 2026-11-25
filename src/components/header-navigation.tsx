"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { navigation, pages } from "@/content/site";
import { serviceNavigation } from "@/content/services";
import styles from "./site-header.module.css";

type NavigationProps = {
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
};

function ServicesLink({ pathname, mobile, onNavigate }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const group = useRef<HTMLLIElement>(null);
  const submenu = useRef<HTMLUListElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const openedOnHover = useRef(false);
  const focusFirstOnOpen = useRef(false);
  const id = useId();

  function focusFirstService() {
    submenu.current?.querySelector("a")?.focus();
  }

  useLayoutEffect(() => {
    if (open && focusFirstOnOpen.current) {
      focusFirstOnOpen.current = false;
      focusFirstService();
    }
  }, [open]);

  function close() {
    openedOnHover.current = false;
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !group.current?.contains(event.target)
      )
        close();
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  return (
    <li
      ref={group}
      className={styles.serviceGroup}
      data-expanded={open}
      onPointerEnter={(event) => {
        if (!mobile && event.pointerType === "mouse" && !open) {
          openedOnHover.current = true;
          setOpen(true);
        }
      }}
      onPointerLeave={() => {
        if (
          !mobile &&
          openedOnHover.current &&
          !group.current?.contains(document.activeElement)
        )
          close();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          close();
          toggle.current?.focus();
        }
      }}
    >
      <div className={styles.serviceRow}>
        <Link
          className={styles.navLink}
          href={pages.services.path}
          aria-current={pathname === pages.services.path ? "page" : undefined}
          onNavigate={onNavigate}
        >
          Services
        </Link>
        <button
          ref={toggle}
          type="button"
          className={styles.serviceToggle}
          aria-label="Service pages"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => {
            setOpen(openedOnHover.current || !open);
            openedOnHover.current = false;
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              if (open) focusFirstService();
              else {
                focusFirstOnOpen.current = true;
                setOpen(true);
              }
            }
          }}
        >
          <svg viewBox="0 0 12 8" aria-hidden="true">
            <path d="m1.5 1.5 4.5 4.5 4.5-4.5" />
          </svg>
        </button>
      </div>
      <ul ref={submenu} id={id} className={styles.submenu} hidden={!open}>
        {serviceNavigation.map(({ slug, label }) => {
          const path = "/" + slug + "/";
          return (
            <li key={slug}>
              <Link
                href={path}
                aria-current={pathname === path ? "page" : undefined}
                onNavigate={onNavigate}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

export function HeaderNavigation({
  pathname,
  mobile,
  onNavigate,
}: NavigationProps) {
  const current = pathname.endsWith("/") ? pathname : pathname + "/";
  return (
    <nav
      className={mobile ? styles.mobileNav : styles.desktopNav}
      aria-label="Main"
    >
      <ul className={styles.navList}>
        {navigation.map(({ path, label }) =>
          path === pages.services.path ? (
            <ServicesLink
              key={path}
              pathname={current}
              mobile={mobile}
              onNavigate={onNavigate}
            />
          ) : (
            <li key={path}>
              <Link
                className={styles.navLink}
                href={path}
                aria-current={current === path ? "page" : undefined}
                onNavigate={onNavigate}
              >
                {label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
