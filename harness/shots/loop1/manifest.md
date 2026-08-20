# NOVA — scoring screenshots (loop 1)

generated: 2026-08-17T15:20:32.727Z
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
- Each viewport frame is captured up to three times and the fullest one is
  kept: headless chromium sometimes composites a screenshot without the
  WebGL layer, which would look like a missing device.

| file | width | section | progress | action / notes |
|---|---|---|---|---|
| `1440-nav-top.png` | 1440 | nav | 0% | nav transparent over hero |
| `1440-hero-default.png` | 1440 | hero | 0% | wordmark + tagline + scroll cue |
| `1440-nav-scrolled.png` | 1440 | nav | 60% | nav blurred + hairline (data-scrolled) |
| `1440-reveal-15pct.png` | 1440 | reveal | 15% | pinned band 1 of 3 |
| `1440-reveal-50pct.png` | 1440 | reveal | 50% | pinned band 2 of 3 |
| `1440-reveal-85pct.png` | 1440 | reveal | 85% | pinned band 3 of 3 |
| `1440-experience-idle.png` | 1440 | experience | 50% | panel listening, no reply yet |
| `1440-experience-replied.png` | 1440 | experience | 50% | chip 1 tapped, reply typed out |
| `1440-technology-20pct.png` | 1440 | technology | 20% | exploded view + active item |
| `1440-technology-50pct.png` | 1440 | technology | 50% | exploded view + active item |
| `1440-technology-80pct.png` | 1440 | technology | 80% | exploded view + active item |
| `1440-everyday-default.png` | 1440 | everyday | 50% | Morning scene (tab 1) |
| `1440-everyday-tab2.png` | 1440 | everyday | 50% | Work scene (tab 2) |
| `1440-specs-default.png` | 1440 | specs | 50% | 3×2 spec grid after count-up |
| `1440-cta-default.png` | 1440 | cta | 50% | device + price + primary action |
| `1440-footer-default.png` | 1440 | footer | 100% | footer columns incl. share block |
| `1440-dialog-open.png` | 1440 | dialog | 50% | pre-order dialog (fiction disclosure) |
| `1440-page-fullpage.png` | 1440 | whole page | — | structure only — 3D layer and nav hidden on purpose |
| `768-nav-top.png` | 768 | nav | 0% | nav transparent over hero |
| `768-hero-default.png` | 768 | hero | 0% | wordmark + tagline + scroll cue |
| `768-nav-scrolled.png` | 768 | nav | 60% | nav blurred + hairline (data-scrolled) |
| `768-reveal-15pct.png` | 768 | reveal | 15% | pinned band 1 of 3 |
| `768-reveal-50pct.png` | 768 | reveal | 50% | pinned band 2 of 3 |
| `768-reveal-85pct.png` | 768 | reveal | 85% | pinned band 3 of 3 |
| `768-experience-idle.png` | 768 | experience | 50% | panel listening, no reply yet |
| `768-experience-replied.png` | 768 | experience | 50% | chip 1 tapped, reply typed out |
| `768-technology-20pct.png` | 768 | technology | 20% | exploded view + active item |
| `768-technology-50pct.png` | 768 | technology | 50% | exploded view + active item |
| `768-technology-80pct.png` | 768 | technology | 80% | exploded view + active item |
| `768-everyday-default.png` | 768 | everyday | 50% | Morning scene (tab 1) |
| `768-everyday-tab2.png` | 768 | everyday | 50% | Work scene (tab 2) |
| `768-specs-default.png` | 768 | specs | 50% | 3×2 spec grid after count-up |
| `768-cta-default.png` | 768 | cta | 50% | device + price + primary action |
| `768-footer-default.png` | 768 | footer | 100% | footer columns incl. share block |
| `768-dialog-open.png` | 768 | dialog | 50% | pre-order dialog (fiction disclosure) |
| `768-page-fullpage.png` | 768 | whole page | — | structure only — 3D layer and nav hidden on purpose |
| `390-nav-top.png` | 390 | nav | 0% | nav transparent over hero |
| `390-hero-default.png` | 390 | hero | 0% | wordmark + tagline + scroll cue |
| `390-nav-scrolled.png` | 390 | nav | 60% | nav blurred + hairline (data-scrolled) |
| `390-reveal-15pct.png` | 390 | reveal | 15% | pinned band 1 of 3 |
| `390-reveal-50pct.png` | 390 | reveal | 50% | pinned band 2 of 3 |
| `390-reveal-85pct.png` | 390 | reveal | 85% | pinned band 3 of 3 |
| `390-experience-idle.png` | 390 | experience | 50% | panel listening, no reply yet |
| `390-experience-replied.png` | 390 | experience | 50% | chip 1 tapped, reply typed out |
| `390-technology-20pct.png` | 390 | technology | 20% | exploded view + active item |
| `390-technology-50pct.png` | 390 | technology | 50% | exploded view + active item |
| `390-technology-80pct.png` | 390 | technology | 80% | exploded view + active item |
| `390-everyday-default.png` | 390 | everyday | 50% | Morning scene (tab 1) |
| `390-everyday-tab2.png` | 390 | everyday | 50% | Work scene (tab 2) |
| `390-specs-default.png` | 390 | specs | 50% | 3×2 spec grid after count-up |
| `390-cta-default.png` | 390 | cta | 50% | device + price + primary action |
| `390-footer-default.png` | 390 | footer | 100% | footer columns incl. share block |
| `390-dialog-open.png` | 390 | dialog | 50% | pre-order dialog (fiction disclosure) |
| `390-nav-menu-open.png` | 390 | nav | 0% | full-screen mobile menu |
| `390-page-fullpage.png` | 390 | whole page | — | structure only — 3D layer and nav hidden on purpose |
| `../../public/og.png` | 1200 | hero | 0% | OGP image 1200×630 (written into public/) |
