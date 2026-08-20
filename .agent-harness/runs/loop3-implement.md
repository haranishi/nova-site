# Loop 3 — implement 受領書

- 工程: implement（差し戻し `docs/09-FIX-LOOP3.md` / 採点 `harness/eval/loop2-score.md` 13/20 FAIL）
- 日付: 2026-08-18
- 結果: **PASS**（typecheck / build / Playwright 全spec / shots すべて通過）
- 位置づけ: **最終周**。WS-A〜E 全対応。構成・コピー（05改訂3以外）は不変。

## ゲート結果（証拠）

| ゲート | コマンド | 結果 |
|---|---|---|
| 型 | `npm run typecheck` | 成功（出力なし＝エラー0） |
| ビルド | `npm run build` | 成功（Next 16.3.1 / Turbopack・`/` は静的プリレンダ） |
| E2E | `npm run test` | **37 passed / 3 skipped / 0 failed**（周2の31→37。新規6件） |
| スクショ | `node scripts/shots.mjs --loop 3` | 65枚・**console errors 0**（`harness/shots/loop3/console-errors.log` = `(none)`） |

skip 3件は周1・周2と同じ意図的ガード（desktopのモバイルメニュー／自前viewportを切る横スクロール走査／mobile限定のタップ領域）。

追加した spec（すべて緑）:
- `cta.spec` — ヒーローPre-orderが同じダイアログを開く／`See the specs`が#specsへ
- `cta.spec` — ダイアログの前進リンクが閉じて#technologyへ・スクロールロックが解ける
- `cta.spec` — CTAの`See the technology`が#technologyへ
- `smoke.spec` — Hero CTAの逐語（`Pre-order · $299` / `See the specs`）
- `share.spec` — 注記が「share sheet」ではなく `copy the link instead.` （navigator.share無し環境）

## WS → 対応 → 変更ファイル 対照表

### WS-A 導線の完結

| # | 対応 | ファイル |
|---|---|---|
| A1 | 定義行から`$299`を撤去し、その下に primary `Pre-order · $299`（白ピル50px・クリック=ダイアログ）＋ ghost `See the specs`（#specs）を**対で中央**に配置。ワードマーク（163px）は依然として画面最大要素、ボタンは50px＝1/3以下 | `copy.ts` / `Hero.tsx` / `PreOrderButton.tsx`（`label`＋`fold`サイズ追加） / `globals.css`（`.nova-ghost`） |
| A2 | ダイアログ主従反転: primary=`Copy link`（白ピル→`Copied`）／ ghost `Explore the technology`（閉じて#technologyへ・二重rAF後にscroll）／ `Close`=下線付きテキストリンク／ 右上×は45px当たり | `PreOrderDialog.tsx` / `copy.ts` |
| A3 | CTAセクション: Pre-orderの下に ghost `See the technology` | `Cta.tsx` / `copy.ts` |
| A4 | OG: 専用ポーズを`[0,-0.75,0,0.98]`に作り直し**デバイス全景が下辺で切れない**（実測: 本体下端553px / 630px枠）＋ 下部30pxに定義行をキャプション帯として固定。`?og=1`ではHero CTAを非表示（共有カードに押せない見た目のボタンを置かない） | `Rig.tsx` / `globals.css` / `public/og.png` |

### WS-B 整列・タイポの最終仕上げ

| # | 対応 | ファイル |
|---|---|---|
| B1 | Revealバンド3を**完全センター**に（`md:mx-auto md:text-center`＋リード`md:mx-auto`）。実測: 1440 ブロック395..1045・リード442..998＝**どちらも中心720**（＝ビューポート中心）。768も中心384で一致。x411/139の宙ぶらりんは解消 | `Reveal.tsx` |
| B2 | ①バンド1の測幅 46%→54%（1440で605px）＝`Ask anything.`が**1行** ②バンド2は右配置のまま**ブロック全体を左揃え**に（`md:text-right`撤廃）。実測kicker/heading/lead＝全て`720`(1440)/`274`(768)/`24`(390)＝**揃え線1本** ③390のリードは`text-wrap: balance`（767px以下限定）でラグを平準化 | `Reveal.tsx` / `globals.css` |
| B3 | Reveal本文とデバイスのクリアランス: reveal3ポーズを`-1.28/0.72`→`-1.52/0.64`（tabletは`-1.4/0.5`）。**PNG実測（輝度100超＝実シルエット）1440: 本文下端592 → デバイス上端649 ＝ 57px**（周2は15px）。768は129px | `Rig.tsx` |
| B4 | Experience: プレースホルダを返答と同じ**左揃え・同じ左端**（`pl-1`）に／チップ5個目を`sm:col-span-2`で全幅化＝2列の穴を解消 | `Experience.tsx` |
| B5 | Specs着地余白: `pt-[136px] md:py-[200px]` → `pt-[64px] md:pt-[96px]`（下は112/176pxを維持）。実測 セクション上端88px（scroll-margin維持）に対し**キッカーは1440/768で+96px・390で+64px** | `Specs.tsx` |
| B6 | Hero 390の`No screen —`行末残り: nowrapスパンの範囲を`No screen — just`に。結果「A palm-sized AI companion.／No screen — just your voice.」の2行＝**em dashが行頭にも行末にも来ない**（文字列は不変） | `copy.ts` / `Hero.tsx` |
| B7 | Everyday引用の開き“をぶら下げ。`text-indent: -0.393em` — **Inter の “ の送り幅を実測（0.3929em）** して決めた値。0.42emでは28pxで¾px過剰にはみ出す。結果、引用先頭字が見出しの揃え線と一致 | `Everyday.tsx` |
| B8 | フッター: **SHAREを列から独立の横帯**（©行の上）へ移設／リンクは全て単一トークン`--body`・無効項目の`opacity .7`を撤廃し**hoverのみで差**／注記を環境で出し分け／ブランドと3列を**同じ4列グリッド**に載せ中央の280pxの穴を解消 | `Footer.tsx` / `copy.ts` |

### WS-C ピン区間の密度・配分

| # | 対応 | ファイル |
|---|---|---|
| C1 | Reveal走行短縮 `320vh→240vh`（1440で2880→**2160px**）。md 240→220vh・base 210→200vh。各帯の可読時間は約0.47画面ぶんを維持 | `Reveal.tsx` |
| C2 | ①SCROLLキューを**ヒーロー退場でフェードアウト**（`1 - y/(vh*0.2)`。ラッパーに乗せる＝`nova-fade`アニメーションはインラインstyleより強いため） ②**「8割黒」ビューポートの解消**（下記「設計上の判断1」） | `Hero.tsx` / `Reveal.tsx` / `motion-state.ts` / `scroll-engine.ts` |
| C3 | Technology 5項目を**完全等分**。`techIndexFrom = floor(pin*5)`、explodeランプは`0.05→0.28`（項目02の裏で開き切る）／閉じ`0.88→1`。**実測サンプル分布 1440: {01:11, 02:10, 03:10, 04:10, 05:10}**（周2は01が49%） | `scroll-engine.ts` / `Rig.tsx` / `tech-reveal.spec.ts` |
| C4 | 1024px未満のTechnologyでは**パーティクルを退避**（不透明度目標0）。「360°.Voice」誤読の原因を根から断つ | `SceneCanvas.tsx` |
| C5 | ナビ現在地: `everyday→Technology` / `cta・footer→Specs` のフォールバック表を追加。ヒーローだけは意図的に無点灯 | `Nav.tsx` |

### WS-D 選択トークン統一・状態の微修正

| # | 対応 | ファイル |
|---|---|---|
| D1 | 共通トークン `.nova-pick`（**bg 白/8 ＋ 枠 白/20 ＋ 文字`--fg`**）を Everydayタブ・Experienceチップ・Technology現在行に適用。アクセント細部は各1つ＝**下線 / ドット / 番号色＋余白のマーカー** | `globals.css` / `Everyday.tsx` / `Experience.tsx` / `Technology.tsx` |
| D2 | 768 Everydayタブ: 上記トークンで塗り+文字色+**枠**の3点が同時に効く。自動送り中は進行下線、手動選択後は静的な2pxアクセント下線に切り替え（選択の証跡が消えない） | `Everyday.tsx` |
| D3 | Experienceのデバイスを**全幅で非表示**（`experience`ポーズ＝画面外 y-3.4）。lg以上の`x-2.75`浮遊装飾は削除 | `Rig.tsx` |
| D4 | 390 Everydayデバイス: 22vhの専用帯＋scale 0.47＝**実測191px幅**（要件≥180px）。周2の130px装飾をやめた。帯の拡大に伴いセクション余白を`py-12`・パネル`mt-10`に詰め、**キッカーがナビに潜らない高さ**に収めた | `Everyday.tsx` / `Rig.tsx` |
| D5 | Technology非アクティブ: 明度差（`--faint` vs `--fg`）＋**番号色**（`--faint` vs accent-soft）＋**左マージンの2pxアクセントバー**＋現在行の塗り、の4系統で状態表示 | `Technology.tsx` |
| D6 | 主要対話要素を**45px基準**に（`.nova-tap`）。ナビリンクは`-mx-2 px-2`で**幅も45px超**（見た目の32pxギャップは不変）、ナビのPre-orderは全幅で45px（768はタッチ環境なのに36pxだった）。`responsive.spec`の下限は44.0のまま | `globals.css` / `Nav.tsx` / `PreOrderButton.tsx` / `PreOrderDialog.tsx` / `Footer.tsx` / `Everyday.tsx` / `Experience.tsx` |

### WS-E 撮影・検証

| # | 対応 | ファイル |
|---|---|---|
| E1 | `experience-thinking`の撮り逃し修正。**真因は460msの思考ビートが検証付きスクリーンショットより短いこと**。撮影モード(`?freeze=1`)ではビートを3000msに延長し、shots側は思考ドットの出現を待ってから撮る。**3幅とも thinking と replied のSHA-1が相違**（周2は完全一致） | `Experience.tsx` / `scripts/shots.mjs` |
| E2 | `nav-scrolled`を「意味のある状態」に。ワードマークの上端をバーの下に潜らせる位置へスクロール＝**フロスト・彩度上げ・ヘアラインが同時に見える**（周2は黒地の上でスクロール量340px固定＝透明時と見分けが付かない） | `scripts/shots.mjs` |
| E3 | ゲート4種すべて通過（上表） | — |
| E4 | 本受領書 | `.agent-harness/runs/loop3-implement.md` |

## 実測値

### 揃え・余白（DOM実測）

| 項目 | 周2 | 周3 |
|---|---|---|
| Revealバンド3 ブロック中心 / リード中心（1440） | 左端x411の左揃え | **720 / 720**（ビューポート中心） |
| Revealバンド3（768） | 左端x139 | **384 / 384** |
| Revealバンド2 kicker/heading/lead 左端（1440） | 揃うが右揃えテキスト | **720 / 720 / 720**（左揃え） |
| Reveal本文↔デバイス クリアランス（1440・輝度100超で計測） | 15px | **57px** |
| Specs キッカー位置（セクション上端から） | 200px / 141px(390) | **96px / 64px(390)** |
| Everyday引用の先頭字 vs 見出し左端 | “のぶん右へずれる | **0px 差**（-0.393em＝実測送り幅） |
| Everydayデバイス幅（390） | 約130px | **191px** |

### 走行距離・配分

| 項目 | 周2 | 周3 |
|---|---|---|
| Reveal 総丈（1440） | 2880px | **2160px** |
| Technology 項目別サンプル数（1440・51点走査） | 01が約49% | **11/10/10/10/10** |
| ページ総高 1440 / 768 / 390 | 10755 / 10817 / 9442 | **9924 / 10319 / 9329** |

### タップ領域（可視コントロール全数走査・45px下限）

| 状態 | 390 | 768 / 1440 |
|---|---|---|
| hero / experience / everyday / footer / dialog / menu | **すべて45px以上** | **すべて45px以上** |

周2に残っていた `Specs`（ナビリンク幅41.5px）と `nav-preorder`（デスクトップ高36px）も解消済み。

## 指示書外で併せて仕上げた点（触れた領域の磨き残し）

1. **CTAの`$299`がデバイスのリムに乗っていた**。ポーズを`[0,-0.12,0.4,1.02]`→`[0,0.26,0.4,0.87]`（tablet/mobileも同様）。見出し→デバイス→価格→アクションの4段が重ならずに1画面へ収まる。
2. **Everydayに何も触らず到達すると、Morningタブが橙で光っているのにリングは既定の青**だった。`motionState.sceneColor`の初期値を`EVERYDAY.scenes[0].color`にして`sceneIndex`と同期。
3. **フッター中央の280pxの空白**（ブランドと3列が両端寄せだったため）。ブランドを同じ4列グリッドの1列目に入れて等間隔化。
4. **Hero/tabletのデバイスが遠すぎた**（ボタン下215pxの空白）。tabletポーズを`-1.34/0.55`→`-1.06/0.62`。
5. **Experienceのプレースホルダが2行に折り返して「on-device.」だけ残っていた**。測幅を68chにして1行に（390では`text-wrap: pretty`で処理）。

## 仕様からの逸脱と理由（設計上の判断）

1. **ヒーロー→Revealの「8割黒」は、バンドを先回りさせて解いた。**
   sticky要素は自分のセクションより上には描けないので、セクションが画面上端に届くまで最初のバンドは fold の下で待つしかなく、その間ビューポートには3Dしか残らない。そこで `motionState.pinPx`（セクション上端までの符号付きpx）を追加し、**バンドを「セクションが残り移動すべき距離」ぶん持ち上げて最終位置に固定**したうえで、到達の手前0.53〜0.36画面ぶんでクロスフェードさせた。ピンが始まった瞬間にオフセットは0になるので段差は出ない。フェード窓を**画面高さ基準**で定義したため、390/768/1440のどれでも同じ相対位置で明るくなる（実測: 各幅ともヒーロー高の55%で約62%）。
   　副作用として Reveal の sticky から `overflow-hidden` を外した（外さないとバンドの上半分が切られる）。バンドは`pointer-events-none`かつ横方向には出ないので、横スクロールもクリック妨害も起きない（`responsive.spec`で確認）。

2. **Revealバンド3の「センター」は md 以上に限定した。** 390ではブロックが全幅なので、テキストを中央寄せすると3帯のうち1帯だけ揃え線が消える。モバイルは全帯とも共通コンテナ左端（24px）に揃えたままにしてある。

3. **バンド2は「本文だけ左揃え」ではなくブロック全体を左揃えにした。** 指示は本文の左揃えだが、見出しだけ右揃えのまま残すと周2で潰した「1ブロック2揃え線」が復活する。位置（右半分）で01と対比を作り、揃え線は1本に保つほうが指示の意図に沿うと判断した。

4. **ダイアログの初期フォーカスは`Close`のまま**（主従は反転させたが、フォーカスは動かしていない）。情報提示だけのダイアログでは、開いた瞬間にEnterを押しても何も起きない退出系にフォーカスを置くのが安全側。`Copy link`は白ピルとして視線の主役ではある。

5. **`?freeze=1`のとき思考ビートを3000msにした**（通常表示は460msのまま）。撮影専用モードの既存方針の延長。これがないと「検証付きスクリーンショットの所要時間 > 状態の寿命」という構造的な撮り逃しは直らない。

6. **1024px未満のTechnologyではパーティクルを区間ごと退避**（テキスト帯だけの除外ではない）。粒子位置を毎フレーム射影してテキスト矩形と判定する実装も検討したが、drei の Sparkles は頂点シェーダ側で位置を揺らすため DOM 座標との厳密一致が保証できない。区間単位の退避なら誤読が起きる可能性そのものが無くなる。

7. **`Wi-Fi 6E · BT 5.4` 等のSpecs文字列・全コピーは不変。** 変更したのは05改訂3が定めた5箇所（Hero定義行・Hero CTA 2種・ダイアログ3種・CTA副導線・SHARE注記2種）のみ。

## テスト出力（末尾）

```
  ✓  37 [mobile] › tests/e2e/share.spec.ts:11:5 › share row links out correctly and copies the canonical URL (3.1s)
  ✓  39 [mobile] › tests/e2e/tech-reveal.spec.ts:13:5 › technology pin walks through all five items (6.5s)
  ✓  38 [mobile] › tests/e2e/smoke.spec.ts:11:5 › page loads and all nine sections come into view (10.0s)
  ✓  40 [mobile] › tests/e2e/tech-reveal.spec.ts:28:5 › reveal bands fade in one after another (4.5s)

  3 skipped
  37 passed (2.1m)
```

```
· 65 screenshots → harness/shots/loop3
· console errors: 0
```

## 既知の残課題

- `docs/05-COPY-DECK.md` 本体のアポストロフィは直線のまま（改訂2の冒頭指示と表本体が不一致・周2から継続）。実装は曲線で統一済み。
- 1440の`specs-top`と`specs-bottom`はセクションが可視帯とほぼ同じ高さのため似た絵になる（周2から継続・害なし）。
- `tsconfig.json` の `exclude` に `tests` があるため spec は `tsc` の対象外（周1から継続・意図的）。
- Technology分解時の内部部品は暗色で統一しているため、部品同士の見分けはエッジのスチール反射に依存（周2から継続）。
- 常駐プロセスは全て停止済み（`next start` / `next dev` / chromium とも残っていない）。

---

# 追記: コードレビュー対応（周3 verify 差し戻し・2026-08-18）

- 入力: `harness/eval/loop3-code-review.md`（CRITICAL 1 / HIGH 5 / MEDIUM 12 / LOW 8 = **26件**）
- 結果: **26/26 対応・見送り 0**
- 方針: 見た目は変えない。例外は許容済みの2件のみ（#23 explode の畳み始め 0.88→0.95、#18 `#specs`直リンク時に「0」を出さない）

## ゲート再走（証拠）

| ゲート | コマンド | 結果 |
|---|---|---|
| 型 | `npm run typecheck` | 成功（**tests / playwright.config / scripts/shots.mjs を型検査対象に入れた上で**エラー0） |
| ビルド | `npm run build` | 成功（Next 16.3.1 / Turbopack） |
| E2E | `npm run test` | **37 passed / 3 skipped / 0 failed** |
| スクショ | `node scripts/shots.mjs --loop 3` | **65枚・console errors 0**（`harness/shots/loop3/console-errors.log` = `(none)`・WebGL撮り直し0回・exit 0） |

`harness/shots/loop3/` は **この再実行版が最終成果物**（#5 の `return buf` 修正と #26 のフォールバック判定を含む）。skip 3件は従来どおり意図的ガード。

## #番号 → 対応 → ファイル

### CRITICAL

| # | 指摘 | 対応 | ファイル |
|---|---|---|---|
| 1 | SceneCanvasにエラーバウンダリ無し＝R3Fのthrowで白画面 | `CanvasBoundary`（React 19 class・`getDerivedStateFromError` + `componentDidCatch`）で`SceneCanvas`を包み、fallbackは既存の`CanvasFallback`を流用。ログは`console.warn`（=`console.error`を出さないので撮影ゲートを汚さない）。ルート段の受け皿として`app/error.tsx`（`reset()`＋トップへ戻る導線）を追加 | `src/components/SiteShell.tsx` / `src/app/error.tsx` |

### HIGH

| # | 指摘 | 対応 | ファイル |
|---|---|---|---|
| 2 | メニューを開いたまま768px以上へ変化すると永久ロック | `matchMedia("(min-width: 768px)")`の`change`で`setNavOpen(false)`。CSSで消える要素の副作用（ロック）もCSSと同じ境界で解く | `src/components/Nav.tsx` |
| 3 | スクロールロックをNavとDialogが独立所有 | `scroll-engine.ts`に**参照カウント式**`lockScroll()` / `unlockScroll()` / `isScrollLocked()`を新設し、両者を移行（`overflow`とLenisの所有者は1つ、呼び手は2つ）。reduced-motion解除でLenisを作り直す際も、ロック中なら新インスタンスを`stop()`して引き継ぐ | `src/lib/scroll-engine.ts` / `Nav.tsx` / `ui/PreOrderDialog.tsx` |
| 4 | 両オーバーレイが素のwindow keydown＝Esc 1回で両方閉じる | `openDialog`でナビを閉じる（`set({ dialogOpen: true, navOpen: false })`＋`motionState.navOpen=0`）。モーダルは最上層＝下の層から画面を引き取る、という一本の規則にした | `src/lib/store.ts` |
| 5 | `capture()`がバイト数最大の`best`を返す＝死にフレーム採用の恐れ | 検証に通った`buf`をそのまま返す（`best`廃止）。ループを`for(;;)`＋`attempt === 2`終端にして戻り値がnullになり得ない形に | `scripts/shots.mjs` |
| 6 | `webglcontextlost`未処理＝死んだcanvasがopacity:1で残る | `onCreated`で`webglcontextlost`を購読し、`documentElement.dataset.glLost`を立てて`onContextLost()`→ SiteShellが`mode="off"`へ倒し`CanvasFallback`へ引き継ぐ。撮影側は`glLost`を**DeadCanvas扱いで撮り直し**（フォールバック絵を静かに正解として採らない） | `src/components/canvas/SceneCanvas.tsx` / `SiteShell.tsx` / `scripts/shots.mjs` |

### MEDIUM

| # | 指摘 | 対応 | ファイル |
|---|---|---|---|
| 7 | mobile判定がマウント時1回 | `matchMedia("(max-width: 767px)")`を購読。dpr・multisampling・Bloom解像度が回転／ウィンドウ跨ぎに追従 | `SceneCanvas.tsx` |
| 8 | `useFrame`内で毎フレーム`Object.keys()` | `PART_KEYS`としてモジュールスコープへ | `canvas/NovaDevice.tsx` |
| 9 | aria-liveがタイプライタを包み1返答で約100回読み上げ | ライブリージョンは維持したまま、**打鍵中の文字列を`aria-hidden`の中に閉じ込め**、打ち終わった文だけを露出＝1返答1アナウンス。見た目・DOMテキストは不変 | `sections/Experience.tsx` |
| 10 | 一時停止後にバーだけ先に完走しシーン切替が遅れる | 5秒`setTimeout`を廃し、**プログレスバーの`animationend`で送る**（バーが時計）。`animation-play-state: paused`が全ての一時停止条件をそのまま担う | `sections/Everyday.tsx` |
| 11 | tablistにroving tabIndex無し | 選択タブ`tabIndex=0` / 他`-1`（tablistはTab 1停留・中は矢印キー） | `sections/Everyday.tsx` |
| 12 | モーダル/オーバーレイ背後がinertでない | ページ側を`<div data-page inert={navOpen \|\| dialogOpen}>`で包み、加えて**ナビバー自体も`inert={dialogOpen}`**（モーダル展開中の「背後」はページだけではない） | `SiteShell.tsx` / `Nav.tsx` |
| 13 | pointermove毎に`getBoundingClientRect` | ホバー中にキャッシュし、`pointerenter`/`pointerleave`/`scroll`/`resize`で破棄。次のmoveで1回だけ測り直す | `sections/Cta.tsx` |
| 14 | tests / scripts / playwright.config が型検査外 | `exclude`を`node_modules`のみに縮小し、さらに`checkJs`＋`**/*.mjs`で**`scripts/shots.mjs`も型検査対象**に。撮影スクリプトにJSDoc型を付与して0エラー化 | `tsconfig.json` / `scripts/shots.mjs` |
| 15 | `waitForTimeout(1400/800)`の壁時計待ち | `ready()`は「フォント確定 → 3Dが決着（canvasのフレーム前進 or CSSフォールバック出現）→ ページ高さがrAF 6連続で不変」を待つ。`scrollToSection()`は「スクロール位置がrAF 6連続で不変」を待つ | `tests/e2e/helpers.ts` |
| 16 | `reuseExistingServer`無条件true | `!process.env.CI` | `playwright.config.ts` |
| 17 | mobileプロジェクトで`display:none`のdesktopリストを検証＝空振り | `isMobile`で`[data-tech-item-mobile]`へ分岐。`toBeVisible()`も足して「見えている要素を見ている」ことを固定 | `tests/e2e/tech-reveal.spec.ts` |
| 18 | `#specs`直リンクで「0」が一瞬見える／freeze非対応 | カウントアップを**マウント時にfoldより下にいた場合だけ**armする（見えている状態からは0に落とさない）。`freeze`は即座に確定値へ短絡 | `sections/Specs.tsx` |

### LOW

| # | 指摘 | 対応 | ファイル |
|---|---|---|---|
| 19 | `dialogInvoker`がclose後も残留 | `closeDialog`でnull（invokerは開いた時点でeffectに捕捉済みなのでフォーカス復帰に影響なし） | `src/lib/store.ts` |
| 20 | `revealStep`は誰も読まない | 算出・store・setScroll契約からまとめて削除 | `scroll-engine.ts` / `store.ts` |
| 21 | `dampC`が毎フレーム色文字列をパース | `RING_DEFAULT`定数＋シーン色は文字列をキーにした1回パースのキャッシュ。`dampC`はColor実体なら`copy`で済む（maath実装で確認）＝数値は完全一致 | `canvas/Rig.tsx` |
| 22 | `usedDesktopColumn`のモジュールフラグがブレンドで曖昧 | `Pose`に`desk: 0..1`を持たせ`read()`が返し`blend()`が補間、補正量を`mix()`で明示合成。純desktop/純tabletのケースは従来と数値一致（＝見た目不変） | `canvas/Rig.tsx` |
| 23 | `TECH_BAND.close=0.88`が項目05の帯を食う | `0.95`へ（許容された視覚変化） | `scroll-engine.ts` |
| 24 | 見出し順の検証が実質H1存在チェックのみ | 「先頭の見出し＝H1」＋「レベルを飛ばさない」を検証。H1が1つであることは既存のcount assertが担保 | `tests/e2e/a11y-basic.spec.ts` |
| 25 | `ready()`無しで`expectNoErrors` | `ready(page)`を追加（hydration前に「エラー無し」と言っていた） | `tests/e2e/meta.spec.ts` |
| 26 | no-WebGL正当フォールバック時もDeadCanvas扱い | `assertRendering`はcanvas不在なら生存チェックをskip、`capture`はcanvasレイヤ不在なら比較せず1枚撮る。ただし**`glLost`（#6）は明示的にDeadCanvas**＝正当な不在と事故を区別 | `scripts/shots.mjs` |

## 見た目に出る変更（許容範囲）

1. **Technology**: explodeの畳み始めが pin 88% → 95%。項目05が自分の帯の間ずっと分解状態を保つ（#23）。
2. **Specs**: `/#specs`に直接着地したとき数値が0に落ちてから数え上がる挙動が無くなり、確定値のまま表示（#18）。ページ頭から読み進めた場合のカウントアップは従来どおり。
3. **モバイルメニュー内のPre-orderを押した時**: メニューが閉じてからダイアログが開く（従来は裏で開いたまま）。#4の副作用で、Escの二重反応を消すための必然。

## 対応の過程で見つかったこと（レビューには無いが直したもの）

- **`ready()`の「canvasが無い」は2つの意味を持っていた。** 最初の実装は「canvas未マウント」を「そもそもcanvasが無いページ」と同一視し、`a11y-basic`が`no-canvas`で落ちた（＝ゲート再走が仕事をした）。`[data-canvas-fallback]`の有無で正当な不在だけを判定するよう修正。
- **`capture()`はnullを返し得た。** #14で`checkJs`を有効にした結果、`writeFile`に`Buffer | null`を渡している箇所が2件検出された。#5の書き直しで構造的に解消。

## 残課題（更新）

- 旧「`tsconfig.json`の`exclude`にtestsがあるため spec は`tsc`の対象外」は **#14で解消**。`tests` / `playwright.config.ts` / `scripts/shots.mjs` すべて`npm run typecheck`の対象。
- `docs/05-COPY-DECK.md`本体のアポストロフィ（周2から継続・実装側は統一済み）は未変更。
- 1440の`specs-top`/`specs-bottom`が似た絵になる件（周2から継続・害なし）は未変更。
- 常駐プロセスは全て停止済み（`next start` / `next dev` / chromium とも残っていない）。

---

# 追記2: 撮影穴の修正（verify 追加差し戻し・2026-08-18）

**サイトコードは無変更。`scripts/shots.mjs` のみを直し、同じビルドで撮り直した。**

## 何が起きていたか

追記1の #26 で「canvas不在 → 正当な no-WebGL フォールバック → 生存チェックskip」としたが、これは
**ヘッドレスWebGLが一時的に死んだ状態と見分けがつかない**。さらに悪いことに、死に方には
「canvasは存在し、`useFrame` も回り続け、フレームカウンタも進むのに、コンポーザが空フレームしか書かない」
という形があり、これは**生存チェック（`__novaFrames` の前進）を素通りする**。

結果、最終再生成では768の撮影コンテキストだけがこの状態に落ち、**768の全ショットが3D不在のままゲートを通過**した。
サイト側は無傷（実ブラウザでは768も完全描画）で、穴は撮影側にあった。

## 修正（3点・すべて `scripts/shots.mjs`）

| # | 修正 | 中身 |
|---|---|---|
| 1 | canvas不在の扱いを厳格化 | 生存チェックのskipは **URLに `?nogl=1` を明示付与した撮影のみ**。それ以外でcanvasが無ければ `DeadCanvas` → 既存の撮り直し機構に載せる。あわせて `waitForSelector("canvas")` がタイムアウトした時点で即 `DeadCanvas`（20秒待ってから静かに続行しない） |
| 2 | **輝度ゲート**（機械チェック） | 各幅のheroショット時に、**canvas本体**から2Dキャンバスへ `drawImage`（`preserveDrawingBuffer: true` 済み）し、デバイス帯（x25–75% · y50–95%）の最大輝度を測る。**max < 80 なら死亡扱いで撮り直し**。1フレームの遅れで落とさないよう約1.4秒（350ms×4回）再サンプルしてから判定。3回失敗すれば `errors` に積んで **exit 1**（素通り禁止） |
| 3 | 撮り直しのエスカレーション | 新しいコンテキストを作るだけでは復旧しない（**1440が3コンテキスト連続で空フレーム**だった）。試行間に**ブラウザごと再起動**（GPUプロセスごと入れ替え）＋1.5秒クールダウン。上限は既存どおり3回。撮り直しログに失敗理由（`device band stayed dark: max …` 等）を出すようにした |

輝度は**スクリーンショットではなくcanvasのピクセル**を測る。ヒーローの同じ帯には白い `Pre-order · $299` ピルが
乗っており、合成後の絵を測ると3Dが消えていても max 255 になってしまうため。

## 実測値（今回の再生成・しきい値80）

| 幅 | max輝度 | avg輝度 | 判定 |
|---|---:|---:|---|
| 1440 | **255.0** | 13.2 | PASS |
| 768 | **255.0** | 24.3 | PASS |
| 390 | **255.0** | 25.8 | PASS |

**撮り直し 0回**（3幅ともブラウザ1つで一発通過）。この値は `harness/shots/loop3/manifest.md` にも記録される。

> avgが設計側の実測（1440=33.4 / 768=55.1 / 390=45.0）より低いのは**測る面が違う**ため。設計側は合成後のスクリーンショット（文字やピルの白を含む）、こちらはcanvas単体（3Dだけ・描かれていない領域は0）。**ゲートに使うのはmax**で、生きた描画は3幅とも255（リングがクリップする）、死んだ描画は0付近＝しきい値80は両者から十分離れている。

## ゲートが本物だった証拠

修正2を入れた最初の検証runで**1440が3回連続で暗いと判定**された。そのとき書かれていた
`1440-nav-top.png` を目視したところ、**デバイスもダストも無い空の画面**（CSSフォールバックの輪も無い＝
canvasは生きているのに何も描いていない状態）だった。誤検知ではなく、**従来なら素通りしていた不良フレームを
初めて捕まえた**ということ。修正3を追加した本番runでは同じ1440が一発で max 255 を返している。

## 再生成と目視確認

- **65枚を全再生成**（`harness/shots/loop3/` の64枚＋`public/og.png`）・**console errors 0**（`console-errors.log` = `(none)`）・exit 0
- 768の5枚を目視確認：**すべてデバイスが写っている**
  - `768-hero-default` — 本体シルエット＋リング＋鏡面ハイライト、ダストも出ている
  - `768-cta-default` — 見出しと$299の間の帯にデバイスが大きく座っている
  - `768-technology-50pct` — 右カラムに分解ビュー（項目03アクティブ）
  - `768-everyday-default` — 右にデバイス、リングがMorningの琥珀色（シーン色連動も生きている）
  - `768-reveal-50pct` — 左に横向きプロファイル（ステップ02）
- `public/og.png` も差し替え済み・デバイス全景が入っていることを目視確認
- 1440も目視確認（修正前に空だったヒーローにデバイスが戻っている）

## この節でのサイト変更

**なし。** `src/` ・テスト・設定は一切触っていない。前回の追記1で通した typecheck / build / test の結果はそのまま有効
（`scripts/shots.mjs` は型検査対象なので `npm run typecheck` は今回の修正後も0エラーで再確認済み）。
