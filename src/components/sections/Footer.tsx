"use client";

import { useEffect, useRef, useState } from "react";
import { FOOTER, SHARE_URLS, SITE } from "@/lib/copy";
import { scrollToTarget } from "@/lib/scroll-engine";

/**
 * One ink for every entry in the footer (WS2-3), and one row height (WS-D6).
 * Loop 2 dimmed the fictional entries to 70%, which rebuilt the two-tone look
 * the dimming was meant to remove: the list now differs only on hover, where a
 * real link brightens and a placeholder does not.
 */
const linkClass =
  "nova-tap flex items-center text-[14px] text-body transition-colors duration-200 hover:text-fg";

const deadClass =
  "nova-tap flex cursor-default items-center text-[14px] text-body";

/** the share row is horizontal, so its targets carry their own width */
const shareClass =
  "nova-tap inline-flex items-center rounded-full px-3 text-[14px] text-body transition-colors duration-200 hover:bg-white/[0.06] hover:text-fg";

function Heading({ children }: { children: string }) {
  return <p className="nova-label mb-4 text-faint">{children}</p>;
}

/**
 * Share (WS-B8). It used to be a fifth column, which is why the columns ran to
 * four different depths — the note under it is four lines long and nothing else
 * in that row had a paragraph. It is a band of its own now, directly above the
 * legal line, where a horizontal row of destinations reads as one offer.
 */
function ShareBand() {
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.canonical);
    } catch {
      // clipboard blocked — the visible URL note still lets people copy manually
    }
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 4000);
  };

  const native = async () => {
    try {
      await navigator.share({
        title: SITE.title,
        text: SITE.shareText,
        url: SITE.canonical,
      });
    } catch {
      // user dismissed the sheet
    }
  };

  return (
    <div className="mt-16 border-t border-hairline pt-8">
      <div className="flex flex-col gap-x-10 gap-y-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="-ml-3 flex flex-wrap items-center gap-y-1">
          <span className="nova-label ml-3 mr-4 text-faint">
            {FOOTER.share.label}
          </span>
          {canShare ? (
            <button
              type="button"
              onClick={native}
              data-testid="share-native"
              className={shareClass}
            >
              {FOOTER.share.native}
            </button>
          ) : null}
          <a
            href={SHARE_URLS.x}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="share-x"
            className={shareClass}
          >
            {FOOTER.share.x}
          </a>
          <a
            href={SHARE_URLS.line}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="share-line"
            className={shareClass}
          >
            {FOOTER.share.line}
          </a>
          <button
            type="button"
            onClick={copy}
            data-testid="share-copy"
            className={shareClass}
          >
            {FOOTER.share.copy}
          </button>
          <span
            role="status"
            aria-live="polite"
            className="nova-label ml-3 w-14 text-accent-soft"
            data-testid="share-copied"
          >
            {copied ? FOOTER.share.copied : ""}
          </span>
        </div>

        {/* the note describes the row that is actually on screen (05 改訂3) */}
        <p
          data-testid="share-note"
          className="max-w-[52ch] text-[13px] leading-relaxed text-mute lg:text-right"
        >
          {canShare ? FOOTER.share.noteShare : FOOTER.share.noteCopy}
        </p>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      id="footer"
      data-section="footer"
      className="relative z-10 border-t border-hairline pb-16 pt-20"
    >
      <div className="nova-shell">
        {/*
          One grid, so the brand and the three lists share the same column rhythm
          instead of leaving a 280px hole in the middle of the row. Below lg the
          brand takes the full width and the lists sit beside each other.
        */}
        <div className="grid grid-cols-2 gap-x-10 gap-y-14 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-16">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <p
              className="nova-label text-fg"
              style={{ letterSpacing: "0.32em" }}
            >
              NOVA
            </p>
            <p className="mt-4 max-w-[24ch] text-[15px] text-mute">
              {FOOTER.tag}
            </p>
          </div>

          <div>
            <Heading>Product</Heading>
            <ul>
              {FOOTER.columns.product.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={linkClass}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToTarget(item.href);
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Heading>Company</Heading>
            <ul>
              {FOOTER.columns.company.map((label) => (
                <li key={label}>
                  <span title="Fictional" className={deadClass}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Heading>Legal</Heading>
            <ul>
              {FOOTER.columns.legal.map((label) => (
                <li key={label}>
                  <span title="Fictional" className={deadClass}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ShareBand />

        <div className="mt-8 flex flex-col gap-2 border-t border-hairline pt-8 text-[13px] text-mute md:flex-row md:justify-between">
          <p>{FOOTER.legalLine}</p>
          <p>{FOOTER.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}
