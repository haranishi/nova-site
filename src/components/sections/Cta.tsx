"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import { CTA } from "@/lib/copy";
import { scrollToTarget } from "@/lib/scroll-engine";
import { useUi } from "@/lib/store";
import PreOrderButton from "../ui/PreOrderButton";

const MAGNET = 8;

export default function Cta() {
  const reduced = useUi((s) => s.reduced);
  const zone = useRef<HTMLDivElement>(null);
  /** measured once per hover, not once per pointer sample (see below) */
  const box = useRef<DOMRect | null>(null);
  const spring = { stiffness: 210, damping: 20, mass: 0.4 };
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  /*
   * getBoundingClientRect forces layout, and pointermove fires far more often
   * than the box changes — the magnet was making the browser re-layout on
   * every mouse sample. The rect is cached while the pointer is inside and
   * dropped whenever it can go stale: the page scrolls, the window resizes, or
   * the pointer leaves and comes back.
   */
  useEffect(() => {
    const clear = () => {
      box.current = null;
    };
    window.addEventListener("resize", clear);
    window.addEventListener("scroll", clear, { passive: true });
    return () => {
      window.removeEventListener("resize", clear);
      window.removeEventListener("scroll", clear);
    };
  }, []);

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== "mouse" || !zone.current) return;
    const r = (box.current ??= zone.current.getBoundingClientRect());
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    x.set(Math.max(-1, Math.min(1, dx)) * MAGNET);
    y.set(Math.max(-1, Math.min(1, dy)) * MAGNET);
  };

  const reset = () => {
    box.current = null;
    x.set(0);
    y.set(0);
  };

  return (
    <section
      id="pre-order"
      data-section="cta"
      /* one screen, not 110vh: the heading clears the nav by 56px and the whole
         composition (heading · device · price · action) fits a single frame */
      className="relative z-10 flex min-h-screen flex-col items-center justify-between pb-[8vh] pt-[120px] text-center"
    >
      {/* headline top, price + action bottom — the device and its ring own the
          middle band of the viewport (骨格: CTAの最大要素はデバイス+価格) */}
      <div className="nova-shell flex w-full flex-col items-center">
        <h2
          className="nova-scrim nova-scrim-soft font-display text-fg"
          style={{
            fontSize: "clamp(56px, 10vw, 120px)",
            fontWeight: 500,
            letterSpacing: "-0.04em",
            lineHeight: 0.92,
          }}
        >
          {CTA.heading}
        </h2>
      </div>

      <div
        className="nova-shell flex w-full flex-col items-center"
        ref={zone}
        onPointerEnter={reset}
        onPointerMove={onMove}
        onPointerLeave={reset}
      >
        {/* the price is the second-largest type on the page, as it should be */}
        <p className="nova-scrim nova-scrim-soft flex flex-col items-center gap-y-1.5">
          <span
            className="font-display tabular-nums text-fg"
            style={{
              fontSize: "clamp(48px, 9vw, 60px)",
              fontWeight: 500,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {CTA.price}
          </span>
          <span className="text-[14px] text-mute">{CTA.priceSub}</span>
        </p>

        <motion.div style={{ x, y }} className="mt-7">
          <PreOrderButton variant="hero" testId="cta-preorder" />
        </motion.div>

        {/* the page must not dead-end for someone who is not buying (05 改訂3) */}
        <a
          href="#technology"
          data-testid="cta-technology"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget("#technology");
          }}
          className="nova-ghost nova-tap mt-4 h-[46px] px-6 text-[14px]"
        >
          {CTA.ghost}
        </a>
      </div>
    </section>
  );
}
