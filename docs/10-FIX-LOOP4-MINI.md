# 周4ミニ 修正指示書（本人決定によるスコープ限定・採点ループなし）

本人決定（2026-08-18）: ①768の傷だけ直す ②ダイアログ主ボタン=`Explore the technology`。
根拠採点: `harness/eval/loop3-score-final.md`（採点#3′）の「衝突・見切れ（768が集中）」群。

## 修正1: 768（タブレット帯 768–1023px）の3D衝突・見切れの根絶
採点#3′で実在確認済みの4件を、**同じ根（tポーズが2カラム前提）ごと**解消する:
- `768-reveal-50pct` デバイス本体とリムハイライトが見出し「Remember everything…」の背後を横断
- `768-reveal-15pct` 球体右リムがビューポート右端(768px)で直線切断
- `768-reveal-15pct` 本文右端とデバイスの逃げ16px（グローが本文にかぶる）
- `768-everyday-*` タブ右端とデバイスの逃げ15px

**推奨アプローチ**（採点者提案・設計側承認済み）: Revealはタブレット帯を**390と同じ縦積み構成**
（デバイス上・テキスト下中央）に切り替える＝2カラムは lg(1024px)以上のみ。Rig の t ポーズも
縦積み用（中央上・スケール抑制で外接円を画面内に）へ。Everyday は t ポーズの x/scale を調整し
タブ・テキストとの間隙を最低32px確保。**1440と390の見た目は1pxも変えない**こと。

## 修正2: ダイアログ主従の最終形（05-COPY-DECK 改訂4）
- **primary（白ピル）= `Explore the technology`**（閉じて#technologyへスクロール。既存の前進リンクを昇格）
- secondary（ghost）= `Copy link`（→`Copied`表示は維持）
- `Close` テキストリンクと右上×は現状維持。フォーカス管理・Esc・テスト（cta.spec等）も整合させる

## ゲート（全部必須）
1. `npm run typecheck` / `npm run build` / `npm run test` 全パス（ダイアログ変更に伴うspec更新可。緑維持）
2. `node scripts/shots.mjs --loop 3` 再実行（console 0・輝度ゲート通過）→ 768の該当4フレームと
   dialog-open 3幅を**目視確認**（衝突・切断・16px逃げが消えたこと／主ボタンが Explore… であること）
3. 受領書 `.agent-harness/runs/loop4-mini-implement.md`（変更ファイル・before/after の説明・テスト出力末尾）
4. 常駐プロセス全kill

**やらないこと**: 上記2点以外の指摘（TOP10の残り）には触れない。1440/390の視覚変更禁止。依存追加・git禁止。
