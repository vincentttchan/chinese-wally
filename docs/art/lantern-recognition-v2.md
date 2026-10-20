# 樣貌提示第二版

2026-10-08。內建 imagegen 模式，透明背景。

## 採用素材

- 專案檔案：`public/art/portraits/xianzong-recognition-v2.png`。
- 生成原檔：`/Users/vincentttchan99/.codex/generated_images/01a109e6-c941-7a61-8db8-b133d39f2378/exec-ced2abe8-183d-45f1-850e-f5184b710b9e.png`。
- 參考原畫：`public/art/lantern-festival/detail-9.jpg`，上右黃幔下的憲宗。

這是依原畫生成的辨認用樣貌摹繪，不是去背後放大的原畫或高清掃描。保留完整頭部與自然收束的鬍鬚，沒有衣服、姿勢與場景。三次尋人共用此圖，觀察證據仍使用原畫。提示窗明示「樣貌摹繪 · 原畫為準」，資料來源頁亦有說明。

舊版52×90的原畫面孔裁切已停用：解析度不足，放大後輪廓僵硬。既有 Commons [局部原檔頁](https://commons.wikimedia.org/wiki/File:明憲宗元宵行樂圖9.jpg) 標示完整圖為1296×1500，並不能提供更高清的這一張面孔。

## 排版

460px寬的小幅提示頁；22px標題、17px觀察句，左側150px高的頭像區域、右側一句指引及文字返回按鈕。下方只保留可選的進階提示。手機收窄圖文間距、16px內文；減少動態偏好停用進場淡入。

另修正局部圖7的新增人物座標：其實際來源只有750×896，需把標記工作尺寸轉換到該原圖尺寸。

## 完整提示詞

```
Use case: identity-preserve. Asset type: transparent identification portrait for a historical painting hidden-person game, not a replacement for the historical artwork. Reference: attached original detail-9.jpg. ONLY the SEATED BEARDED EMPEROR in the UPPER RIGHT under the yellow canopy, not other people.
Repaint a clean, legible high-resolution miniature painted HEAD matching that emperor's recognizable features: broad pale face, nearly front-facing with slight turn to viewer left, short gently arched eyebrows, small narrow dark eyes, broad straight nose, small red mouth, dark downturned moustache joined to a distinctive long narrow tapering black beard with subtle two-point ink ends. Keep the original's simple delicate Ming court-painting linework and restrained flat ivory skin washes. Follow the reference face proportions closely; do not make the face rounder, younger, more realistic, or invent dense wrinkles or shading. Keep ear shapes modest and asymmetrical as in the reference.
Include his complete plain black soft cap from the original as the natural top boundary of the head so the forehead is NOT chopped flat. No ornamental hat insignia. Include no neck, no collar, no shoulders, no robe, no chest, no hands, no scenery or canopy. The beard has its complete natural taper, NOT an angular polygon cutout. One clean continuous silhouette with fine painted edge detail and tiny natural feathering, not a cut paper fragment.
True zero-alpha transparent background. Head and beard occupy around 85% of the image height with balanced small margins. Centered portrait composition. No paper rectangle, no vignette backdrop, no glow, no shadows, no outline, no text. Crisp raster brush strokes readable at 70–110px display height; no artificial photorealistic hair texture or pores. This is a faithful recognition illustration derived from the original, not a claimed high-resolution scan.
```

建置：`npm run build`。未新增或執行測試。

