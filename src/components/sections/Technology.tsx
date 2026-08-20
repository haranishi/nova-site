"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TECH } from "@/lib/copy";
import { useUi } from "@/lib/store";

export default function Technology() {
  const index = useUi((s) => s.techIndex);
  const reduced = useUi((s) => s.reduced);
  const active = TECH.items[index];

  return (
    <section
      id="technology"
      data-section="technology"
      className="relative z-10 h-[210vh] md:h-[220vh] lg:h-[300vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* 768: the text column is held at ≥380px so the H2 never leaves "the"
            alone on a line, and the device moves into the free right band */}
        <div className="nova-shell flex h-full flex-col justify-center pt-[88px] md:grid md:grid-cols-[minmax(380px,46%)_minmax(0,1fr)] md:items-center md:pt-0 lg:grid-cols-[minmax(0,40%)_minmax(0,60%)]">
          {/* text column */}
          <div className="nova-scrim nova-scrim-soft md:pr-8">
            <p className="nova-label text-accent-soft">{TECH.kicker}</p>
            <h2 className="nova-h2 mt-5">{TECH.heading}</h2>
            {/* restored on 390 (one intro line), stepped so it stays 2 lines */}
            <p className="nova-lead mt-5 text-[15px] md:text-[17px] lg:text-[20px]">
              {TECH.sub}
            </p>

            {/* desktop: full list, active row expands */}
            <ul className="mt-12 hidden border-b border-hairline md:block">
              {TECH.items.map((item, i) => {
                const on = i === index;
                return (
                  <li
                    key={item.name}
                    data-tech-item
                    data-index={i}
                    data-active={on ? "true" : "false"}
                    className="relative border-t border-hairline py-4"
                  >
                    {/* same selected token as the Everyday tabs and the chat
                        chips: white/8 fill, white ink, one accent detail —
                        here the number plus the marker in the margin (WS-D1) */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 bg-white/[0.08] transition-opacity duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] ${
                        on ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute -left-3 inset-y-2 block w-[2px] rounded-full bg-accent-soft transition-opacity duration-500 ${
                        on ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div className="relative flex items-baseline gap-5">
                      <span
                        className={`nova-label w-6 shrink-0 transition-colors duration-300 ${
                          on ? "text-accent-soft" : "text-faint"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-display text-[20px] leading-snug tracking-[-0.02em] transition-colors duration-300 ${
                          on ? "text-fg" : "text-faint"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div
                      className="relative grid overflow-hidden pl-11 transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)]"
                      style={{
                        gridTemplateRows: on ? "1fr" : "0fr",
                        opacity: on ? 1 : 0,
                      }}
                    >
                      <p className="min-h-0 pt-2 text-[14px] leading-relaxed text-dim">
                        {item.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* right column keeps the stage clear for the exploded device */}
          <div aria-hidden="true" className="hidden md:block" />

          {/* mobile: breathing room for the 3D, then the active item */}
          <div className="mt-8 md:hidden">
            <div className="h-[32vh]" aria-hidden="true" />
            <ul className="nova-scrim nova-scrim-soft relative min-h-[128px]">
              <AnimatePresence initial={false} mode="wait">
                <motion.li
                  key={active.name}
                  data-tech-item-mobile
                  data-index={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.4 }}
                >
                  <span className="nova-label text-accent-soft">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 font-display text-[22px] leading-snug tracking-[-0.02em] text-fg">
                    {active.name}
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-dim">
                    {active.body}
                  </p>
                </motion.li>
              </AnimatePresence>
            </ul>
            {/* progress: five segments thick enough to read as a scale */}
            <div className="mt-7 flex gap-1.5" aria-hidden="true">
              {TECH.items.map((item, i) => (
                <span
                  key={item.name}
                  className={`h-[5px] flex-1 rounded-full transition-colors duration-300 ${
                    i === index ? "bg-accent-soft" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
