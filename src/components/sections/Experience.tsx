"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EXPERIENCE } from "@/lib/copy";
import { useUi } from "@/lib/store";

/** LISTENING → THINKING → SPEAKING → READY (05 改訂2) */
type Phase = "listening" | "thinking" | "speaking" | "ready";

const STATE_LABEL: Record<Phase, string> = {
  listening: EXPERIENCE.listening,
  thinking: EXPERIENCE.thinking,
  speaking: EXPERIENCE.speaking,
  ready: EXPERIENCE.ready,
};

/** 16ms/char typewriter, driven by rAF so it stays frame-accurate. */
function Reply({
  text,
  reduced,
  onDone,
}: {
  text: string;
  reduced: boolean;
  onDone: () => void;
}) {
  const [n, setN] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (reduced) {
      setN(text.length);
      onDone();
      return;
    }
    let raf = 0;
    let start = 0;
    setN(0);
    const step = (t: number) => {
      if (!start) start = t;
      const chars = Math.min(text.length, Math.floor((t - start) / 16));
      setN(chars);
      if (chars < text.length) {
        raf = requestAnimationFrame(step);
      } else {
        onDone();
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text, reduced, onDone]);

  const done = n >= text.length;
  /*
   * The transcript is a polite live region, and a typewriter mutates it once
   * per frame — roughly a hundred announcements for one answer, each one
   * cutting off the last. The running text is therefore hidden from assistive
   * tech and only the finished sentence is exposed, which is a single
   * announcement of the whole reply. Sighted readers see no difference.
   */
  if (!done) {
    return (
      <span aria-hidden="true">
        {text.slice(0, n)}
        <span className="nova-caret text-accent-soft">|</span>
      </span>
    );
  }
  return <>{text}</>;
}

function Orb({ phase }: { phase: Phase }) {
  const speaking = phase === "speaking";
  return (
    <div
      aria-hidden="true"
      className="relative grid size-12 shrink-0 place-items-center"
    >
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(124,140,255,0.35),transparent_70%)]" />
      {speaking ? (
        <span className="relative flex h-5 items-end gap-[3px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="nova-eq-bar block h-5 w-[2px] rounded-full bg-accent-soft"
              style={
                {
                  "--d": `${i * 90}ms`,
                  transformOrigin: "bottom",
                } as React.CSSProperties
              }
            />
          ))}
        </span>
      ) : (
        <>
          <span className="nova-breathe absolute inset-[6px] rounded-full border border-accent-soft/70" />
          <span className="relative size-1.5 rounded-full bg-accent-soft" />
        </>
      )}
    </div>
  );
}

export default function Experience() {
  const reduced = useUi((s) => s.reduced);
  const freeze = useUi((s) => s.freeze);
  const setSpeaking = useUi((s) => s.setSpeaking);
  const [phase, setPhase] = useState<Phase>("listening");
  const [turn, setTurn] = useState<{ i: number; seq: number } | null>(null);
  const seq = useRef(0);
  const think = useRef<number | null>(null);

  const onDone = useCallback(() => {
    setPhase("ready");
    setSpeaking(false);
  }, [setSpeaking]);

  // never leave the rig pulsing if the section unmounts mid-reply
  useEffect(
    () => () => {
      if (think.current) window.clearTimeout(think.current);
      setSpeaking(false);
    },
    [setSpeaking],
  );

  const ask = (i: number) => {
    seq.current += 1;
    // the question lands at once; only the answer waits for the thinking beat
    setTurn({ i, seq: seq.current });
    setPhase("thinking");
    setSpeaking(true);
    if (think.current) window.clearTimeout(think.current);
    // capture mode holds the beat long enough to be photographed: 460ms is
    // shorter than a verified screenshot takes, which is how loop 2 shipped a
    // "THINKING" frame that was really the finished reply (WS-E1)
    think.current = window.setTimeout(
      () => setPhase("speaking"),
      reduced ? 0 : freeze ? 3000 : 460,
    );
  };

  const active = turn ? EXPERIENCE.turns[turn.i] : null;
  const showTranscript = phase !== "listening";

  return (
    <section
      id="experience"
      data-section="experience"
      className="relative z-10 flex min-h-screen flex-col justify-center pb-24 pt-[104px] md:py-32"
    >
      <div className="nova-shell">
        <div className="nova-scrim nova-scrim-soft mx-auto max-w-3xl text-center">
          <p className="nova-label text-accent-soft">{EXPERIENCE.kicker}</p>
          <h2 className="nova-h2 mt-5">{EXPERIENCE.heading}</h2>
          <p className="nova-lead mx-auto mt-5 text-center">{EXPERIENCE.sub}</p>
        </div>

        {/* the panel is opaque enough to read as a surface, not as a window the
            3D can shine through (WS2-1) */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-hairline bg-[#0a0b10]/92 p-5 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.9)] backdrop-blur-2xl md:mt-14 md:p-8">
          {/* state row */}
          <div className="flex items-center gap-4 border-b border-hairline pb-5">
            <Orb phase={phase} />
            <span data-testid="chat-status" className="nova-label text-dim">
              {STATE_LABEL[phase]}
            </span>
          </div>

          {/* transcript — min-height keeps CLS at 0 without leaving a void */}
          <div
            data-testid="chat-transcript"
            aria-live="polite"
            aria-atomic="false"
            className={`relative flex min-h-[132px] flex-col gap-3 py-5 md:min-h-[168px] ${
              showTranscript ? "justify-start" : "justify-center"
            }`}
          >
            {showTranscript ? (
              <>
                {active ? (
                  <p
                    data-testid="chat-user"
                    className="max-w-[88%] self-end rounded-2xl rounded-br-md bg-white/[0.06] px-4 py-2.5 text-right text-[15px] leading-relaxed text-fg"
                  >
                    {active.chip}
                  </p>
                ) : null}
                {phase === "thinking" ? (
                  <span
                    aria-hidden="true"
                    className="flex items-center gap-1.5 self-start py-2 pl-1"
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="nova-think-dot block size-1.5 rounded-full bg-accent-soft"
                        style={
                          { "--d": `${i * 160}ms` } as React.CSSProperties
                        }
                      />
                    ))}
                  </span>
                ) : null}
                {active && phase !== "thinking" ? (
                  <p
                    data-testid="chat-reply"
                    className="max-w-[92%] self-start pl-1 text-left text-[15px] leading-relaxed text-body"
                  >
                    <Reply
                      key={turn?.seq}
                      text={active.reply}
                      reduced={reduced}
                      onDone={onDone}
                    />
                  </p>
                ) : null}
              </>
            ) : (
              /* left, on the same edge NOVA's answers will appear on — the
                 placeholder is the first line of the transcript, not a caption
                 floating in the middle of an empty panel (WS-B4) */
              <p
                data-testid="chat-placeholder"
                className="max-w-[68ch] pl-1 text-left text-[14px] leading-relaxed text-mute [text-wrap:pretty]"
              >
                {EXPERIENCE.placeholder}
              </p>
            )}
          </div>

          {/* question chips — a grid, so five uneven labels still line up. The
              fifth spans both columns instead of leaving a hole beside it. */}
          <div className="grid grid-cols-1 gap-2 border-t border-hairline pt-6 sm:grid-cols-2 sm:gap-2.5">
            {EXPERIENCE.turns.map((t, i) => {
              const on = turn?.i === i;
              return (
                <button
                  key={t.chip}
                  type="button"
                  data-testid="chat-chip"
                  onClick={() => ask(i)}
                  aria-pressed={on}
                  /* shared selected token: white/8 fill, white ink, lit edge —
                     the accent detail here is the dot (WS-D1) */
                  className={`nova-tap inline-flex h-[45px] w-full items-center justify-start gap-3 rounded-full border px-4 text-left text-[13px] transition-colors duration-200 ${
                    i === EXPERIENCE.turns.length - 1 ? "sm:col-span-2" : ""
                  } ${
                    on
                      ? "nova-pick"
                      : "border-hairline text-body hover:bg-white/[0.06] hover:text-fg"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`size-1.5 shrink-0 rounded-full transition-colors duration-200 ${
                      on ? "bg-accent-soft" : "bg-white/20"
                    }`}
                  />
                  {t.chip}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
