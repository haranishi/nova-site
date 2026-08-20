# Loop 1 — implement 受領書

- 工程: implement（契約 `nova-webui-v1.yaml` / ブリーフ `docs/07-IMPLEMENT-BRIEF.md`）
- 日付: 2026-08-17〜18
- 結果: **PASS**（typecheck / build / Playwright 12spec / shots すべて通過）

## ゲート結果（証拠）

| ゲート | コマンド | 結果 |
|---|---|---|
| 型 | `npm run typecheck` | 成功（出力なし＝エラー0） |
| ビルド | `npm run build` | 成功（Next 16.3.1 / Turbopack・`/` は静的プリレンダ） |
| E2E | `npm run test` | **27 passed / 3 skipped / 0 failed**（12 specファイル × desktop+mobile） |
| スクショ | `node scripts/shots.mjs --loop 1` | 56枚生成・**console errors 0**（`harness/shots/loop1/console-errors.log` = `(none)`） |

skip 3件は意図的なプロジェクトガード：`nav.spec` のモバイルメニュー（desktopでは存在しない）、
`responsive.spec` の3幅走査（自前でviewportを切るためdesktopのみ）、同ファイルのタップ領域（mobileのみ）。

初期JS実測: **gzip 229KB**（バジェット 600KB 以下）＋CSS gzip 8KB。3D一式は `next/dynamic` の
別チャンクで、初期スクリプトには含まれない。

## 変更ファイル一覧（新規のみ・既存の変更は `next.config.ts` と自動生成の `tsconfig.json`）

```
src/app/layout.tsx            metadata/OGP/canonical・next/font・skip-link
src/app/page.tsx              9セクションの組み立て（サーバー）
src/app/globals.css           @theme トークン・プリミティブ・モーション定義
src/app/icon.svg              favicon（黒角丸＋光輪グリフ）
src/lib/copy.ts               コピーデッキ逐語（05から機械照合済み・後述）
src/lib/motion-state.ts       非リアクティブなスクロール状態＋tick購読＋数学関数
src/lib/store.ts              zustand（離散UI状態のみ）
src/lib/scroll-engine.ts      単一rAFループ・Lenis・区間計測・帯跨ぎのみsetState
src/lib/damp.ts               λ指定の指数減衰（仕様の damp λ 表記に一致）
src/lib/hooks.ts              useInViewOnce / usePageHidden
src/components/SiteShell.tsx  クライアント境界・WebGL判定・canvas dynamic(ssr:false)
src/components/Nav.tsx        固定ナビ・アクティブ表示・全画面モバイルメニュー
src/components/ui/PreOrderButton.tsx
src/components/ui/PreOrderDialog.tsx  唯一のモーダル（フォーカス管理・Esc・trap）
src/components/canvas/SceneCanvas.tsx Canvas・HDRI・ライト・Bloom・粒子
src/components/canvas/NovaDevice.tsx  プロシージャル9部品＋explode適用
src/components/canvas/Rig.tsx         ポーズ表・explode・リング発光・ハロー
src/components/canvas/runtime.ts      部品レイアウトとテック項目→部品の対応
src/components/sections/{Hero,Reveal,Experience,Technology,Everyday,Specs,Cta,Footer}.tsx
playwright.config.ts          desktop 1440×900 / mobile 390×844・webServer=next start
tests/e2e/helpers.ts + 12 spec（smoke, meta, nav, chat, everyday, tech-reveal,
                                cta, share, responsive, reduced-motion, fallback, a11y-basic）
scripts/shots.mjs             3幅撮影・段階スクロール・manifest・console収集・og.png生成
public/og.png                 1200×630（shots が生成）
```

## コピー照合

`src/lib/copy.ts` の文字列 136 件を `docs/05-COPY-DECK.md` に機械照合。プロース文は**全件一致**。
不一致として残るのはコピーでないもののみ＝アンカー（`#product` 等）・シーン色（`#ffb37a` 等）・
`Copied`（03-DESIGN-SPEC §9 由来）・Revealキッカー `01 — ASK` / `02 — REMEMBER` / `03 — CONTROL`
（03-DESIGN-SPEC §3 の表記を採用。05では「01 ASK —」と一覧形式で書かれている同一内容）。

## 仕様からの逸脱と理由

**構図（実装して初めて崩れが判明した箇所）**

1. **Heroの3D位置**: ポーズ表 `0,-0.55,0 / scale 1.0` はH1(190px)＋タグラインと重なり、
   タグラインがリング上に乗って読めなかった。`0,-1.25,0 / 0.92`（mobile `0,-1.05,0 / 0.68`）へ。
   あわせて本文を `pt-[15vh]` の上寄せにし、下端に 26vh の黒フェードを追加（デバイスが
   ビューポート下端でぶつ切りになるのと、スクロールキューが金属リムに重なるのを解消）。
2. **短い縦幅への追従**: 文字はpx・3Dはvh基準のため、縦630px（OG枠やノートPCの小窓）でHeroが
   再衝突する。`vh<820` で連続的にデバイスを下げる補正を追加（900pxでは補正0＝仕様どおり）。
3. **Experienceの3D位置**: `-1.7` では会話パネルの字幕直下に潜り込み可読性を落とす。`-2.2` へ。
   さらにパネルへ `backdrop-blur-md` を追加（背後を通るデバイスが「すりガラスの奥の光」になり、
   衝突が奥行き表現に変わる。戦略層の「NOVAが持たない画面」の暗喩とも整合）。
4. **タブレット幅の横位置とサイズ**: desktopポーズは16:9前提で、768×1024では `±1.35/±2.2` が画面外へ、
   さらに3Dの見かけの大きさは縦基準なので横幅を食いテキスト段に重なる。`target.x` と `target.s` に
   「可視半幅の比率」を掛ける補正を追加（1440×900では係数1.0＝仕様どおり）。
   Everydayの左下デバイスは 1024px 未満では画面外へ退避（仕様「desktopのみ」の意図を
   md=768 ではなく lg=1024 で解釈。768では引用文とチップに重なるため）。
5. **Technology mobileポーズ**: `0,0.25,0 / 0.6` では分解した最上部リングがH2に重なる。
   `0,-0.35,0 / 0.52` へ（H2の下・アクティブ項目の上に収まる）。
6. **CTAの縦構成**: 中央寄せだと価格とボタンがデバイス上に乗る。
   `justify-between py-[13vh]`（見出し上／デバイス中央／価格＋ボタン下）に変更。
7. **micRing の y**: 仕様 `.24` は碁石プロファイル上では空中に浮く（r0.8の面は y≈0.165）。
   本体表面に接地させ、半径も .02→.031（4kのスクショで視認できる最小サイズ）。
8. **Revealの進捗レール**: `md:` 表示だと768pxで本文と15pxしか離れない。`lg:` 以上に変更。

**レンダリング／実装**

9. **ライト強度**: 仕様の spotLight 2.5 / pointLight 6 は three r155+ の物理単位では距離二乗減衰で
   ほぼ効かない。`decay={0}` にして「スタジオライト」として使い、強度は 0.9 / 1.9 に下げた
   （clearcoatの鏡面が1.0を超えるとBloomに拾われ「光輪限定」が崩れるため）。
   Bloom の `luminanceThreshold` も 1 → 1.18（+ smoothing .2）。狙い＝発光リングのみが滲む。
10. **ワードマークのグラデ**: `background-clip:text` は**transform を持つ子孫の字形を拾わない**。
    マスクreveal用に各文字へ transform を当てているため、h1にグラデを置くと完全に不可視になった
    （初回スクショで発覚）。グラデを文字spanへ移し、`@supports` フォールバックも追加。
11. **絶対配置の落とし穴**: 絶対配置の子はコンテナの**パディング境界**を基準にするため、
    `.nova-shell` のガター（24/40px）が効かず768pxで本文が画面外へ溢れた。Revealの3帯を
    flexレイアウトへ書き換え、ガターと 1200px 上限が効くようにした。
12. **canonical の末尾スラッシュ**: Next のメタデータ解決はルートURLを origin に丸め、
    `https://nova.example.com`（スラッシュなし）になる。コピーデッキは末尾スラッシュ付きが正なので
    `next.config.ts` に `trailingSlash: true` を追加（唯一のルートが `/` なので副作用なし）。
13. **`preserveDrawingBuffer: true` を追加**: ヘッドレスChromiumが約10回に1回、WebGLレイヤー抜きで
    合成したフレームをスクショに残す（＝3Dが消えたように見える偽陽性）。バッファ保持だけでは
    完全には防げなかったため、`shots.mjs` 側でも**同一状態を最大3回撮影し情報量の多い1枚を採用**
    （空フレームはPNGが約4割小さくなるので判別できる）。manifest にもこの旨を明記。
14. **Everyday の自動送り**: タブを手動で選んだ時点で自動送りを恒久停止（仕様の
    hover/focus/reduced/非表示に加えた）。ユーザー操作を機械が上書きしない方が正しく、
    テストと撮影も決定的になる。
15. **Specs の値/単位分割**: 仕様は「値40px＋単位16px」。コピーは逐語厳守のため
    `num`＋`value`＋`unit` に分解し、連結すると `86 g` `4-mic array` `Wi-Fi 6E · BT 5.4` が
    デッキと1文字も違わないよう構成。カウントアップは数値先頭の3行のみ。
16. **ナビの背景不透明度**: `bg-bg/60` だと白いPre-orderピルが下を通る瞬間、
    backdrop-blur越しに白い雲として滲む。`/72` に上げた。
17. **モバイルメニューの重なり順**: オーバーレイがナビ内バーを覆い、閉じる×が見えなかった。
    バーを `z-[70]` に上げてロゴ・Pre-order・×を常時可視化。

**判断（仕様に明記がなかった点）**

- 会話デモの初期状態は「返答なし」を維持し、空欄が寂しくならないよう装飾のみの
  アイドル波形（aria-hidden）を置いた。コピーの追加はしていない。
- チップ／タブの高さはモバイル44px・デスクトップ40px（仕様の h-10 と A11y の44px要件の両立）。
- Everydayのシーン色は暖橙・藍紫・シアン・紫の4色。赤緑対比なし、色相＋ラベル＋アイコン形状の
  三重符号化（UX5表層の判断7）。

## 既知の残課題（周2以降の候補）

- **鏡面ハイライトの白飛び**: Reveal step2（ほぼ真横から見る薄型プロファイル）で studio HDRI の
  ライトパネル反射が大きな白い塊になる。Bloom閾値では抑えたが形は残る。
  環境マップの回転かパネル反射の弱いHDRIへの差し替えで改善余地あり。
- **fullPageスクショに3Dが写らない**（仕様どおり／manifest に注記済み）。採点は viewport 撮影で。
- Technologyのモバイル表示は「アクティブ1項目＋進捗ドット5」で、5項目の一覧性はデスクトップのみ。
- `tsconfig.json` の `exclude` に `tests` があるため、specファイルは `tsc` の型検査対象外
  （Playwright実行時にトランスパイルのみ）。意図的にスキャフォールドのままにしている。
- 常駐プロセスは全て停止済み（`next start` / `next dev` は残っていない）。
