# NOVA — Brand Site (Concept)

架空のパーソナルAIデバイス「NOVA」の公式ブランドサイト。Next.js 16 + React Three Fiber。
**ハーネス比較実験の題材**: Web制作ハーネス（実装/採点分離・3周ループ）の効果検証。

## 実行
```bash
npm run dev        # 開発 (http://localhost:3000)
npm run build && npm start   # 本番相当
npm run typecheck  # 型検査
npm run build && npm test    # Playwright 12spec（要ビルド済み）
node scripts/shots.mjs --loop N  # 採点用スクショ一式 → harness/shots/loopN/
```

## 実験レイアウト
| 場所 | 中身 | ポート |
|---|---|---|
| `~/Projects/nova-site` | 最終形（ハーネス3周後） | 3000 |
| `~/Projects/nova-site-loop1` | 周1完了時点の複製（=1回実行版・比較用ベースライン） | 3001 |
| `~/Projects/nova-site-loop2` | 周2完了時点の複製 | 3002 |

- 設計文書: `docs/01〜07`（要件・UX5階層・デザイン仕様・3D仕様・コピー・テスト計画・実装ブリーフ）
- ハーネス契約: `.agent-harness/contracts/nova-webui-v1.yaml` ／ 周ごとの記録: `.agent-harness/runs/`
- 採点: `harness/eval/`（ブリーフ・各周の採点表）／ スクショ: `harness/shots/loopN/`
- 外部素材: `ASSETS.md`

## 注意
- 架空プロダクトのコンセプトサイト。Pre-order は動作しない（その旨のダイアログが出る）。
- `?nogl=1` で WebGL フォールバック表示を強制できる。

## 実験結果（2026-08-18 確定）
採点推移: 周1 **8/20**（0点3項目）→ 周2 **13/20** → 周3 **11-14/20**（評価者2名・768リグレッション検出）。
契約判定 NEEDS_HUMAN（3周消化）。詳細: `harness/eval/loop3-score-final.md`・`.agent-harness/runs/`

## ライセンス

自作のコード・資料は [MIT License](LICENSE) で公開しています。
外部ライブラリ・素材・フォントは各権利者のライセンスに従い、このMITライセンスでは再許諾しません。
ソース公開は、サービスの一般提供・ストア配布・本番運用の安全性を保証するものではありません。
