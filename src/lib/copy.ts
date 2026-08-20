/**
 * Copy deck — verbatim from docs/05-COPY-DECK.md.
 * Nothing here may be paraphrased: the strings are the deliverable.
 */

export const SITE = {
  title: "NOVA — Your intelligence. Everywhere.",
  description:
    "NOVA is a palm-sized personal AI device. Ask, remember, control — no screens needed. A concept study built with Next.js and React Three Fiber.",
  canonical: "https://nova.example.com/",
  ogImage: "/og.png",
  shareText:
    "NOVA — a palm-sized AI companion. Your intelligence. Everywhere.",
} as const;

export const NAV_LINKS = [
  { label: "Product", href: "#product", section: "reveal" },
  { label: "Technology", href: "#technology", section: "technology" },
  { label: "Experience", href: "#experience", section: "experience" },
  { label: "Specs", href: "#specs", section: "specs" },
] as const;

export const PRE_ORDER = "Pre-order";

/** mobile menu carries the offer next to the action (08-FIX WS1-5) */
export const NAV_OFFER = "$299 · Ships early 2027";

export const HERO = {
  kicker: "INTRODUCING NOVA",
  wordmark: "NOVA",
  tagline: ["Your intelligence.", "Everywhere."],
  /**
   * 05 改訂3: the price moved out of the definition and onto the button, so the
   * first screen answers "what is it" and "what do I do" in two separate beats.
   */
  definition: "A palm-sized AI companion. No screen — just your voice.",
  /**
   * Held on one line so a phone breaks after "companion." instead of leaving
   * the em dash stranded at either end of a line (WS-B6).
   */
  definitionKeep: "No screen — just",
  /** 05 改訂3: the fold carries the action it used to withhold */
  cta: { primary: "Pre-order · $299", ghost: "See the specs" },
  cue: "SCROLL",
} as const;

/**
 * `keep` is a substring rendered inside a nowrap span. It changes no
 * characters — it only stops a line from opening on the em dash (WS3-4).
 */
export const REVEAL_STEPS = [
  {
    kicker: "01 — ASK",
    heading: "Ask anything.",
    lead: "Four beamforming mics hear you across the room. The Neural Engine answers in under 300 milliseconds — no phone, no screen, no waiting.",
    keep: "milliseconds —",
  },
  {
    kicker: "02 — REMEMBER",
    heading: "Remember everything that matters.",
    lead: "Your schedule, your ideas, your people. NOVA holds the thread and recalls it exactly when you need it. Private by design.",
  },
  {
    kicker: "03 — CONTROL",
    heading: "Control your world.",
    lead: "Lights, locks, music, climate. One word from anywhere in the room, and your home follows.",
  },
] as const;

export const EXPERIENCE = {
  kicker: "AI EXPERIENCE",
  heading: "Talk to NOVA.",
  sub: "Five questions, zero screens. Tap one and watch it think.",
  /** 05 改訂2 state machine: LISTENING → THINKING → SPEAKING → READY */
  listening: "NOVA — LISTENING",
  thinking: "NOVA — THINKING",
  speaking: "NOVA — SPEAKING",
  ready: "NOVA — READY",
  /** shown until the first chip is pressed, then gone for good */
  placeholder:
    "Try one of the five prompts below — replies are simulated on-device.",
  turns: [
    {
      chip: "What’s on my schedule today?",
      reply:
        "Three meetings. The first is your design review at 10:30 — I’ve kept your focus block clear until then.",
    },
    {
      chip: "Translate “Where is the station?”",
      reply:
        "駅はどこですか — “Eki wa doko desu ka.” Want me to say it out loud when you need it?",
    },
    {
      chip: "Remind me about Yuki’s birthday.",
      reply:
        "Done. March 3rd, with a nudge one week early — enough time to find a proper gift.",
    },
    {
      chip: "Dim the lights, play some jazz.",
      reply:
        "Living room at 30 percent. “Midnight in Blue” is on the kitchen speaker.",
    },
    {
      chip: "I have an idea for the pitch.",
      reply:
        "Recording. I’ll shape it into notes and drop them into your pitch document.",
    },
  ],
} as const;

/** part = which exploded component the halo ring travels to (04-SPEC §Explode) */
export const TECH = {
  kicker: "TECHNOLOGY",
  heading: "Beneath the surface.",
  sub: "Precision hardware, engineered around a single ring of light.",
  items: [
    {
      name: "NOVA Neural Engine",
      body: "38 trillion operations per second, entirely on-device. Your data never has to leave.",
      part: "neural",
    },
    {
      name: "360° Voice Array",
      body: "Four beamforming microphones hear you at eight meters — even over music.",
      part: "voice",
    },
    {
      name: "Spatial Awareness",
      body: "Ultra-wideband presence sensing. NOVA knows the room, not just the request.",
      part: "spatial",
    },
    {
      name: "All-day Battery",
      body: "18 hours of conversation. 30 days on standby. Charged over coffee.",
      part: "battery",
    },
    {
      name: "Secure AI Processing",
      body: "A dedicated secure enclave encrypts every request, end to end.",
      part: "secure",
    },
  ],
} as const;

export type ScenePart = (typeof TECH.items)[number]["part"];

export const EVERYDAY = {
  kicker: "EVERYDAY",
  heading: "From sunrise to silence.",
  sub: "One device, four moments. NOVA fits the day you already have.",
  scenes: [
    {
      tab: "Morning",
      context: "07:15 — KITCHEN",
      quote:
        "“Good morning. Rain at nine — I moved your run to 7:15 and started the coffee.”",
      chips: ["Briefing", "Weather-aware plans", "Gentle wake"],
      color: "#ffb37a",
      icon: "sunrise",
    },
    {
      tab: "Work",
      context: "10:42 — STUDIO",
      quote:
        "“You’re in deep focus. I’m holding four notifications and drafting replies to two.”",
      chips: ["Focus guard", "Meeting notes", "Smart replies"],
      color: "#7c8cff",
      icon: "work",
    },
    {
      tab: "Travel",
      context: "18:03 — TERMINAL B",
      quote:
        "“Gate changed to B12. Your connection still works — taxi rebooked for 6:40.”",
      chips: ["Live rebooking", "Instant translate", "Local answers"],
      color: "#5fd3e6",
      icon: "travel",
    },
    {
      tab: "Home",
      context: "21:30 — LIVING ROOM",
      quote:
        "“Welcome back. Lights low, dinner playlist on. Your sister called — want the summary?”",
      chips: ["Scenes", "Call summaries", "Family voices"],
      color: "#bb8cff",
      icon: "home",
    },
  ],
} as const;

/**
 * Specs cells. `num` is the count-up target; `value` + `unit` are appended
 * verbatim so the rendered string equals the copy deck exactly
 * (e.g. 4 + "-mic" + " " + "array" → "4-mic array").
 */
export const SPECS = {
  kicker: "SPECIFICATIONS",
  heading: "Precision, specified.",
  footnote: "All figures are design targets for a fictional product.",
  rows: [
    {
      label: "Weight",
      num: 86,
      value: "",
      unit: "g",
      sub: "Anodized aluminium body",
    },
    {
      label: "Battery",
      num: 18,
      value: "",
      unit: "hrs",
      sub: "30-day standby",
    },
    {
      label: "Connectivity",
      num: null,
      value: "Wi-Fi 6E",
      unit: "· BT 5.4",
      sub: "Matter over Thread",
    },
    {
      label: "Microphones",
      num: 4,
      value: "-mic",
      unit: "array",
      sub: "Beamforming, 8 m range",
    },
    {
      label: "Charging",
      num: null,
      value: "USB-C",
      unit: "· Qi2",
      sub: "0–80% in 45 min",
    },
    {
      label: "Processor",
      num: null,
      value: "NOVA N1",
      unit: "",
      sub: "38-TOPS Neural Engine",
    },
  ],
} as const;

export const CTA = {
  heading: "Meet NOVA.",
  price: "$299",
  priceSub: "Ships early 2027 · Free engraving",
  button: PRE_ORDER,
  /** 05 改訂3: somewhere to go for the visitor who is not buying */
  ghost: "See the technology",
} as const;

/**
 * `bodyLead` + `bodyTail` concatenate to `body` verbatim; the tail is rendered
 * in a nowrap span because the deck forbids a line break inside it.
 */
export const DIALOG = {
  title: "A concept, for now.",
  body: "NOVA is a fictional product — this site is a design and engineering study. No pre-orders, just pixels.",
  bodyLead:
    "NOVA is a fictional product — this site is a design and engineering study. ",
  bodyTail: "No pre-orders, just pixels.",
  /**
   * 05 改訂4: primary = `forward` (the white pill, into Technology), secondary =
   * `copy` (ghost), and `button` / `dismiss` are the two exits. The strings are
   * unchanged from 改訂3 — only which one wears the pill moved.
   */
  copy: "Copy link",
  copied: "Copied",
  button: "Close",
  forward: "Explore the technology",
  dismiss: "Close dialog",
} as const;

export const FOOTER = {
  tag: "Your intelligence. Everywhere.",
  columns: {
    product: [
      { label: "Overview", href: "#hero" },
      { label: "Technology", href: "#technology" },
      { label: "Experience", href: "#experience" },
      { label: "Specs", href: "#specs" },
    ],
    company: ["About", "Careers", "Press"],
    legal: ["Privacy", "Terms"],
  },
  share: {
    label: "Share",
    native: "Share…",
    x: "Post on X",
    line: "LINE",
    copy: "Copy link",
    copied: "Copied",
    /**
     * 05 改訂3: the note has to describe the row the visitor can actually see.
     * Without navigator.share there is no share sheet to send them to.
     */
    noteShare:
      "Instagram and YouTube don’t accept shared links from the web — use the share sheet or copy the link.",
    noteCopy:
      "Instagram and YouTube don’t accept shared links from the web — copy the link instead.",
  },
  legalLine: "© 2026 NOVA. A design study — not a real product.",
  builtWith: "Built with Next.js + React Three Fiber",
} as const;

export const SHARE_URLS = {
  x: `https://x.com/intent/post?text=${encodeURIComponent(
    SITE.shareText,
  )}&url=${encodeURIComponent(SITE.canonical)}`,
  line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    SITE.canonical,
  )}`,
} as const;
