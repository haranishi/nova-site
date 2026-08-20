# 3D・モーション仕様（Canvas は1枚、デバイスが全編を旅する）

## Canvas / シーン
- `next/dynamic ssr:false` の固定レイヤー `fixed inset-0 z-0 pointer-events-none` aria-hidden。
  `<Canvas gl={{antialias:false, powerPreference:'high-performance', alpha:true}} dpr=[1, mobile?1.5:2] camera={fov:35, pos:[0,0,7]}>`
- 環境光: `@pmndrs/assets/hdri/studio.exr` を suspend で `<Environment files>` に（CC0）。
  + キーSpotLight 白 int2.5 [4,5,4] penumbra1 ＋ リムPointLight #7c8cff int6 [-3,1,-3]。影なし（虚空に浮遊）。
- Post: EffectComposer multisampling(desktop4/mobile0) + Bloom(mipmapBlur, intensity .9, luminanceThreshold 1)。
  Bloom対象=emissiveIntensity>1のリング系のみ。mobileはBloom解像度半分。
- 背景粒子: drei Sparkles(count90, scale[9,5,4], size1.2, speed.18, opacity.3, #8fa0ff)。specs/experienceでopacity→.12へdamp。
- 初回フレーム後にcanvas opacity0→1(400ms)。背後に常時CSSグロー（ポップイン防止）。

## デバイス構成（プロシージャル・半径1.0基準・部品はexplode対応で分割）
| 部品 | 形状 | 素材 |
|---|---|---|
| bodyUpper/bodyLower | Lathe曲線のなだらかな碁石型(上下分割) | Physical #08090b metal.55 rough.16 clearcoat1 ccRough.1 envInt1.2 |
| band(赤道) | Torus(1.002,.018) | Standard #c7ccd6 metal1 rough.28 |
| dish(上面皿) | 浅い凹Lathe r0.58 深さ.05 | Standard #0c0d10 rough.5 metal.2 |
| **ring(光輪)** | Torus(.62,.012) y=.305 水平 | Standard black + emissive #7c8cff **eI基準2.2**(toneMapped維持) |
| micRing | 小Cylinder×4 r.02 @r.8 y.24 | #17181c metal.8 rough.4 |
| board+chip | Cylinder(.72,.05)+Box.22角 | #101318 rough.6 / chip emissive #7c8cff eI1.4 |
| battery | Cylinder(.66,.16)+銅Torus縁(.66,.008) | #1a1d24 metal.7 rough.35 / 銅 #b0876a |
| coil | Torus(.4,.02)平置き底部 | 銅 #c08a5f metal1 rough.45 |
| halo(強調) | Torus(可変半径,.006) accent eI2.5 | activeテック項目のパーツ位置へdamp移動+脈動 |

Explode(e∈0..1, easeInOut): bodyUpper+.85 / dish+1.0 / ring+1.15 / micRing+.65 / board+.28(rotY+e*.4) /
battery−.05 / coil−.35 / band−.25 / bodyLower−.75。項目→パーツ: neural→board(chip eI×2.2) / voice→micRing /
spatial→ring / battery→battery+coil / secure→bodyLower。

## ポーズ表（target。damp3 λ3.2 / dampE λ3.0 / scalar damp λ3。desktop | mobile）
| section | pos | rot[rx,ry,rz] | scale | 備考 |
|---|---|---|---|---|
| hero | 0,-0.55,0 \| 0,-0.9,0 | .95, idle+.12rad/s, 0 | 1.0 \| .72 | 浮遊sin±.06・マウスパララクス rot±.06/pos±.1・リング呼吸eI2.2±.3 |
| reveal s1 | 1.35,-.05,0 \| 0,.55,0 | 1.25,cont,0 | .82 \| .55 | 上面（リング主役） |
| reveal s2 | -1.35,0,0 \| 0,.55,0 | .12,cont,.06 | .85 \| .55 | 薄型プロファイル |
| reveal s3 | 0,.15,-.6 \| 0,.6,-.4 | .6,cont,-.08 | .7 \| .5 | 中央奥・テキスト下 |
| experience | -1.7,-.35,0 \| 0,1.05,-.5 | .8,slow,0 | .5 \| .34 | speaking→eI 2→3.6@2Hz+scale+2% |
| technology | .55,0,0 \| 0,.25,0 | .55,+.25rad/s,0 | .8 \| .6 | e: p.05–.40↑ / 項目band p.40–.86(5等分) / p.86–1↓ |
| everyday | -1.55,-.75,0 \| 画面外 | 1.1,slow,0 | .42 | リングhueをシーン色へ600ms lerp |
| specs / footer | 0,-3.2,0（画面外） | – | – | 粒子も減光 |
| cta | 0,-.15,.4 \| 0,-.45,.2 | .75,+.18,0 | 1.12 \| .8 | eI2.6・Pre-orderホバーで3.8 |

ステップ間(reveal内)は `mix(poseA, poseB, smoothstep(local))`。セクション間はdampが自然遷移を生む。

## スクロール基盤
- Lenis(lerp.1, smoothWheel, タッチはネイティブ)。アンカーは `lenis.scrollTo(el, offset:-64)`。
- 計測: resize時に各sectionの offsetTop/height をキャッシュ→rAFで `scrollY` から
  `progress=clamp((y-top+vh)/(h+vh))`・pinned系は `pin=clamp((y-top)/(h-vh))` を zustand(transient)へ。
  React再レンダは帯域跨ぎ(step/active変化)のみ。Canvas側はuseFrameでgetState()参照。
- active section = sticky viewport が画面中心を覆うもの。Navハイライトにも共用。

## Reduced motion / フォールバック
- matchMedia監視: idle回転0・浮遊0・粒子speed0・呼吸/脈動0・自動送り0・タイプライタ即時・カウント即時・
  Lenis破棄(ネイティブ)・damp λ→8(即応)。スクロール連動ポーズ自体は維持（ユーザー駆動）。
- WebGL2不可 or `?nogl=1`: Canvas非マウント→`[data-canvas-fallback]`(CSS放射グラデ+シルエット)。機能全維持。

## 性能
- 形状セグメント: Lathe≤128×48・Torus≤128。ジオメトリ/マテリアルはuseMemo。drei named import。
- 60fps目標(M系)。フレーム内アロケーションゼロ（Vector3等は再利用）。タブ非表示時はR3F既定で停止。
