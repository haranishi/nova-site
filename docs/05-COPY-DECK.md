# コピーデッキ（逐語。実装はこのまま使用。言語=EN）

> 改訂2（周2）: 英文のアポストロフィは**全て曲線 `’`**（What’s / You’re / don’t …）。引用符も曲線 `“ ”`。

## Meta / OGP
- title: `NOVA — Your intelligence. Everywhere.`
- description: `NOVA is a palm-sized personal AI device. Ask, remember, control — no screens needed. A concept study built with Next.js and React Three Fiber.`
- canonical: `https://nova.example.com/`（架空ドメイン・RFC予約名）/ og:image: `/og.png` 1200×630
- share text: `NOVA — a palm-sized AI companion. Your intelligence. Everywhere.`

## Nav
`NOVA` ／ Product・Technology・Experience・Specs ／ `Pre-order`

## Hero
kicker: `INTRODUCING NOVA` ／ H1: `NOVA` ／ tagline: `Your intelligence.` `Everywhere.` ／ cue: `SCROLL`
definition行（タグライン下・muted 15px）: `A palm-sized AI companion. No screen — just your voice.`
Hero CTA（改訂3・定義行の下）: primary `Pre-order · $299`（クリック=ダイアログ）＋ ghost `See the specs`（#specsへ）

## Product Reveal（01–03）
- 01 ASK — `Ask anything.` — `Four beamforming mics hear you across the room. The Neural Engine answers in under 300 milliseconds — no phone, no screen, no waiting.`
- 02 REMEMBER — `Remember everything that matters.` — `Your schedule, your ideas, your people. NOVA holds the thread and recalls it exactly when you need it. Private by design.`
- 03 CONTROL — `Control your world.` — `Lights, locks, music, climate. One word from anywhere in the room, and your home follows.`

## AI Experience
kicker `AI EXPERIENCE` ／ H2 `Talk to NOVA.` ／ sub `Five questions, zero screens. Tap one and watch it think.`
状態遷移: `NOVA — LISTENING`(初期)→`NOVA — THINKING`(ドット中)→`NOVA — SPEAKING`(タイプ中)→`NOVA — READY`(返答完了後)
アイドル時プレースホルダ（初回チップ押下で消える・muted）: `Try one of the five prompts below — replies are simulated on-device.`
| chip | reply |
|---|---|
| What’s on my schedule today? | Three meetings. The first is your design review at 10:30 — I’ve kept your focus block clear until then. |
| Translate “Where is the station?” | 駅はどこですか — “Eki wa doko desu ka.” Want me to say it out loud when you need it? |
| Remind me about Yuki’s birthday. | Done. March 3rd, with a nudge one week early — enough time to find a proper gift. |
| Dim the lights, play some jazz. | Living room at 30 percent. “Midnight in Blue” is on the kitchen speaker. |
| I have an idea for the pitch. | Recording. I’ll shape it into notes and drop them into your pitch document. |

## Technology
kicker `TECHNOLOGY` ／ H2 `Beneath the surface.` ／ sub `Precision hardware, engineered around a single ring of light.`
1. `NOVA Neural Engine` — `38 trillion operations per second, entirely on-device. Your data never has to leave.`
2. `360° Voice Array` — `Four beamforming microphones hear you at eight meters — even over music.`
3. `Spatial Awareness` — `Ultra-wideband presence sensing. NOVA knows the room, not just the request.`
4. `All-day Battery` — `18 hours of conversation. 30 days on standby. Charged over coffee.`
5. `Secure AI Processing` — `A dedicated secure enclave encrypts every request, end to end.`

## Everyday（context行はmono）
kicker `EVERYDAY` ／ H2 `From sunrise to silence.` ／ sub `One device, four moments. NOVA fits the day you already have.`
- **Morning** `07:15 — KITCHEN`: “Good morning. Rain at nine — I moved your run to 7:15 and started the coffee.” chips: Briefing / Weather-aware plans / Gentle wake
- **Work** `10:42 — STUDIO`: “You’re in deep focus. I’m holding four notifications and drafting replies to two.” chips: Focus guard / Meeting notes / Smart replies
- **Travel** `18:03 — TERMINAL B`: “Gate changed to B12. Your connection still works — taxi rebooked for 6:40.” chips: Live rebooking / Instant translate / Local answers
- **Home** `21:30 — LIVING ROOM`: “Welcome back. Lights low, dinner playlist on. Your sister called — want the summary?” chips: Scenes / Call summaries / Family voices

## Specs
kicker `SPECIFICATIONS` ／ H2 `Precision, specified.`
| label | value | sub |
|---|---|---|
| Weight | 86 g | Anodized aluminium body |
| Battery | 18 hrs | 30-day standby |
| Connectivity | Wi-Fi 6E · BT 5.4 | Matter over Thread |
| Microphones | 4-mic array | Beamforming, 8 m range |
| Charging | USB-C · Qi2 | 0–80% in 45 min |
| Processor | NOVA N1 | 38-TOPS Neural Engine |
footnote: `All figures are design targets for a fictional product.`

## CTA / Dialog / Footer
CTA: H2 `Meet NOVA.` ／ `$299` ／ `Ships early 2027 · Free engraving` ／ button `Pre-order`
Dialog: title `A concept, for now.` body `NOVA is a fictional product — this site is a design and engineering study. No pre-orders, just pixels.`（`No pre-orders, just pixels.` は途中改行禁止）
　ボタン（改訂4・本人決定 2026-08-18）: **primary `Explore the technology`**（閉じて#technologyへスクロール）
　＋ secondary `Copy link`（ghost・→`Copied`）＋ text link `Close` ＋ 右上×（当たり判定44px）
CTA副導線（改訂3）: Pre-orderの下に ghost `See the technology`（#technologyへ）
Footer列: Product(Overview/Technology/Experience/Specs=アンカー) / Company(About·Careers·Press=無効) /
Legal(Privacy·Terms=無効) / Share(`Share…`·`Post on X`·`LINE`·`Copy link`)
IG/YT注記（改訂3・環境で出し分け）: navigator.shareあり=`Instagram and YouTube don’t accept shared links from the web — use the share sheet or copy the link.` ／ なし=`Instagram and YouTube don’t accept shared links from the web — copy the link instead.`
下段: `© 2026 NOVA. A design study — not a real product.` ／ `Built with Next.js + React Three Fiber`
