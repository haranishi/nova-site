# デザイン仕様（トークン・レイアウト・A11y）

## トークン
- 色: `--bg:#050507` `--bg2:#08090e` `--fg:#f4f6f8` `--body:#b9c0cc` `--dim:#848c9c`（最小補助 #7b8294）
  `--hairline:rgba(255,255,255,.08)` `--accent:#7c8cff` `--accent-text:#a5adff`（黒上テキスト用）
- 書体: display=Space Grotesk(変数,500–600, tracking -0.02〜-0.04em) / 本文=Inter(400,1.65) /
  ラベル=ui-monospace 11px uppercase tracking .25–.3em
- 型: H1 hero `clamp(88px,15vw,190px)` / H2 `clamp(40px,6vw,72px)` / 機能見出し `clamp(40px,6.5vw,84px)` /
  リード 18–20px `--body` max-width 44ch / 本文 16px
- 面: 角丸 full(ボタン)・16px(パネル)。影なし（発光と髪線のみ）。セクション余白 py 160px(desktop)/96px(mobile)
- コンテナ: max-w 1200px, px 24(mobile)/40。フォーカス: `:focus-visible` → 2px #a5adff outline offset 3px（全対話要素）

## セクション仕様（コピーは 05-COPY-DECK 逐語）
1. **Nav** 固定 h-16。左=NOVA(11px tracking .32em)。右=4リンク(14px Inter 500 `--body`→hover `--fg`)+Pre-orderピル
   (h-9 px-5 白地黒字13px600・hover scale1.03+薄グロー・active .97)。初期透明→scroll>40で bg #050507/60+blur-xl+下髪線
   (300ms・`data-scrolled`)。アクティブセクションのリンクを白+下ドット。Mobile(<md): 44pxバーガー→全画面オーバーレイ
   (黒/95+blur, リンク32px SG 60msステガー, Esc/リンク/scrimで閉, スクロールロック, フォーカスは overlay 内へ)。
2. **Hero** 100vh(min 640px)。中央: ピル型キッカー(髪線枠)→NOVAワードマーク(白→#8b93a5の縦グラデ, 発光なし)→
   タグライン2行(Inter 300 clamp(20px,2.6vw,28px) `--body`)。下中央スクロールキュー(1×56pxグラデ線が伸縮+SCROLL 10px)。
   登場: マスクreveal(translateY110%→0,600ms,easeOutQuart,字間30msステガー)→タグ行→キュー。総計≤1.4s。3D=背後中央下。
3. **Product Reveal** 外側320vh(desktop)/220vh(mobile)・内側sticky100vh。3ステップ帯: キッカー`01 — ASK`(mono,
   accent-text)+見出し+リード。desktop: テキスト幅≤40%をstep1左/step2右/step3中央下に配置、3Dが逆側へ移動。
   mobile: 3D上45vh・テキスト下中央。各帯 local t 0–.15 fade-in / .85–1 fade-out(translateY 24px)。
   右端に進捗レール(h-40vh 1.5px 白/10, accentグラデfill scaleY, ドット3, desktopのみ)。
4. **AI Experience** 通常フロー min-100vh。中央ヘッダ→パネル(max-w-3xl, bg white/3 border髪線 rounded-2xl)。
   上段: オーブ(48px, アイドル=呼吸リング/発話=5本イコライザ)+状態mono(`NOVA — LISTENING/SPEAKING`)。
   中段: 字幕型トランスクリプト(user右寄せ15px `--fg`/NOVA左寄せ15px `--body` タイプライタ16ms/char+点滅カーソル,
   aria-live=polite, 高さ固定≈190pxでCLS0)。下段: 質問チップ5(髪線ピル h-10 px-4 13px, hover bg白/6, 連打は現行中断)。
   発話中は3Dリングが脈動(store.speaking)。
5. **Technology** 外側300vh/220vh sticky。desktop: 左=キッカー+H2+5項目リスト(index mono→active accent-text,
   名称20px SG, 説明14px `--dim` はactiveのみ展開, 非active名称 #7b8294)、右=3D分解(60%)。activeパーツ位置に
   ハローリング(3D内単一機構)が移動。mobile: H2上・3D中40vh・active項目のみ下部クロスフェード+進捗ドット5。
6. **Everyday** min-100vh。ヘッダ→タブ4(髪線ピル h-11, active=bg白/8+白字+シーン色アイコン, 2×2 grid on mobile)
   →カード領域(max-w-2xl): 大引用(clamp 22–28px Inter300 `--fg`)+コンテキストmono(`07:15 — KITCHEN`)+チップ3。
   背景に60vwラジアルグロー(シーン色12%透過,800ms遷移)。自動送り5s(hover/focus/reduced/非表示で停止,
   activeタブ下に5s線形プログレス線)。切替=クロスフェード400ms(AnimatePresence)。3Dは左下小・リング色連動(desktopのみ)。
7. **Specs** py200/120。3×2grid(md:2col/sm:1col, 行間はborder-t髪線のみ・カード禁止)。セル: mono label→
   値40px SG tabular(+単位16px `--dim`)→補足13px `--dim`。数値はinView時カウントアップ800ms(1回のみ)。
8. **CTA** min-110vh中央。3D=中央大。H2 `clamp(56px,10vw,120px)`→価格行($299 24px SG+補足14px)→Pre-orderボタン
   (h-14 px-10 白ピル16px600, マグネット±8px spring, hoverでシャインスイープ+3Dリング増光, click→ダイアログ)。
   ダイアログ: 中央 max-w-sm bg#0b0c12 border髪線 rounded-2xl p-8, scale .96→1 200ms, Esc/scrim/Close, フォーカス管理。
9. **Footer** 上髪線 py-20。ロゴ+タグ→4列(Product=アンカー4 / Company・Legal=無効span title="Fictional" /
   **Share**: navigator.share時のみ「Share…」+X+LINE+Copy link(role=status「Copied」4s)+IG/YT注記1行12px)。
   下段: © 2026 NOVA — design study 表記 12px `--dim`。

## A11y・レスポンシブ規則
- h1は1個(hero)。順序h1→h2。Canvasはaria-hidden・pointer-events-none。skip-link(`Skip to content`)先頭。
- 全ボタン44×44px以上(タップ領域)。ホバー依存禁止(全情報はクリック/フォーカスでも到達)。
- reduced-motion: 自動回転・浮遊・脈動・自動送り・タイプライタ・カウントアップ停止(即時表示)。スクロール連動の
  ポーズ追従は維持(ユーザー駆動)だが減衰を速めフワつき除去。Lenis無効=ネイティブスクロール。
- 767px以下=1カラム・3D左右移動なし。横スクロール絶対禁止(全幅でscrollWidth==clientWidth)。
- WebGLなし/`?nogl=1`: Canvas非搭載、CSSグロー+シルエットの`[data-canvas-fallback]`。全文閲覧可能を維持。
