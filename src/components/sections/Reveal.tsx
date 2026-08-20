"use client";

import { useEffect, useRef } from "react";
import { REVEAL_STEPS } from "@/lib/copy";
import { clamp01, onTick, smoothstep } from "@/lib/motion-state";

/**
 * Desktop placement per step: left → right → centre. Every step keeps kicker,
 * heading and lead on a single alignment edge (WS3-1) — the block moves, the
 * text edge never does.
 *
 * Step 2 sits on the right but reads left-to-right: loop 2 set the whole block
 * `text-right`, which made the lead's ragged left edge the thing the eye had to
 * find on every line. Step 3 is symmetric instead of "left text in a centred
 * box", which is what left it hanging at x411 / x139 with nothing to align to.
 *
 * The side-by-side composition is `lg` and up only (周4ミニ / 修正1). A
 * two-column stage needs a column the device can live in, and 768–1023px does
 * not have one: at 768 the free half is 300-odd px, so the device either
 * crossed the heading (`768-reveal-50pct`) or hung off the right edge
 * (`768-reveal-15pct`). The tablet band takes the phone's composition instead —
 * device above, text below, both on the centre line — which is the same shape
 * at 768 as it is at 390 and needs no lateral room at all.
 */
const BLOCK = [
  "lg:mr-auto lg:w-[54%]",
  "lg:ml-auto lg:w-[50%]",
  "lg:mx-auto lg:w-[58%] lg:text-center",
] as const;

/** the lead never re-centres itself inside the block — it hugs the same edge */
const LEAD = ["mr-auto", "mr-auto", "mr-auto lg:mx-auto"] as const;

/** renders `text` with `keep` held on one line; the string itself is untouched */
function Lead({ text, keep }: { text: string; keep?: string }) {
  const i = keep ? text.indexOf(keep) : -1;
  if (!keep || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="whitespace-nowrap">{keep}</span>
      {text.slice(i + keep.length)}
    </>
  );
}

export default function Reveal() {
  const bands = useRef<(HTMLDivElement | null)[]>([]);
  const fill = useRef<HTMLSpanElement>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(
    () =>
      onTick((m) => {
        const p = m.pin.reveal;
        /*
         * Hand-off from the hero (WS-C2). A sticky child cannot paint above its
         * section, so until the section reaches the top of the window the first
         * band is parked below the fold and the viewport is simply black. The
         * band is lifted by exactly the distance the section still has to
         * travel — it holds its final position while the page keeps moving —
         * and cross-fades in over the last ~0.4 screens of the approach. Zero
         * offset the moment the pin starts, so nothing jumps.
         */
        const ahead = Math.min(0, m.pinPx.reveal);
        // window measured in screens, so it lands identically at 390/768/1440:
        // fully lit ~0.36 screens before the pin starts, which is the moment
        // the hero's own copy has finished passing under the bar
        const preroll = smoothstep(-0.53, -0.36, m.pinPx.reveal / m.vh);

        for (let i = 0; i < REVEAL_STEPS.length; i++) {
          const el = bands.current[i];
          if (!el) continue;
          const local = clamp01((p - i / 3) * 3);
          const enter =
            i === 0
              ? Math.max(smoothstep(0, 0.15, local), preroll)
              : smoothstep(0, 0.15, local);
          const leave = smoothstep(0.85, 1, local);
          const o = enter * (1 - leave);
          el.style.opacity = o.toFixed(3);
          const shift = 24 * (1 - enter) - 24 * leave + ahead;
          el.style.transform = `translate3d(0,${shift.toFixed(2)}px,0)`;
        }
        if (fill.current) {
          fill.current.style.transform = `scaleY(${p.toFixed(4)})`;
        }
        const step = Math.min(2, Math.floor(p * 3 + 0.0001));
        for (let i = 0; i < 3; i++) {
          const dot = dots.current[i];
          if (dot) dot.style.opacity = i === step ? "1" : "0.25";
        }
      }),
    [],
  );

  return (
    <section
      id="product"
      data-section="reveal"
      /* shorter run than loop 2 (1440: 2880 → 2160px). Each band still holds
         for ~0.47 screens of scroll, which is a full read at these line counts,
         but the section no longer costs a third of the page's travel. */
      className="relative z-10 h-[200vh] md:h-[220vh] lg:h-[240vh]"
    >
      {/* not clipped: the first band is drawn above this box while the section
          is still approaching (see the hand-off above) */}
      <div className="sticky top-0 h-screen">
        {REVEAL_STEPS.map((step, i) => (
          <div
            key={step.kicker}
            ref={(el) => {
              bands.current[i] = el;
            }}
            data-band={i}
            data-testid={`reveal-band-${i}`}
            className="pointer-events-none absolute inset-0 flex items-end pb-[10vh] lg:items-center lg:pb-0"
            style={{ opacity: 0, willChange: "opacity, transform" }}
          >
            <div className="nova-shell">
              <div className={`nova-scrim w-full text-left ${BLOCK[i]}`}>
                <p className="nova-label text-accent-soft">{step.kicker}</p>
                <h2
                  className="mt-5 font-display"
                  style={{
                    fontSize: "clamp(38px, 6.5vw, 84px)",
                    fontWeight: 500,
                    letterSpacing: "-0.035em",
                    lineHeight: 0.98,
                  }}
                >
                  {step.heading}
                </h2>
                <p
                  className={`nova-lead mt-6 max-w-none lg:max-w-[44ch] ${LEAD[i]}`}
                >
                  <Lead
                    text={step.lead}
                    keep={"keep" in step ? step.keep : undefined}
                  />
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* progress rail — desktop only, pulled inside the 40px gutter (WS3-7) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-10 top-1/2 hidden h-[40vh] w-[1.5px] -translate-y-1/2 bg-white/10 lg:block"
        >
          <span
            ref={fill}
            className="absolute inset-0 block origin-top bg-gradient-to-b from-accent to-accent-soft"
            style={{ transform: "scaleY(0)" }}
          />
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              ref={(el) => {
                dots.current[i] = el;
              }}
              className="absolute left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-soft transition-opacity duration-300"
              style={{ top: `${i * 50}%`, opacity: i === 0 ? 1 : 0.25 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
