# NOVA ブランドサイト 要件定義

## 目的
架空パーソナルAIデバイス「NOVA」の公式ブランドサイト。Apple / Nothing / Linear / Tesla 級の
「未来的・高級・技術力・触って気持ちいい」を目指す。テンプレLPではなく 3D×スクロール演出×
インタラクションで世界観を作る。**実験文脈**: ハーネス3周の効果検証（周1状態を別保存して比較）。

## 成功条件（証拠で判定）
1. `npm run typecheck` / `npm run build` / `npm run test`（Playwright 全spec）が全パス
2. 3幅（390 / 768 / 1440）スクショで横スクロール・崩れなし
3. 視覚採点 16/20 以上かつ 0点項目なし（Web制作ハーネス採点表）
4. コンソールエラー 0（全スクロール行程＋全インタラクション中）

## スコープ
- 9セクション: Nav / Hero / Product Reveal / AI Experience / Technology / Everyday / Specs / CTA / Footer
- スクロール連動3D（固定Canvas上の単一デバイスが全編を旅する）・Exploded View・疑似AI会話デモ
- シェア4点セット（navigator.share / X intent / LINE / コピー）+ OGP + canonical【必須・契約1-2】
- prefers-reduced-motion 対応・WebGL非対応フォールバック（`?nogl=1` で強制可）
- 対象外: 実AI接続・決済・CMS・多言語・SEO本格対策・デプロイ

## 技術（確定）
- Next.js 16 (App Router, TS) / Tailwind v4 / three + @react-three/fiber v9 + drei v10 +
  @react-three/postprocessing / framer-motion / lenis / zustand / maath
- 外部素材: `@pmndrs/assets` の studio HDRI（Poly Haven 由来・CC0）。3D本体はプロシージャル構築
  （理由: 要件の円形ミニマル黒デバイスに合致する既製GLBは期待できず、コード構築が最も世界観に忠実）
- フォント: next/font/google — Space Grotesk（ディスプレイ）+ Inter（本文）。等幅はシステムスタック

## 品質バジェット
- 初期JS < 600KB gz / LCPはヒーローテキスト（SSR・Canvasはdynamic ssr:false）/ CLS ≈ 0
- Canvas: dpr上限 デスクトップ2・モバイル1.5 / Bloomはモバイルで簡略 / 3Dはリング発光のみBloom対象
- 文字コントラスト: 本文 #b9c0cc on #050507 (≈10:1)・補助 #848c9c (≥4.5:1)・#7b8294 未満の本文禁止

## ループ計画（契約 nova-webui-v1.yaml）
- 周1: 実装→機械検証→3幅スクショ→ **rsyncで ~/Projects/nova-site-loop1 に保存（=1回実行版・port 3001）** →採点#1
- 周2: TOP5修正→検証→スクショ→ nova-site-loop2 保存（port 3002）→採点#2
- 周3: TOP5修正→検証→Codex read-onlyレビュー→致命指摘反映→スクショ→採点#3 → 最終形（=ハーネスあり版）
- 停止: 同一指摘2周連続 / 3周で16点未達 → NEEDS_HUMAN として本人へ

## 制約
- git 操作一切なし（スナップショットは rsync）。リポ外への書き込み禁止。公開・デプロイは本人のみ
