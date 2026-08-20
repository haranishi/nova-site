"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { HERO } from "@/lib/copy";
import { clamp01, onTick } from "@/lib/motion-state";
import { scrollToTarget } from "@/lib/scroll-engine";
import PreOrderButton from "../ui/PreOrderButton";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** renders `text` with `keep` held on one line; the string itself is untouched */
function Keep({ text, keep }: { text: string; keep: string }) {
  const i = text.indexOf(keep);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="whitespace-nowrap">{keep}</span>
      {text.slice(i + keep.length)}
    </>
  );
}

export default function Hero() {
  const letters = HERO.wordmark.split("");
  const cue = useRef<HTMLDivElement>(null);

  /*
   * The cue is an instruction, and once it has been followed it is noise. It
   * leaves over the first fifth of a screen — the wrapper carries the scroll
   * opacity because the intro `nova-fade` animation outranks inline styles.
   */
  useEffect(
    () =>
      onTick((m) => {
        const el = cue.current;
        if (!el) return;
        el.style.opacity = clamp01(1 - m.y / (m.vh * 0.2)).toFixed(3);
      }),
    [],
  );

  return (
    <section
      id="hero"
      data-section="hero"
      className="relative z-10 flex h-screen min-h-[640px] flex-col items-center justify-start overflow-hidden pt-[13vh] md:pt-[11vh]"
    >
      <div
        data-hero-stack
        className="nova-shell flex flex-col items-center text-center"
      >
        <p
          className="nova-fade nova-label inline-flex min-h-8 items-center rounded-full border border-hairline px-4 py-2 text-dim"
          style={delay(0)}
        >
          {HERO.kicker}
        </p>

        <h1
          className="mt-8 font-display"
          style={{
            fontSize: "clamp(88px, 15vw, 190px)",
            fontWeight: 600,
            letterSpacing: "-0.045em",
            lineHeight: 0.86,
          }}
        >
          <span className="nova-mask">
            {letters.map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="nova-rise nova-ink"
                style={delay(140 + i * 30)}
              >
                {c}
              </span>
            ))}
          </span>
        </h1>

        <div
          className="nova-scrim-soft mt-6 font-sans font-light text-body"
          style={{
            fontSize: "clamp(20px, 2.6vw, 28px)",
            lineHeight: 1.28,
            letterSpacing: "-0.01em",
          }}
        >
          {HERO.tagline.map((line, i) => (
            <span key={line} className="nova-mask">
              <span className="nova-rise" style={delay(520 + i * 70)}>
                {line}
              </span>
            </span>
          ))}
        </div>

        {/* what it is, in one line — the price now travels on the button */}
        <p
          className="nova-fade nova-scrim-soft mt-5 max-w-[34ch] text-[15px] leading-relaxed text-mute md:max-w-none"
          style={delay(760)}
          data-hero-definition
          data-testid="hero-definition"
        >
          <Keep text={HERO.definition} keep={HERO.definitionKeep} />
        </p>

        {/*
          The fold ends on an action (05 改訂3). Both controls stay well under
          the wordmark in weight: the page's largest element is still NOVA.
        */}
        <div
          data-hero-cta
          className="nova-fade nova-scrim-soft mt-8 flex items-center justify-center gap-3"
          style={delay(900)}
        >
          <PreOrderButton
            variant="fold"
            testId="hero-preorder"
            label={HERO.cta.primary}
          />
          <a
            href="#specs"
            data-testid="hero-specs"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("#specs");
            }}
            className="nova-ghost nova-tap h-[50px] px-5 text-[15px] sm:px-7"
          >
            {HERO.cta.ghost}
          </a>
        </div>
      </div>

      {/* cue moved out of the device's column onto the container gutter, so the
          line never crosses the metal rim at any width (WS5-3) */}
      <div
        ref={cue}
        data-hero-cue
        className="pointer-events-none absolute inset-x-0 bottom-8"
      >
        <div
          className="nova-fade nova-shell flex flex-col items-start gap-3"
          style={delay(1020)}
        >
          <span
            aria-hidden="true"
            className="nova-cue-line block h-12 w-px bg-gradient-to-b from-transparent via-white/70 to-white/10"
          />
          <span
            className="nova-label text-dim"
            style={{ fontSize: 10, letterSpacing: "0.3em" }}
          >
            {HERO.cue}
          </span>
        </div>
      </div>
    </section>
  );
}
