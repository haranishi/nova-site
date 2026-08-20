# コードレビュー（周3 verify段・Opus別セッション※Codex上限切れのため自動切替・read-only）

総評: 「良好で規律あるコード」。スクロール/モーション基盤（単一rAF・motionState分離・teardown完備・
StrictMode二重呼び出し耐性・ポーズ補間の境界正しさ）は強い。弱点は①失敗時ハンドリング②共有グローバルの
所有権③ビューポート変化への追従、の3クラスタ。

## CRITICAL
1. SiteShell.tsx:57 — SceneCanvasにエラーバウンダリ無し（R3Fは内部エラーを外へ再throw）。HDRI読込失敗や
   three系throwでReactルート全体がアンマウント＝白画面。app/error.tsxも無し
   → CanvasFallbackをfallbackにするError Boundaryで包む＋app/error.tsx追加

## HIGH
2. Nav.tsx:33-41 — 390pxでメニューを開いたまま768px以上へリサイズ/回転するとオーバーレイはmd:hiddenで消えるが
   overflow:hidden＋lenis.stop()が残存＝ページ永久スクロール不能 → matchMedia(min-width:768px)でsetNavOpen(false)
3. PreOrderDialog.tsx:71-76 + Nav.tsx:36-41 — スクロールロックとLenis start/stopを2箇所が独立所有。
   メニュー→ダイアログ→閉じでナビ開のままロック解除される → scroll-engineに参照カウント式lock/unlockを一本化
4. Nav.tsx:67 + PreOrderDialog.tsx:70 — 両オーバーレイが素のwindow keydownを登録。両方開いているとEsc 1回で
   両方閉じフォーカスが競合 → openDialogでナビを閉じる or 最上層ゲート
5. scripts/shots.mjs:388-389 — capture()がバイト数最大の`best`を返す（検証済みの`buf`でなく）＝
   死にフレームの方が大きければそれを採用しうる → `return buf;`にしてbest廃止
6. SceneCanvas.tsx:119-131 — webglcontextlost/restored未処理。GPUリセット後は死んだcanvasがopacity:1のまま
   → context-lostでmode="off"へ倒しCanvasFallbackに引き継ぐ

## MEDIUM
7. SceneCanvas.tsx:108-110 — mobile判定がマウント時1回のみ（dpr/multisampling/Bloom解像度が回転後も固定）→ matchMedia購読
8. NovaDevice.tsx:65 — useFrame内でObject.keys()毎フレーム配列生成 → モジュールスコープへ
9. Experience.tsx:167 — aria-liveがタイプライタを包み1返答で約100回読み上げ → 完了時にsr-onlyへ一括出力
10. Everyday.tsx:76-83/184-190 — 一時停止後、バーだけ先に完走しシーン切替が遅れる → animationend駆動 or key再start
11. Everyday.tsx:153-171 — tablistにroving tabIndex無し → 選択タブ0/他-1
12. PreOrderDialog.tsx:82 + Nav.tsx:172 — モーダル/オーバーレイ背後がinertでない → 開時にページラッパへinert
13. Cta.tsx:21 — pointermove毎にgetBoundingClientRect → enter時キャッシュ+resize/scroll無効化
14. tsconfig.json:38-43 — tests/scripts/playwright.configが型検査外 → tsconfig.test.json追加 or exclude削除
15. helpers.ts:38,60 — waitForTimeout(1400/800)の壁時計待ち → window.__novaFramesポーリングへ
16. playwright.config.ts:47 — reuseExistingServer無条件true → !process.env.CI
17. tech-reveal.spec.ts:20-22 — mobileプロジェクトでdisplay:noneのdesktopリストに対し検証（空振り）→ isMobile分岐で[data-tech-item-mobile]
18. Specs.tsx:20-23 — #specs直リンクで「0」が一瞬見える＋freeze非対応 → seen初期化＋freeze短絡

## LOW
19. store.ts:41,76 — dialogInvokerがclose後も残留 → closeDialogでnull
20. scroll-engine.ts:144-147 — revealStepは誰も読まない → 削除
21. Rig.tsx:365-370 — dampCが毎フレーム色文字列パース → THREE.Color定数化
22. Rig.tsx:155-169 — usedDesktopColumnのモジュールフラグがブレンドで曖昧 → read()戻り値で明示合成
23. Rig.tsx:241-243 — TECH_BAND.close=0.88が項目05の帯を食う → ≥0.95へ
24. a11y-basic.spec.ts:66-72 — 見出し順の検証が実質H1存在チェックのみ → 先頭要素=H1をassert
25. meta.spec.ts:11,57 — ready()無しでexpectNoErrors → ready追加
26. shots.mjs:396-401 — no-WebGL正当フォールバック時もDeadCanvas扱い → canvas不在時は生存チェックskip

推奨3アクション: ①エラーバウンダリ＋error.tsx ②スクロールロック/Esc所有権の一本化 ③ビューポート変化追従
（navOpenリセット・mobile再サンプル）＋shots.mjs return buf修正。
