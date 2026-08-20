# NOVA — scoring screenshots (loop 3)

generated: 2026-08-18T10:36:26.890Z
widths: 1440×900 / 768×1024 / 390×844 · deviceScaleFactor 1

## Read this before scoring

- **The 3D device does not appear in the `*-fullpage.png` files.** Those are
  structure references only: the fixed WebGL layer and the fixed nav are
  hidden while capturing them, otherwise a fixed canvas smears down a
  9000px tall page. Judge the 3D from the viewport shots.
- Pinned sections (Product Reveal, Technology) only show their middle states
  mid-travel, so each has shots at several scroll percentages. A band that
  looks empty at 15% is intended — compare with the 50% shot.
- Screenshots were taken after a full staged scroll down and back up, so
  every in-view trigger has already fired.
- The 3D is verified twice per frame: the render loop is proven to be
  advancing (a frame counter the page exposes on `window`) and the frame is
  compared against a canvas-hidden baseline to catch a dropped compositor
  layer. A width whose WebGL context dies — including one that reports
  `webglcontextlost` and falls back to CSS — is thrown away and retaken, so
  a missing device in these shots is a real composition problem, never a
  capture artifact.
- **Loop 2**: every scroll target is nav-aware (the same -64px basis the
  site's own anchors use) and pages run with `?freeze=1`, which holds the
  float, idle spin, breathing and particles. Frames are therefore
  repeatable, and nothing sits under the fixed bar by accident.
- Sections taller than the band below the nav are photographed at both
  ends (`-top` / `-bottom`) instead of once through the middle.
- **Loop 3** removes two false frames. `experience-thinking` used to come
  out byte-identical to `experience-replied`, because the 460ms thinking
  beat expired while the verified screenshot was still being taken; in
  capture mode the beat is now held for 3s and the frame waits on the
  thinking dots themselves. `nav-scrolled` is now parked with the wordmark
  half under the bar, so the frosted blur and the hairline are actually
  visible instead of being photographed against plain black.
- **Loop 3, code review**: the frame that passes the canvas check is now the
  frame that gets written. The previous pass kept whichever of the three
  attempts produced the largest PNG, which could hand the shot to an
  unverified frame purely because it compressed worse.
- **Loop 3, capture hole**: a liveness check cannot see a context that came
  up and drew nothing, and a missing canvas used to be read as a working CSS
  fallback — together that let one width ship without a device. Each width
  now measures the brightest pixel of the hero's device band on the canvas
  itself and fails below 80. This run measured: 1440 max 255.0 / avg 13.2 · 768 max 255.0 / avg 24.2 · 390 max 255.0 / avg 25.7.

| file | width | section | progress | action / notes |
|---|---|---|---|---|
| `1440-nav-top.png` | 1440 | nav | 0% | nav transparent over hero |
| `1440-hero-default.png` | 1440 | hero | 0% | wordmark + tagline + scroll cue |
| `1440-nav-scrolled.png` | 1440 | nav | — | nav blurred + hairline over the wordmark (data-scrolled) |
| `1440-reveal-15pct.png` | 1440 | reveal | 15% | pinned band 1 of 3 |
| `1440-reveal-50pct.png` | 1440 | reveal | 50% | pinned band 2 of 3 |
| `1440-reveal-85pct.png` | 1440 | reveal | 85% | pinned band 3 of 3 |
| `1440-experience-idle.png` | 1440 | experience | 50% | panel listening, placeholder shown, no reply yet |
| `1440-experience-thinking.png` | 1440 | experience | 50% | chip 1 tapped, NOVA — THINKING |
| `1440-experience-replied.png` | 1440 | experience | 50% | reply typed out, NOVA — READY |
| `1440-technology-20pct.png` | 1440 | technology | 20% | exploded view + active item |
| `1440-technology-50pct.png` | 1440 | technology | 50% | exploded view + active item |
| `1440-technology-80pct.png` | 1440 | technology | 80% | exploded view + active item |
| `1440-everyday-default.png` | 1440 | everyday | 50% | Morning scene (tab 1) |
| `1440-everyday-tab2.png` | 1440 | everyday | 50% | Work scene (tab 2) |
| `1440-specs-top.png` | 1440 | specs | 0% | spec grid from its anchor (kicker + first cells) |
| `1440-specs-bottom.png` | 1440 | specs | 100% | last cells + footnote |
| `1440-cta-default.png` | 1440 | cta | 50% | device + price + primary action |
| `1440-footer-top.png` | 1440 | footer | 0% | footer logo, tag and column heads |
| `1440-footer-bottom.png` | 1440 | footer | 100% | share block + legal line at the page end |
| `1440-dialog-open.png` | 1440 | dialog | 50% | pre-order dialog (fiction disclosure) |
| `1440-page-fullpage.png` | 1440 | whole page | — | structure only — 3D layer and nav hidden on purpose |
| `768-nav-top.png` | 768 | nav | 0% | nav transparent over hero |
| `768-hero-default.png` | 768 | hero | 0% | wordmark + tagline + scroll cue |
| `768-nav-scrolled.png` | 768 | nav | — | nav blurred + hairline over the wordmark (data-scrolled) |
| `768-reveal-15pct.png` | 768 | reveal | 15% | pinned band 1 of 3 |
| `768-reveal-50pct.png` | 768 | reveal | 50% | pinned band 2 of 3 |
| `768-reveal-85pct.png` | 768 | reveal | 85% | pinned band 3 of 3 |
| `768-experience-idle.png` | 768 | experience | 50% | panel listening, placeholder shown, no reply yet |
| `768-experience-thinking.png` | 768 | experience | 50% | chip 1 tapped, NOVA — THINKING |
| `768-experience-replied.png` | 768 | experience | 50% | reply typed out, NOVA — READY |
| `768-technology-20pct.png` | 768 | technology | 20% | exploded view + active item |
| `768-technology-50pct.png` | 768 | technology | 50% | exploded view + active item |
| `768-technology-80pct.png` | 768 | technology | 80% | exploded view + active item |
| `768-everyday-default.png` | 768 | everyday | 50% | Morning scene (tab 1) |
| `768-everyday-tab2.png` | 768 | everyday | 50% | Work scene (tab 2) |
| `768-specs-top.png` | 768 | specs | 0% | spec grid from its anchor (kicker + first cells) |
| `768-specs-bottom.png` | 768 | specs | 100% | last cells + footnote |
| `768-cta-default.png` | 768 | cta | 50% | device + price + primary action |
| `768-footer-top.png` | 768 | footer | 0% | footer logo, tag and column heads |
| `768-footer-bottom.png` | 768 | footer | 100% | share block + legal line at the page end |
| `768-dialog-open.png` | 768 | dialog | 50% | pre-order dialog (fiction disclosure) |
| `768-page-fullpage.png` | 768 | whole page | — | structure only — 3D layer and nav hidden on purpose |
| `390-nav-top.png` | 390 | nav | 0% | nav transparent over hero |
| `390-hero-default.png` | 390 | hero | 0% | wordmark + tagline + scroll cue |
| `390-nav-scrolled.png` | 390 | nav | — | nav blurred + hairline over the wordmark (data-scrolled) |
| `390-reveal-15pct.png` | 390 | reveal | 15% | pinned band 1 of 3 |
| `390-reveal-50pct.png` | 390 | reveal | 50% | pinned band 2 of 3 |
| `390-reveal-85pct.png` | 390 | reveal | 85% | pinned band 3 of 3 |
| `390-experience-idle.png` | 390 | experience | 50% | panel listening, placeholder shown, no reply yet |
| `390-experience-thinking.png` | 390 | experience | 50% | chip 1 tapped, NOVA — THINKING |
| `390-experience-replied.png` | 390 | experience | 50% | reply typed out, NOVA — READY |
| `390-technology-20pct.png` | 390 | technology | 20% | exploded view + active item |
| `390-technology-50pct.png` | 390 | technology | 50% | exploded view + active item |
| `390-technology-80pct.png` | 390 | technology | 80% | exploded view + active item |
| `390-everyday-default.png` | 390 | everyday | 50% | Morning scene (tab 1) |
| `390-everyday-tab2.png` | 390 | everyday | 50% | Work scene (tab 2) |
| `390-specs-top.png` | 390 | specs | 0% | spec grid from its anchor (kicker + first cells) |
| `390-specs-bottom.png` | 390 | specs | 100% | last cells + footnote |
| `390-cta-default.png` | 390 | cta | 50% | device + price + primary action |
| `390-footer-top.png` | 390 | footer | 0% | footer logo, tag and column heads |
| `390-footer-bottom.png` | 390 | footer | 100% | share block + legal line at the page end |
| `390-dialog-open.png` | 390 | dialog | 50% | pre-order dialog (fiction disclosure) |
| `390-nav-menu-open.png` | 390 | nav | 0% | full-screen mobile menu incl. the $299 Pre-order row |
| `390-page-fullpage.png` | 390 | whole page | — | structure only — 3D layer and nav hidden on purpose |
| `../../public/og.png` | 1200 | og | — | OGP card 1200×630 via ?og=1 (written into public/) |
