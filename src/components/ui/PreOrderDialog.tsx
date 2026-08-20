"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DIALOG, SITE } from "@/lib/copy";
import { lockScroll, scrollToTarget, unlockScroll } from "@/lib/scroll-engine";
import { getDialogInvoker, useUi } from "@/lib/store";

/**
 * The page's only modal (構造: 唯一のモーダル=Pre-order).
 * Focus moves inside on open and returns to the invoker on close.
 */
export default function PreOrderDialog() {
  const open = useUi((s) => s.dialogOpen);
  const close = useUi((s) => s.closeDialog);
  const reduced = useUi((s) => s.reduced);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SITE.canonical);
    } catch {
      // clipboard blocked — the dialog stays usable, the label just stays put
    }
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 4000);
  };

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    const invoker = getDialogInvoker();
    lockScroll();
    closeBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = panel.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]):not([tabindex="-1"]), a[href]',
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
      invoker?.focus();
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100] grid place-items-center px-6">
          <motion.button
            type="button"
            aria-label="Close dialog"
            tabIndex={-1}
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            className="absolute inset-0 h-full w-full cursor-default bg-[#030305]/70 backdrop-blur-sm"
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-body"
            data-testid="preorder-dialog"
            initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
            transition={{
              duration: reduced ? 0 : 0.2,
              ease: [0.165, 0.84, 0.44, 1],
            }}
            className="relative w-full max-w-sm rounded-2xl border border-hairline bg-[#0b0c12] p-8"
          >
            {/* explicit dismiss affordance in the corner (WS5-4) */}
            <button
              type="button"
              onClick={close}
              aria-label={DIALOG.dismiss}
              data-testid="dialog-x"
              className="absolute right-2.5 top-2.5 grid size-[45px] min-h-[45px] min-w-[45px] place-items-center rounded-full text-dim transition-colors duration-200 hover:bg-white/[0.06] hover:text-fg"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M2.5 2.5l9 9M11.5 2.5l-9 9" />
              </svg>
            </button>

            <h2
              id="dialog-title"
              className="pr-10 font-display text-[26px] leading-tight tracking-[-0.03em] text-fg"
            >
              {DIALOG.title}
            </h2>
            <p id="dialog-body" className="mt-3 text-[15px] text-body">
              {DIALOG.bodyLead}
              {/* the deck forbids a break inside this sentence */}
              <span className="whitespace-nowrap">{DIALOG.bodyTail}</span>
            </p>
            {/*
              05 改訂4（本人決定 2026-08-18）— the modal's job is not to be
              closed, and it is not to be shared either. Someone who pressed a
              buy button on a fictional product wants to know what the thing
              actually is, so the forward door into Technology holds the white
              pill; the link is worth offering but is the second choice, so it
              drops to a ghost. Leaving stays a text link (plus the corner ×).
              Loop 3 had these two the other way round and both evaluators read
              the primary as the wrong intent.
            */}
            <a
              href="#technology"
              data-testid="dialog-forward"
              onClick={(e) => {
                e.preventDefault();
                close();
                // let the scroll lock lift before the page is asked to move
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => scrollToTarget("#technology")),
                );
              }}
              className="nova-tap mt-7 inline-flex h-[45px] w-full items-center justify-center rounded-full bg-white text-[14px] font-semibold text-[#050507] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              {DIALOG.forward}
            </a>
            <button
              type="button"
              onClick={copyLink}
              data-testid="dialog-copy"
              className="nova-ghost nova-tap mt-2.5 h-[45px] w-full text-[14px]"
            >
              {copied ? DIALOG.copied : DIALOG.copy}
            </button>
            <div className="mt-1 flex justify-center">
              <button
                ref={closeBtn}
                type="button"
                onClick={close}
                data-testid="dialog-close"
                className="nova-tap inline-flex items-center rounded-full px-5 text-[14px] font-medium text-mute underline decoration-white/25 underline-offset-4 transition-colors duration-200 hover:text-fg hover:decoration-white/60"
              >
                {DIALOG.button}
              </button>
            </div>
            <span role="status" aria-live="polite" className="sr-only">
              {copied ? DIALOG.copied : ""}
            </span>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
