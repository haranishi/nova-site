"use client";

import { useEffect, useRef, useState } from "react";
import { SPECS } from "@/lib/copy";
import { useInViewOnce } from "@/lib/hooks";
import { useUi } from "@/lib/store";

export default function Specs() {
  const grid = useRef<HTMLDivElement>(null);
  const seen = useInViewOnce(grid);
  const reduced = useUi((s) => s.reduced);
  const freeze = useUi((s) => s.freeze);
  /** 0..1 count-up progress; starts settled so SSR/no-JS shows real numbers */
  const [k, setK] = useState(1);
  /** true only when the grid was still off screen at mount (see below) */
  const armed = useRef(false);

  useEffect(() => {
    // capture mode wants the settled figures, same as reduced motion: a share
    // shot or a scoring frame must never catch the numbers mid-count
    if (reduced || freeze) {
      setK(1);
      return;
    }
    if (!seen) {
      /*
       * Only arm the count-up if the reader cannot see the grid yet. Landing
       * straight on /#specs used to blank every figure to 0 for a frame — the
       * server had already rendered the real numbers — and then count back up,
       * which reads as a glitch rather than as an animation.
       */
      const el = grid.current;
      armed.current = !el || el.getBoundingClientRect().top > window.innerHeight;
      if (armed.current) setK(0);
      return;
    }
    if (!armed.current) {
      setK(1);
      return;
    }
    let raf = 0;
    let t0 = 0;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / 800);
      setK(1 - Math.pow(1 - p, 4));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduced, freeze, seen]);

  return (
    <section
      id="specs"
      data-section="specs"
      /* the anchor lands with scroll-margin 88px; a further 136/200px of
         padding on top of that put the heading a third of the way down an
         empty screen. The section keeps its generous bottom, not its top. */
      className="relative z-10 pb-[112px] pt-[64px] md:pb-[176px] md:pt-[96px]"
    >
      <div className="nova-shell">
        <p className="nova-label text-accent-soft">{SPECS.kicker}</p>
        <h2 className="nova-h2 mt-5">{SPECS.heading}</h2>

        <div
          ref={grid}
          className="mt-16 grid grid-cols-1 gap-x-12 md:grid-cols-2 lg:grid-cols-3"
        >
          {SPECS.rows.map((row) => (
            <div
              key={row.label}
              data-spec-cell
              className="border-t border-hairline pb-9 pt-6"
            >
              <p className="nova-label text-dim">{row.label}</p>
              <p
                className="mt-4 font-display tabular-nums text-fg"
                style={{
                  fontSize: 40,
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >
                {row.num !== null ? Math.round(row.num * k) : null}
                {row.value}
                {row.unit ? (
                  /* the unit carries its own leading space at 16px, widened to
                     0.4em: value·unit gaps and both sides of the interpunct end
                     up even instead of the middot hugging the next word (WS3-5) */
                  <span
                    className="text-[16px] font-normal text-dim"
                    style={{ wordSpacing: "0.14em" }}
                  >
                    {" "}
                    {row.unit}
                  </span>
                ) : null}
              </p>
              <p className="mt-2.5 text-[13px] leading-relaxed text-dim">
                {row.sub}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-[13px] leading-relaxed text-mute">
          {SPECS.footnote}
        </p>
      </div>
    </section>
  );
}
