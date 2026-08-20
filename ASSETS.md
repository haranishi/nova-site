# 外部素材台帳

| 素材 | 用途 | 入手経路 | ライセンス |
|---|---|---|---|
| studio HDRI (`studio.exr`) | 3D環境照明・デバイスの映り込み | npm `@pmndrs/assets`（Poly Haven 由来を pmndrs が再配布） | CC0 |
| Space Grotesk | ディスプレイ書体 | next/font/google（ビルド時セルフホスト） | SIL OFL 1.1 |
| Inter | 本文書体 | next/font/google（ビルド時セルフホスト） | SIL OFL 1.1 |

- NOVA デバイス本体の3Dモデルは**外部GLBを使わずプロシージャル構築**（three.js の Lathe/Torus/Cylinder）。
  理由: 「円形・滑らかな曲面・黒基調・ミニマル」の要件に一致する商用利用可の既製モデルが期待できず、
  コード構築の方が世界観・軽量性・分解ビュー制御のすべてで勝るため（要件の補完条項に基づく判断）。
- 上記以外の視覚要素（粒子・グロー・グラフ・アイコン）は全て CSS / SVG / three.js による自作。
- サイト上に出典一覧は表示しない（依頼時の方針どおり）。本台帳が作業上の整理。
