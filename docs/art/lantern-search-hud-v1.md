# 尋人角落美術與樣貌輪廓

2026-10-08 · 內建 imagegen 模式。

## 已採用的底框

輸出：`public/art/ui/lantern-search-frame-v1.png`。
生成原檔：`/Users/vincentttchan99/.codex/generated_images/01a109e6-c941-7a61-8db8-b133d39f2378/exec-31f45b9c-66af-48a0-90b0-f041ada25d4a.png`。

純美術底框，沒有預烘焙文字；眉眼提示、線索與進度保持可讀取的網頁文字。尺寸約 326 × 126px，細墨線、淡絹紙，手機收窄至 296px。

### 完整提示詞

```
Use case: stylized-concept. Asset type: actual blank raster HUD frame for the top-left search hint in a Chinese historical painting game. ONE horizontal silk-paper panel, approximately 2.6:1 proportions, occupying almost the entire canvas with under 2% transparent margin. Transparent outside, opaque very pale warm ivory silk inside (#eee6d2). Quiet Chinese hand-painted craftsmanship: restrained hairline muted grey-brown ink on the perimeter, slightly uneven brush thickness and subtly irregular softened corners, nearly invisible fine silk fibres. Very modest fine double-rule only at the top and bottom corners, no heavy decorative frame. No glow, no shadows, no stains, no curling or scroll rods, no ribbon, no seals, no modern UI outlines. The left fifth will hold a small transparent face portrait, the right four fifths live Chinese text, so leave the entire interior blank and uniformly light. Display size about 320 by 130 pixels; keep the border delicate at that scale. No text, no portrait, no objects, no icons, no calligraphy, no watermarks. Flat front-facing 2D artwork, not a scene or mockup.
```

## 人物樣貌

實際使用原畫 `detail-9.jpg` 的 `[1143, 355, 52, 90]` 局部，以 CSS 多邊形輪廓裁切臉部、耳與鬍鬚。背景、袍服與帽子不作為初始提示，三次尋人共用同一張面孔。原畫像素未重繪；放大提示仍受原掃描解析度限制。裁切屬網頁顯示效果，不是另存的透明 PNG。

曾嘗試以下去背生成，但五官與原畫不完全一致，因此沒有放入遊戲：

```
Use case: background-extraction. Edit target: the seated bearded Ming emperor near the upper right under the yellow canopy in the attached historical painting detail. Extract ONLY HIS PAINTED FACE, both visible ears, moustache and long black beard, on genuinely transparent background. Exclude ALL black hat, robes, collar, shoulders, hands, railings and yellow background. The result is a compact face-and-beard cutout for a hidden-person game so it must reveal only eyebrows, eyes, nose, facial outline and beard. Preserve exactly the source painting's face angle, asymmetry, pale skin, fine old brush lines, eyes, moustache and beard; retain the low-detail original painted features, do NOT modernize, beautify, invent features, restore, sharpen into a different face or redraw realistically. Single isolated cutout, tightly centered with very little transparent padding, no oval backdrop, no rectangular crop, no halo, no added outline, no text, no watermark. Do not include any other person. This is background removal of original painted facial features, not a new portrait.
```

未採用生成原檔：`/Users/vincentttchan99/.codex/generated_images/01a109e6-c941-7a61-8db8-b133d39f2378/exec-8e88f364-7a98-40b1-9200-50df124fed28.png`。

主線發現後的原畫證據圖，以及主動要求的帽子、衣着進階提示維持原有用途。
