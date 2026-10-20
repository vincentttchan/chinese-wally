# 完整美術樣貌提示卡 v3

2026-10-08。內建 imagegen 模式。

## 資產及範圍

專案：`public/art/ui/lantern-appearance-card-v3.png`。
整張圖片包含絹紙邊框、頭像、標題、指引、圖說、關閉標記及兩個操作文字，替代截圖所示的初始樣貌提示窗。進階原畫提示仍依所在庭院顯示原畫局部。

參考：`public/art/portraits/xianzong-recognition-v2.png`（既有辨認摹繪）、`public/art/ui/lantern-search-frame-v1.png`（紙色及墨線）。

## 互動

透明語義按鈕對齊圖中關閉、回畫中尋人、再給我一個提示三個區域。保留 Tab、Enter、Escape、焦點圈與對話框焦點限制。提示語提供替代文字。主線進度與畫作保持原有資料。

## 完整提示詞

```
Use case: ui-mockup. Deliver an actual production raster image of ONE COMPLETE CHINESE HISTORICAL GAME IDENTIFICATION CARD, including ALL typography, portrait, rules, close mark and action labels baked into the pixels. This is the card itself, flat front-facing, NOT a device or webpage mockup. Target 1500x1050 canvas, about 10:7 aspect. Almost full bleed card with only 1–2% truly transparent outside margin, no outside rectangle, no drop shadow.
Image 1 is the exact head portrait to insert, preserve its features and cap/beard silhouette without changing the face. Image 2 is a reference only for ivory silk texture and fine brown ink rules; adapt the border to this card's dimensions instead of stretching it. Calm Ming court-painting folio design, pale warm ivory silk, dark muted olive ink, delicate naturally brushed perimeter no thicker than a thin hairline at final 500px display width. No large black panel, no saturated colors, no flowers, scroll rods, seals or extra illustrations.
Precisely render Traditional Chinese text with refined restrained handwritten regular-script / Kai typography. No simplified Chinese, no missing strokes. Reading order and layout:
- Small quiet eyebrow at x8%, y9%: "尋人 · 樣貌提示"
- Title at x8%, y18%: "認清這張面孔" (largest, equivalent 23px at 500px card width, NOT gigantic).
- Small close X mark centered at x92%,y10%.
- Preserve the referenced head portrait in the left column centered x25%, between y31% and y71%, naturally blended onto the silk without any separate portrait square. Do not include clothes, shoulders, scenic background or oval frame.
- Right column from x45%, y39%, two elegant equally spaced lines, equivalent 17px at 500px width:
"留意眉眼與面形，"
"再比對鬍鬚的輪廓。"
- Main action in right column at x45%,y65%: "回畫中尋人" followed by a simple small right arrow at x72%. A short fine ink rule underneath, no filled button.
- Very small subdued portrait caption centered x25%, y78%: "樣貌摹繪 · 原畫為準"
- A fine quiet horizontal separator at y84%, spanning x8% to92%.
- Bottom left small quiet label at x8%,y91%: "先從樣貌開始"
- Bottom right secondary action ending x92%,y91%: "再給我一個提示", understated, equivalent 12px at 500px width, with a fine short underline.
Keep every word comfortably inside the border, generous but compact balanced negative space, visual hierarchy clear. All text must be spelled exactly as above, no other text, no watermark. Real transparent pixels only outside the card; interior is opaque silk.
```

