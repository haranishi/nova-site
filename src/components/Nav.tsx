"use client";

import { useEffect, useRef } from "react";
import { NAV_LINKS, NAV_OFFER } from "@/lib/copy";
import type { SectionKey } from "@/lib/motion-state";
import { lockScroll, scrollToTarget, unlockScroll } from "@/lib/scroll-engine";
import { useUi } from "@/lib/store";
import PreOrderButton from "./ui/PreOrderButton";

/**
 * Four of the page's sections have no nav entry of their own. Rather than let
 * the bar go dark in the middle of the page, each falls back to the last entry
 * the reader passed — "you are still below Technology" is true and useful,
 * "you are nowhere" is neither (WS-C5). The hero deliberately lights nothing.
 */
const NAV_ANCHOR: Partial<Record<SectionKey, SectionKey>> = {
  everyday: "technology",
  cta: "specs",
  footer: "specs",
};

export default function Nav() {
  const scrolled = useUi((s) => s.scrolled);
  const activeSection = useUi((s) => s.active);
  const active = NAV_ANCHOR[activeSection] ?? activeSection;
  const navOpen = useUi((s) => s.navOpen);
  const setNavOpen = useUi((s) => s.setNavOpen);
  const dialogOpen = useUi((s) => s.dialogOpen);
  const burger = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  /*
   * The overlay only exists below md. Rotating a phone to landscape, or pulling
   * a desktop window narrow and back, hides it with `md:hidden` — but the lock
   * it took out is not CSS, so the page stayed frozen behind a menu nobody
   * could see. The breakpoint closes the menu itself.
   */
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (wide.matches) setNavOpen(false);
    };
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, [setNavOpen]);

  // overlay: scroll lock, Esc, focus in / focus back
  useEffect(() => {
    if (!navOpen) return;
    lockScroll();
    firstLink.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setNavOpen(false);
        burger.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      // the scrim is a tabindex=-1 button: it must not become a trap stop
      const items = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]):not([tabindex="-1"])',
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [navOpen, setNavOpen]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (!navOpen) {
      scrollToTarget(href);
      return;
    }
    // close first: the scroll lock must be lifted before we move the page
    setNavOpen(false);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => scrollToTarget(href)),
    );
  };

  return (
    <header
      data-nav
      data-scrolled={scrolled ? "true" : "false"}
      /* the modal is the only thing on screen while it is open, and the bar is
         as much "behind it" as the page is (the menu can never be open at the
         same time — opening the dialog closes it) */
      inert={dialogOpen}
      /* /55 + a heavier blur so the bar reads as frosted glass over a bright
         frame instead of a black band; the hairline goes to /12 to stay
         perceivable against the dark sections too (WS1-4) */
      className={`fixed inset-x-0 top-0 z-50 h-16 transition-[background-color,border-color,backdrop-filter] duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] ${
        scrolled
          ? "border-b border-white/12 bg-bg/55 backdrop-blur-2xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="nova-shell relative z-[70] flex h-16 items-center justify-between gap-4">
        <a
          href="#hero"
          onClick={go("#hero")}
          className="nova-label nova-tap -mx-2 flex h-[45px] items-center px-2 font-medium text-fg transition-opacity duration-200 hover:opacity-70"
          style={{ letterSpacing: "0.32em" }}
        >
          NOVA
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const on = active === link.section;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={go(link.href)}
                aria-current={on ? "true" : undefined}
                /* -mx/px pair: the hit box clears 45px in both axes without
                   moving the visible 32px gap between labels */
                className={`nova-tap relative -mx-2 flex h-[45px] items-center px-2 text-[14px] font-medium transition-colors duration-200 ${
                  on ? "text-fg" : "text-body hover:text-fg"
                }`}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-0.5 left-1/2 size-[3px] -translate-x-1/2 rounded-full bg-accent-soft transition-opacity duration-300 ${
                    on ? "opacity-100" : "opacity-0"
                  }`}
                />
              </a>
            );
          })}
          <PreOrderButton variant="nav" testId="nav-preorder" />
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          {/* one primary action on screen: the bar button steps aside for the
              menu's own Pre-order row while the overlay is open */}
          <div className={navOpen ? "hidden" : "contents"}>
            <PreOrderButton variant="nav" testId="nav-preorder-mobile" />
          </div>
          <button
            ref={burger}
            type="button"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            aria-controls="nav-overlay"
            data-testid="nav-burger"
            onClick={() => setNavOpen(!navOpen)}
            className="relative grid size-[45px] min-h-[45px] min-w-[45px] place-items-center"
          >
            {/* 24px glyph inside a 44px target (WS1-5) */}
            <span className="relative block h-[12px] w-6">
              <span
                className={`absolute left-0 block h-[1.5px] w-full rounded-full bg-fg transition-[top,transform] duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] ${
                  navOpen ? "top-[5px] rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 block h-[1.5px] w-full rounded-full bg-fg transition-[top,transform] duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] ${
                  navOpen ? "top-[5px] -rotate-45" : "top-[10.5px]"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* full-screen mobile overlay */}
      <div
        id="nav-overlay"
        ref={panel}
        data-testid="nav-overlay"
        aria-hidden={!navOpen}
        className={`fixed inset-0 z-[60] md:hidden ${
          navOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{ visibility: navOpen ? "visible" : "hidden" }}
      >
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => {
            setNavOpen(false);
            burger.current?.focus();
          }}
          /* near-opaque: at /95 the 3D device stayed visible behind the links */
          className={`absolute inset-0 h-full w-full cursor-default bg-bg/[0.98] backdrop-blur-2xl transition-opacity duration-300 ${
            navOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="nova-shell relative flex h-full flex-col justify-center gap-2">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              ref={i === 0 ? firstLink : undefined}
              href={link.href}
              onClick={go(link.href)}
              className="nova-tap flex items-center font-display text-[32px] leading-none tracking-[-0.03em] text-fg transition-transform duration-300"
              style={
                {
                  opacity: navOpen ? 1 : 0,
                  transform: navOpen ? "translateY(0)" : "translateY(12px)",
                  transition: `opacity 420ms cubic-bezier(0.165,0.84,0.44,1) ${
                    navOpen ? i * 60 : 0
                  }ms, transform 420ms cubic-bezier(0.165,0.84,0.44,1) ${
                    navOpen ? i * 60 : 0
                  }ms`,
                } as React.CSSProperties
              }
            >
              {link.label}
            </a>
          ))}

          {/* the offer travels with the action, so the menu is not a dead end */}
          <div
            className="mt-10 border-t border-hairline pt-8"
            style={{
              opacity: navOpen ? 1 : 0,
              transition: `opacity 420ms cubic-bezier(0.165,0.84,0.44,1) ${
                navOpen ? NAV_LINKS.length * 60 : 0
              }ms`,
            }}
          >
            <p
              data-testid="nav-menu-offer"
              className="nova-label text-mute"
              style={{ fontSize: 13, letterSpacing: "0.12em" }}
            >
              {NAV_OFFER}
            </p>
            <div className="mt-5">
              <PreOrderButton variant="hero" testId="nav-menu-preorder" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
