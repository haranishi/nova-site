# 実装ブリーフ（implement工程・自己完結）

あなたは NOVA ブランドサイトの実装担当。**このリポジトリ（/Users/hara/Projects/nova-site）内のみ**書き込み可。

## 最初に読む（この順）
1. `docs/01-REQUIREMENTS.md`（成功条件・バジェット）
2. `docs/03-DESIGN-SPEC.md`（トークン・全セクション仕様・A11y）
3. `docs/04-SPEC-3D-MOTION.md`（Canvas・デバイス・ポーズ表・スクロール基盤）
4. `docs/05-COPY-DECK.md`（コピー逐語＝一字一句このまま）
5. `docs/06-TEST-PLAN.md`（テスト12本とshots.mjsもあなたの成果物）
参考: `docs/02-USER-STORIES-UX5.md`（判断に迷ったら戦略層に従う）

## 環境（準備済み）
- 依存インストール済み（package.json固定・**新規依存の追加禁止**。不足があれば受領書に理由を書いて追加可）
- Next 16 / React 19 / R3F v9 / drei v10 / Tailwind v4（postcss.config.mjs 設定済・globals.cssは
  `@import "tailwindcss";` + `@theme` トークン方式）/ TypeScript strict
- Playwright ブラウザはキャッシュ済（chromium）。`npx playwright install` を実行しない

## 成果物（Definition of Done）
1. サイト実装一式（`src/`・`public/`）— 仕様逐語準拠。favicon=`src/app/icon.svg`（黒角丸+光輪グリフ）
2. `tests/e2e/` 12spec + `playwright.config.ts` + `scripts/shots.mjs`
3. **全ゲート通過の証拠**: `npm run typecheck` / `npm run build` / `npm run test` 成功出力
4. `node scripts/shots.mjs --loop 1` 実行済み（`harness/shots/loop1/` 生成・console-errors 0）
5. 受領書 `.agent-harness/runs/loop1-implement.md`: 変更ファイル一覧・仕様からの逸脱と理由・
   テスト出力末尾・既知の残課題
6. 各開発サーバー・プロセスは終了させてから完了報告

## 実装上の注意
- 「use client」はセクション/canvas/uiコンポーネントに。`layout.tsx` はサーバー（metadata・フォント）。
  Canvasは `next/dynamic ssr:false`（クライアント境界内から）。ヒーローテキストはSSRで即表示（LCP）。
- zustandはtransient購読（useFrame内 getState）でre-render最小化。rAF内でsetStateしない（帯跨ぎのみ）。
- three の Color/Vector3 はフレーム内 new 禁止（useMemo/モジュールスコープ再利用）。
- Lenis と ネイティブアンカーの競合に注意（`scrollTo` はLenis経由・reduced時はネイティブ）。
- Tailwind任意値とCSS変数を併用してよい。複雑なアニメはCSS keyframes / framer-motion どちらでも、
  ただしスクラブ系はrAF直接駆動（スクロールにバインドしたtweenライブラリの二重管理をしない）。
- ダイアログ・オーバーレイのフォーカス管理は手実装で良い（開時に内部へ、閉時に呼び出し元へ、Esc対応）。
- コンソールエラー・警告（hydration mismatch含む）ゼロを目標。React strict mode 有効のまま。

## 禁止
- git 操作全て／リポ外への書き込み／デプロイ・公開／`npm install <新規>`（受領書なしでは）
- ポート3000/3010以外の常駐プロセス残置

## 完了報告フォーマット（テキストで返す）
`RESULT: PASS|FAIL` ／ ゲート結果3行 ／ shots枚数 ／ 受領書パス ／ 残課題（あれば）
