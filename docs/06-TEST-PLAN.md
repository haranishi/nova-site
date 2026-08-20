# テスト計画（機械検証ゲート＝これが通らないと採点に進めない）

## ゲート
`npm run typecheck` → `npm run build` → `npm run test`（Playwright, chromium）全パス＋ shots スクリプトの
コンソールエラー収集 0 件。テスト不在・不合格は実装差し戻し。

## Playwright 構成
- `playwright.config.ts`: webServer=`npm run start`(port3000, reuseExistingServer)。テスト前に build 済み前提
  （`npm test` 実行手順: build→test）。projects: `desktop`(1440×900) / `mobile`(390×844, タッチ)。
- 全specで `page.on('pageerror'/'console' type=error)` を収集し、テスト末尾で 0 件をassert（許容リストなし）。

## Spec 一覧（tests/e2e/）
1. `smoke` — `/` 200・h1=1個・タイトル一致・段階スクロールで9セクション全て可視化・収集エラー0
2. `meta` — og:title/description/image・canonical=`https://nova.example.com/`・favicon・viewport
3. `nav` — リンク4+ロゴ+Pre-order可視／Technologyクリック→該当セクションが2.5s以内にビューポート内／
   スクロール後 `data-scrolled` 付与。mobile: バーガー開閉・リンクで閉じて遷移・Escで閉
4. `chat` — チップ5個・クリック→ユーザー行→NOVA返答（期待文先頭一致）6s以内・aria-live存在・連打で置換
5. `everyday` — タブ4・Travelクリックで引用文変化・aria-selected移動
6. `tech-reveal` — Technologyピン区間を段階スクロール→5項目が順に`data-active`／Reveal3帯が順に不透明度>0.9
7. `cta` — Pre-orderクリック→dialog可視・内部フォーカス・Esc閉・フォーカス復帰
8. `share` — Xリンクhref=`https://x.com/intent/post?text=…&url=…`(canonicalエンコード一致)・LINE href一致・
   Copyクリック→clipboard==canonical(権限付与)・navigator.share無し環境では「Share…」非表示+注記可視
9. `responsive` — 390/768/1440で複数スクロール位置の `scrollWidth<=clientWidth+1`・mobileの主要ボタン高≥40px
10. `reduced-motion` — emulateMedia(reduce)で全セクション可視・チャット返答が即時(≤1.5s)・横スクロールなし
11. `fallback` — `/?nogl=1` で canvas 非存在・`[data-canvas-fallback]`存在・全セクション可視・エラー0
12. `a11y-basic` — 全buttonにアクセシブルネーム・Tab移動でPre-orderに可視フォーカス表示・canvas aria-hidden

## スクショスクリプト `scripts/shots.mjs`（採点用・契約§4-1対応）
- 使い方: `node scripts/shots.mjs --loop 1`（出力 `harness/shots/loop1/`）。`.next/BUILD_ID`無ければbuild→
  `next start -p 3010` を自身でspawn→撮影→kill。
- 3幅: desktop1440×900 / tablet768×1024 / mobile390×844。撮影前に**段階スクロール往復**でreveal発火。
- ビューポート撮影（主資料）: hero / reveal@15·50·85% / experience(素+チップ1クリック返答後) /
  technology@20·50·80% / everyday(既定+2番目タブ) / specs / cta / footer / nav(top+scrolled) /
  mobileバーガー開 / dialog開。ファイル名=`{width}-{section}-{state}.png`。
- fullPage（構造確認の副資料）: 撮影時のみ fixed要素(nav)とcanvasを`visibility:hidden`。
  ※ **3DはfullPageに写らない仕様**——採点者への注記をmanifestに明記（偽陽性防止・契約§4-1）。
- `manifest.md` を同ディレクトリに生成: 各ファイル＝幅/セクション/進捗/操作/注意点の表＋上記注記。
- 撮影中の console error / pageerror を `console-errors.log` に収集。1件でも exit 1（ゲート）。
- おまけ: desktopのhero を 1200×630 で `public/og.png` に保存（OGP画像）。

## 撮影の落とし穴（過去実績由来・厳守）
- fullPageはstickyが初期位置で焼き込まれる→ピン演出の中間状態は必ずビューポート撮影で。
- スクロール連動サイトを即時fullPage撮影すると「全部消えている」偽陽性→段階スクロール必須。
- 撮影解像度は deviceScaleFactor=1（ファイルサイズと読解性のバランス）。
