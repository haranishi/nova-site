# 周4ミニ — implement 受領書

- 工程: implement（指示書 `docs/10-FIX-LOOP4-MINI.md` / 根拠 `harness/eval/loop3-score-final.md` 採点#3′ 項目4=0点）
- 日付: 2026-08-18
- 結果: **PASS**（typecheck / build / test / shots すべて通過・768の4件と主ボタンを目視確認）
- スコープ: 指示書の2点のみ。TOP10の残り8件・1440/390の見た目・依存・gitには触れていない。

## ゲート結果

| ゲート | コマンド | 結果 |
|---|---|---|
| 型 | `npm run typecheck` | 成功（出力なし＝エラー0） |
| ビルド | `npm run build` | 成功（Next 16.3.1 / Turbopack・`/` 静的プリレンダ） |
| E2E | `npm run test` | **37 passed / 3 skipped / 0 failed**（周3と同数。skip 3件は同じ意図的ガード） |
| スクショ | `node scripts/shots.mjs --loop 3` | 65枚・exit 0・**console errors 0**・輝度ゲート `1440 max 255.0 / 768 max 255.0 / 390 max 255.0`（しきい値80） |

## 修正1 — 768帯（768–1023px）の3D衝突・見切れ

**変えた考え方**: 2カラムは `lg`(1024px)以上だけのものにした。768には「デバイスが住める列」が無い
（自由な側は300px台）ので、タブレット帯は390と同じ縦積み＝デバイス上・コピー下に統一した。
中心線に置いたデバイスは、中央寄せの見出しを横断できず、右端に届いて切られることもない＝
4件の指摘を1つの根で消している。

| ファイル | 変更 |
|---|---|
| `src/components/sections/Reveal.tsx` | `BLOCK` / `LEAD` / バンドの整列 / リードの測幅を `md:` → `lg:`（値は同じ）。768は `items-end pb-[10vh]`・全幅・左揃えになる |
| `src/components/canvas/Rig.tsx` | reveal1/2 の `t` を `[1.05,0,0,0.56]`・`[-0.9,0,0,0.58]` → **`[0,0.55,0,0.7]`**、reveal3 の `t` を `[0,-1.3,-0.4,0.5]` → **`[0,0.6,-0.4,0.62]`**（横オフセット0＝中央上・1024px の背丈に合わせて mobile 列より拡大） |
| `src/components/canvas/Rig.tsx` | everyday の `t` を `[0.85,-0.15,0,0.56]` → **`[0.91,-0.15,0,0.52]`** |

### before / after（PNG実測・合成後の画面から）

| 指摘 | before | after |
|---|---|---|
| `768-reveal-50pct` デバイスが見出しを横断 | 本体が「Remember everything…」の字面に接触 | デバイス y324..412 / 見出し帯 y714..843 ＝ **302px の空き**・接触なし |
| `768-reveal-15pct` 右リムが768pxで直線切断 | 右端が画面外 | シルエット **x220..548**（左右とも余白220px）＝切断なし |
| `768-reveal-15pct` 本文右端との逃げ16px | グローが本文にかぶる | 縦積みなので横の逃げは論点でなくなった。デバイス下端 y544 → キッカー上端 y765 の間は輝度11–25の背景だけ＝**221px クリア** |
| `768-everyday-*` タブ右端との逃げ15px | デバイス左端 **x449**（コピー列は x439 で終わる）＝**10px** | デバイス左端 **x472** ＝ **33px**（要件32px以上）・右余白50px |

> 逃げの数値は列プロファイル（y513..613 の各列の最大輝度）で取った。x440..471 は輝度58→150へ
> なめらかに上がるアンビエントグロー、x472 で250へ跳ぶのが本体の実エッジ。before は x449 で跳んでいた。

### 1440 / 390 を変えていない証拠
同一コードで撮影を2回走らせ、**ダスト粒子の乱数による撮影ノイズの床**を測った（最大 0.966% / 平均|Δ|1.185）。
周3→今回の差分を同じ尺度で見ると:

- 1440・390 の非ダイアログ全フレーム: **すべてノイズ床以下**（最大は `1440-technology-20pct` 0.945%＝ノイズ床0.923%と同値）
- `*-page-fullpage.png` は3幅とも**バイト一致**（DOMレイアウトは無変化）
- 変わったのは意図した3群だけ: `768-reveal-*` **12.1–31.0%** / `768-everyday-*` **3.2%** / `*-dialog-open` 0.16–0.62%
- `*-dialog-open` はモーダルがcanvasをぼかすためノイズ床が **0px（max Δ=1）**＝差分は100%ボタン入れ替えのぶん

## 修正2 — ダイアログ主従（05-COPY-DECK 改訂4）

| ファイル | 変更 |
|---|---|
| `src/components/ui/PreOrderDialog.tsx` | primary（白ピル・`mt-7`）を `dialog-forward`＝**Explore the technology** に、`dialog-copy`＝`Copy link` を `nova-ghost` の副に降格。DOM順も primary→ghost→Close に合わせた |
| `src/lib/copy.ts` | `DIALOG` のコメントを改訂4に更新（**文言は改訂3から不変**。ピルを着る側だけが動いた） |
| `tests/e2e/cta.spec.ts` | 文言だけでなく**背景色**を検証（forward=`rgb(255,255,255)` / copy≠白）。周3は同じ2文言が逆の役で通ってしまっていた |

- `Copied` 表示・クリップボード・`Close` テキストリンク・右上×（45px）・Esc・フォーカス復帰は現状維持。
- 初期フォーカスは `dialog-close` のまま（「Close・×は現状維持」の指示に従い変更なし）。
- フォーカストラップはDOM順を走査するだけなので、並び替えで壊れない（cta.spec の Tab/Esc/×/Close 4系統とも緑）。
- 3幅（1440/768/390）の `dialog-open` を目視確認。**白ピルは Explore the technology**・その下に ghost `Copy link`・
  さらに下に下線付き `Close`。

## テスト出力（末尾）

```
  ✓  38 [mobile] › tests/e2e/smoke.spec.ts:11:5 › page loads and all nine sections come into view (4.6s)
  ✓  39 [mobile] › tests/e2e/tech-reveal.spec.ts:13:5 › technology pin walks through all five items (4.8s)
  ✓  40 [mobile] › tests/e2e/tech-reveal.spec.ts:40:5 › reveal bands fade in one after another (2.8s)

  3 skipped
  37 passed (1.8m)
```

```
· 65 screenshots → harness/shots/loop3
· console errors: 0
```

## 申し送り

- Reveal のセクション高 `md:h-[220vh]` は据え置き（スクロール長で衝突には無関係のため、指示書のスコープ外）。
- `technology` の `t` ポーズ（デバイス左端 x437・コピー列と近接）は採点TOP10の4番と別件で、今回は触っていない。
- `public/og.png` は shots 実行で再生成される。周3比 0.415%＝ダストノイズの範囲で、OGポーズ自体は無変更。

## 設計側検収（追記）
- ゲート再実行: typecheck ✓ / test 37 passed, 0 failed ✓（設計側で独立確認）
- 768-reveal-50pct を設計側でも目視: 衝突解消・切断なし・上下分離良好
- 決定の反映: ダイアログ primary=Explore the technology（本人決定 2026-08-18）・コピーデッキ改訂4と一致
- port 3000 を新ビルドで再起動済み（3001/3002は継続稼働）→ 実験環境3面とも稼働確認
