# Loop 2 — implement 受領書

- 工程: implement（差し戻し `docs/08-FIX-LOOP2.md` / 採点 `harness/eval/loop1-score.md` 8/20 FAIL）
- 日付: 2026-08-18
- 結果: **PASS**（typecheck / build / Playwright 全spec / shots すべて通過）

## ゲート結果（証拠）

| ゲート | コマンド | 結果 |
|---|---|---|
| 型 | `npm run typecheck` | 成功（出力なし＝エラー0） |
| ビルド | `npm run build` | 成功（Next 16.3.1 / Turbopack・`/` は静的プリレンダ） |
| E2E | `npm run test` | **31 passed / 3 skipped / 0 failed**（タップ基準を40→44pxへ更新後） |
| スクショ | `node scripts/shots.mjs --loop 2` | 65枚・**console errors 0**（`harness/shots/loop2/console-errors.log` = `(none)`） |

skip 3件は周1と同じ意図的ガード（desktopのモバイルメニュー／自前viewportを切る横スクロール走査／mobile限定のタップ領域）。

## 対応対照表（WS番号 → 対応内容 → 変更ファイル）

### WS1 セクション切断とナビ帯の根絶
| # | 対応 | ファイル |
|---|---|---|
| 1 | 全セクションに `scroll-margin-top:88px`。CTAは `pt-[120px]`（ナビ下56px）・Experience `pt-[104px]`・Specs `pt-[136px]`・Technology mobile `pt-[88px]` | `globals.css` / `Cta.tsx` / `Experience.tsx` / `Specs.tsx` / `Technology.tsx` |
| 2 | shots.mjs のスクロールを**ナビ高さ64px基準**に再定義（可視帯=vh−64。帯より高いセクションは超過分を自セクションのpaddingで按分）。セトル待ちは全ショット1100ms固定 | `scripts/shots.mjs` |
| 3 | `?freeze=1` 実装（浮遊・アイドル回転・呼吸・イコライザ・カーソル・自動送り・粒子を停止、`motionState.time`を0固定）。静的ショットは全てこのモードで撮影 | `motion-state.ts` / `store.ts` / `scroll-engine.ts` / `SiteShell.tsx` / `globals.css` / `Rig.tsx` / `SceneCanvas.tsx` / `Everyday.tsx` |
| 4 | ナビ bg `/72→/55`・`backdrop-blur-xl→2xl`＋saturate・scrolled時ヘアライン `白/8→白/12` | `Nav.tsx` |
| 5 | オーバーレイ `/95→/98`＋blur-2xl・メニュー内に `$299 · Ships early 2027` ＋ Pre-order 行（開いている間はバー側のボタンを隠して主ボタンは常に1個）・バーガーは24pxグリフ/44px当たり判定 | `Nav.tsx` / `copy.ts` |

### WS2 可読性ゼロ欠陥
| # | 対応 | ファイル |
|---|---|---|
| 1 | `.nova-scrim` / `.nova-scrim-soft` を**グリフ単位のtext-shadow**として実装し、3Dと重なりうる全帯（Hero・Reveal・Experience・Technology・Everyday・CTA）に適用。会話パネル自体は `bg-[#0a0b10]/92 + blur-2xl` の面に変更 | `globals.css` ＋ 各section |
| 2 | Experienceのデバイス: **lg未満は完全退避**（`experienceAway` ポーズ y−3.4）。lg以上は `x−2.75 / scale .46`＝パネル左に全景可視 | `Rig.tsx` |
| 3 | フッターリンクを全列 `--body #b9c0cc` に統一・無効項目は同色+opacity .7。Specs脚注 12→13px、Everydayタグ 12→13px `#9aa3b2`（新トークン `--color-mute`）、共有注記 12→13px | `Footer.tsx` / `Specs.tsx` / `Everyday.tsx` / `globals.css` |
| 4 | `responsive.spec` を **44px基準**に更新。指定testidに加え「その時点で可視の全 `a[href]`/`button`」を幅・高さ両方で走査し、footer / dialog open / menu open の3状態で実行。フッター行 36→44px、メニューリンク 32→44px、skip-link 40→44px、ダイアログ×/Copy link 44px | `responsive.spec.ts` / `Footer.tsx` / `Nav.tsx` / `globals.css` / `PreOrderDialog.tsx` |

### WS3 整列と768ブレークポイントの再構築
| # | 対応 | ファイル |
|---|---|---|
| 1 | Revealの3ステップとも**キッカー・見出し・本文が同一の揃え線**に。旧実装は `mx-auto` が効いてリードだけ再センタリングされていた（実測22〜26pxのずれの正体）。step3は中央配置ブロック＋左揃えテキストへ | `Reveal.tsx` |
| 2 | Everyday 768の109pxインデント解消（`md:justify-end` を lg 以上に限定し、テキストは常に共通コンテナ左端＝40px） | `Everyday.tsx` |
| 3 | 768: Reveal本文ブロック 42%→64%（実測440px超）・Technology左カラム `minmax(380px,46%)`・Footerを2×2（`lg:grid-cols-4`・ブランド段は `lg:flex-row`）・ピン距離短縮（Reveal 320→240vh / Technology 300→220vh、md時） | `Reveal.tsx` / `Technology.tsx` / `Footer.tsx` |
| 4 | 孤立行: `Lead` コンポーネントで `milliseconds —` をnowrap（文字列は不変）・ダイアログは `bodyLead`+`bodyTail` 分割で `No pre-orders, just pixels.` をnowrap・390のReveal段落を左揃え・`.nova-lead` に `text-wrap: pretty` | `Reveal.tsx` / `copy.ts` / `PreOrderDialog.tsx` / `globals.css` |
| 5 | Specs単位: 単位spanの先頭スペースを16pxで持たせ `word-spacing:.14em` を掛け、中黒の前後と値-単位間を6.4px（0.4em）で等間隔化。文字列は `Wi-Fi 6E · BT 5.4` のまま | `Specs.tsx` |
| 6 | アポストロフィ全曲線化（`What’s` `I’ve` `Yuki’s` `I’ll` `You’re` `I’m` `don’t`）＋機械照合再実行（下記） | `copy.ts` ＋ 3 spec |
| 7 | Reveal 3帯を共通の中央グリッドへ（step3の下寄せ廃止）・進捗レール `right-6→right-10`（40px内側） | `Reveal.tsx` |
| 8 | Technologyの5項目リストを上下とも罫線で閉じる・390に導入文を復活（15/17/20pxの段階指定）・進捗バー 3→5px＋非アクティブ `white/20` | `Technology.tsx` |

### WS4 体験の中心
| # | 対応 | ファイル |
|---|---|---|
| 1 | Experience: アイドル時プレースホルダ・**LISTENING→THINKING(3点)→SPEAKING→READY** の状態遷移（質問は即表示、返答だけ460ms待つ）・ユーザー発話に `bg-white/6` の面（NOVA行は素のまま）・チップを1/2カラムのグリッドで全幅整列・トランスクリプトを固定高から `min-h` に変更して空白を解消 | `Experience.tsx` / `copy.ts` |
| 2 | Everyday: **全幅でデバイス可視**。768=空いている右半分（専用タブレットポーズ）・390=タブ上に16vhの専用帯を設けて小サイズ配置・1440はscale .42→.66（≒1.5倍）で引用ブロックと光学中心を一致 | `Rig.tsx` / `Everyday.tsx` |
| 3 | タブアイコンを一意メタファ4種に（sunrise=地平線+半円+光条 / work=ブリーフケース / travel=飛行機 / home=家）・線幅1.5統一 | `Everyday.tsx` / `copy.ts`（icon キー `focus`→`work`） |

### WS5 3D仕上げと訴求
| # | 対応 | ファイル |
|---|---|---|
| 1 | Reveal s2の白飛び根絶: 環境回転 `Math.PI*0.62`＋`environmentIntensity .5→.45`＋**ポーズ別 envMapIntensity 減衰**（reveal s2で1.15→0.6）＋`clearcoatRoughness .1→.32`＋Bloom閾値 1.18→1.34/smoothing .28。リングのみ発光の規律は維持 | `SceneCanvas.tsx` / `Rig.tsx` / `NovaDevice.tsx` / `runtime.ts` |
| 2 | 銅色を撤廃（battery縁 `#b0876a`→`#aab1bd` / coil `#c08a5f`→`#767d8a`）＝素材差は明度のみ | `NovaDevice.tsx` |
| 3 | Hero: タグライン下に定義行・SCROLLキューをコンテナ左ガターへ移設（どの幅でもデバイスと非重畳）・ポーズを `y-1.05/scale .8`（mobile `-0.9/.58`）にして浮遊込みでfold内に収め、不要になった下端フェードを削除（ヒーロー／Reveal境界に横線が出るため） | `Hero.tsx` / `copy.ts` / `Rig.tsx` |
| 4 | CTA: `$299` を24px→`clamp(48px,9vw,60px)`・セクションを110vh→1画面構成（見出しはナビ下56px以上）・ダイアログに×（44px）と Copy link（canonicalコピー→`Copied`） | `Cta.tsx` / `PreOrderDialog.tsx` / `copy.ts` |
| 5 | OG画像を専用構図で再生成: `?og=1` でナビ・キュー・skip-linkを隠し、H1を128pxに、専用ポーズでデバイス全景。`public/og.png` はこの状態から撮影 | `globals.css` / `Rig.tsx` / `SiteShell.tsx` / `scripts/shots.mjs` |
| 6 | 分解時の中間円盤: 厚み 0.05→0.085・上下エッジにスチールのトーラス・`meshPhysicalMaterial`（clearcoat .55）でフラット感を解消 | `NovaDevice.tsx` |

## 実測（撮影画像からのピクセル計測）

WS2-1の基準「局所コントラスト≥4.5:1」を loop2 のPNGから直接測定（暗い60%の中央値＝背景、明るい上位4%＝グリフ、WCAG比）:

| 箇所 | 採点#1 | loop2 |
|---|---|---|
| 390 Experience sub「watch it think.」 | 3.28:1 | **8.43:1** |
| 768 返答先頭行 | 4.27:1 | **6.88:1** |
| 390 返答本文 | — | 6.96:1 |
| 1440 `$299`（デバイス上） | — | 16.30:1 |
| 1440 Hero定義行（最小値） | — | 5.18:1 |

### ページ総高（WS3-3 のピン距離短縮）

| 幅 | 採点#1 | loop2 |
|---|---|---|
| 1440 | 10,780 | 10,755 |
| 768 | **12,273** | **10,817**（1440比 +0.6%） |
| 390 | — | 9,442 |

## コピー照合（WS3-6 の機械照合再実行）

`src/lib/copy.ts` のプローズ93件を `docs/05-COPY-DECK.md` と照合（空白正規化・アポストロフィは曲線/直線を同一視）。不一致は5件で、いずれもコピーデッキ外に根拠があるもの:

- `$299 · Ships early 2027` — WS1-5がメニュー行として指定した文言（05には無い）
- `01 — ASK` / `02 — REMEMBER` / `03 — CONTROL` — 03-DESIGN-SPEC §3 の表記（周1から継続）
- `Close dialog` — ×ボタンの `aria-label`（画面に出る文字ではない）

> ⚠️ 05改訂2の冒頭は「アポストロフィは全て曲線」と定めているが、**05の表本体は直線のまま**。実装は改訂2の指示に従って曲線に統一し、docs側は編集していない（コピー変更の権限は設計工程にあるため）。次周でdocsを揃えるか判断が要る。

## 仕様からの逸脱と理由

1. **CTAを `min-h-[110vh]` → `min-h-screen`＋内部余白**。110vhは固定ナビ下ではどのスクロール位置でも見出しか価格のどちらかが切れる。1画面に収めたことで「見出し→デバイス→価格→ボタン」が1フレームで読める。
2. **Reveal step3のデバイスを「テキストの下」へ**（旧: テキストが下・デバイスが上）。3帯を共通中央グリッドに揃えた結果、旧配置ではデバイスが見出しを貫通した。04-SPECの「中央奥・テキスト下」に沿った形。
3. **ポーズ表にタブレット列を追加**（hero/reveal1-3/technology/everyday/cta）。周1は「可視半幅の比率」で desktop値を補正していたが、768では補正後もテキスト段に食い込む。タブレット列を持つポーズは補正を掛けない。
4. **Experienceのモバイル/タブレットはデバイスを完全退避**（WS2-2の指示どおり）。退避方向は specs/footer と同じ下方向で、モバイルでの横移動禁止も守っている。
5. **Hero下端のフェードを削除**。デバイスがfold内に収まったため不要になり、残すとヒーロー／Reveal境界に横線として見える。
6. **スクリムは面ではなくグリフ影**。一度は放射グラデの面で実装したが、アンビエントグロー上で灰色の矩形として見え、周辺のグリフはグラデの裾に落ちて4.5:1を割った（撮影で確認）。text-shadowなら暗い地では不可視・明るい所だけ効く。
7. **`?freeze=1` / `?og=1` という撮影専用モードをプロダクションコードに置いた**。フラグが無い通常表示は一切変わらない。`window.__novaFrames` のフレームカウンタも freeze 時のみ更新する。

## 撮影スクリプト側の修正（採点対象ではないが重要）

- **ナビ基準のスクロール**（WS1-2）。旧実装は生の `offsetTop` で、可視帯の中央ではなくビューポート中央を基準にしていたため、固定ナビが見出しを常に食っていた。
- **3Dの実在検証**。ヘッドレスWebGL2（SwiftShader）は①最初から描画しない②長いスクロールの途中で止まる、の2モードで死ぬ。周1の「3回撮って一番情報量の多い1枚」では検出できず、**周1・周2の初期スクショに実際にデバイスの無いコマが混ざっていた**。対策として、(a) freeze時にページが公開するフレームカウンタで描画ループの前進を確認し、(b) canvasを隠したフレームとバイト比較して合成落ちを検出、(c) 死んだ幅はコンテキストごと作り直して撮り直す。
  - 副作用として `?freeze=1` が必須になる（比較の厳密一致は時間駆動アニメが止まっていて初めて成立する）。
- 高いセクションは `-top` / `-bottom` の2コマに分割（Specs・Footer）、Experienceは THINKING のコマを追加、`nav-scrolled` はスクロール量を直接指定。

## 既知の残課題（周3以降の候補）

- **1440のSpecsは `-top` と `-bottom` がほぼ同じ絵**（セクションが可視帯とほぼ同じ高さのため）。害はないが2コマ撮る意味は薄い。
- Technology分解時の内部部品は暗色で統一したため、部品同士の見分けはエッジのスチール反射に依存している。もっと差を付けるなら素材を1段明るくする余地がある。
- 05-COPY-DECK 本体のアポストロフィが直線のまま（上記）。
- `tsconfig.json` の `exclude` に `tests` があるため spec は `tsc` の対象外（周1から継続・意図的）。
- 常駐プロセスは全て停止済み（`next start` / `next dev` は残っていない）。
