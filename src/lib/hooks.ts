"use client";

import { useEffect, useState, type RefObject } from "react";

/** Fires once when the element first intersects the viewport. */
export function useInViewOnce(
  ref: RefObject<HTMLElement | null>,
  rootMargin = "0px 0px -20% 0px",
) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, seen]);
  return seen;
}

/** True while the document is hidden (pauses autoplay). */
export function usePageHidden() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onChange = () => setHidden(document.visibilityState === "hidden");
    onChange();
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return hidden;
}
