"use client";

import { create } from "zustand";
import { motionState, type SectionKey } from "./motion-state";

/**
 * Discrete UI state only. Continuous scroll values live in motionState so that
 * the rAF loop never touches React. Setters mirror what the 3D rig needs into
 * motionState, keeping a single write path.
 */
type UiStore = {
  scrolled: boolean;
  active: SectionKey;
  techIndex: number;
  navOpen: boolean;
  dialogOpen: boolean;
  sceneIndex: number;
  speaking: boolean;
  reduced: boolean;
  /** ?freeze=1 — deterministic capture mode (stops autoplay + timed motion) */
  freeze: boolean;
  /** ?og=1 — share-card composition */
  og: boolean;

  setCapture: (v: { freeze: boolean; og: boolean }) => void;
  setScroll: (v: {
    scrolled: boolean;
    active: SectionKey;
    techIndex: number;
  }) => void;
  setNavOpen: (v: boolean) => void;
  openDialog: (invoker?: HTMLElement | null) => void;
  closeDialog: () => void;
  setScene: (i: number, color: string) => void;
  setSpeaking: (v: boolean) => void;
  setReduced: (v: boolean) => void;
};

let dialogInvoker: HTMLElement | null = null;
export const getDialogInvoker = () => dialogInvoker;

export const useUi = create<UiStore>((set) => ({
  scrolled: false,
  active: "hero",
  techIndex: 0,
  navOpen: false,
  dialogOpen: false,
  sceneIndex: 0,
  speaking: false,
  reduced: false,
  freeze: false,
  og: false,

  setCapture: ({ freeze, og }) => {
    motionState.freeze = freeze;
    motionState.og = og;
    set({ freeze, og });
  },

  // called by the scroll engine only when one of the three values changed
  setScroll: (v) => set(v),

  setNavOpen: (v) => {
    motionState.navOpen = v ? 1 : 0;
    set({ navOpen: v });
  },

  /*
   * The modal is the top layer, so it takes the page from the menu rather than
   * stacking on it: two overlays with their own window-level Esc handler both
   * answered a single press, and focus ended up wherever the second one put it.
   */
  openDialog: (invoker) => {
    dialogInvoker = invoker ?? null;
    motionState.navOpen = 0;
    set({ dialogOpen: true, navOpen: false });
  },

  // the invoker is captured when the dialog opens, so dropping it on close is
  // safe and keeps a detached element from being held for the rest of the visit
  closeDialog: () => {
    dialogInvoker = null;
    set({ dialogOpen: false });
  },

  setScene: (i, color) => {
    motionState.sceneIndex = i;
    motionState.sceneColor = color;
    set({ sceneIndex: i });
  },

  setSpeaking: (v) => {
    motionState.speaking = v ? 1 : 0;
    set({ speaking: v });
  },

  setReduced: (v) => {
    motionState.reduced = v;
    set({ reduced: v });
  },
}));
