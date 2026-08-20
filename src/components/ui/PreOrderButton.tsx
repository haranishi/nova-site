"use client";

import { motionState } from "@/lib/motion-state";
import { useUi } from "@/lib/store";
import { PRE_ORDER } from "@/lib/copy";

type Props = {
  /** nav bar · CTA section · hero fold — three sizes of the same action */
  variant: "nav" | "hero" | "fold";
  testId: string;
  /** defaults to `Pre-order`; the hero carries the price on the button (05改訂3) */
  label?: string;
  className?: string;
};

const SIZE: Record<Props["variant"], string> = {
  /* 45px at every width: a 768 tablet gets the desktop bar and a finger, so
     the bar's own button cannot be the one control that misses the floor */
  nav: "h-[45px] px-5 text-[13px]",
  hero: "h-14 px-10 text-[16px]",
  fold: "h-[50px] px-6 text-[15px] sm:px-8",
};

/**
 * The page's buy action. `hero` (CTA section) also drives the ring's hover
 * bloom; the other two are the same button at nav and fold scale.
 */
export default function PreOrderButton({
  variant,
  testId,
  label,
  className,
}: Props) {
  const openDialog = useUi((s) => s.openDialog);

  const base =
    "nova-tap relative inline-flex items-center justify-center whitespace-nowrap rounded-full bg-white font-semibold text-[#050507] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] active:scale-[0.97]";

  return (
    <button
      type="button"
      data-testid={testId}
      className={`${base} ${SIZE[variant]} nova-shine hover:scale-[1.03] hover:shadow-[0_0_28px_-6px_rgba(124,140,255,0.55)] ${className ?? ""}`}
      onClick={(e) => openDialog(e.currentTarget)}
      onPointerEnter={() => {
        if (variant === "hero") motionState.ctaHover = 1;
      }}
      onPointerLeave={() => {
        if (variant === "hero") motionState.ctaHover = 0;
      }}
      onFocus={() => {
        if (variant === "hero") motionState.ctaHover = 1;
      }}
      onBlur={() => {
        if (variant === "hero") motionState.ctaHover = 0;
      }}
    >
      <span className="relative z-[2]">{label ?? PRE_ORDER}</span>
    </button>
  );
}
