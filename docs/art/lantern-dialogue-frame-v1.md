# 人物對白：淡墨美術邊框

- 製作方式：內建 imagegen，透明 PNG；保留原生成檔，未重繪歷史畫作。
- 專案素材：`public/art/ui/lantern-dialogue-ink-frame-v1.png`。
- 使用方式：背景圖取原檔中央的橫向邊框，16px 活字覆於其上；保留動態指向人物的小尖角。
- 生成檔包含上下透明留白，以 CSS 背景的中央取景使用，未修改原始像素。
- 畫卷內呈現：`output/gameplay-preview/lantern-reply-art-frame.png`。
- `npm run build` 完成。

## 最終提示詞

Use case: stylized-concept. Asset type: production raster UI border for a tiny single-line speech bubble in a Chinese Ming dynasty painting exploration game. Generate ONE blank wide horizontal frame, roughly 5:1 proportions, tightly fitted to the canvas with at most 2% transparent margin. Transparent background outside the frame; the inside is opaque pale warm silk paper, approximately #eee4cd. Hand-painted extremely fine muted grey-brown ink outline, naturally uneven thickness, very subtle dry-brush variation, slightly irregular softly turned corners. Center is almost blank, just barely perceptible fine silk fibres; no stains, no grunge, no dark aging. This graphic will be rendered only 40 pixels high with live 16px Chinese text on top, so keep the line quiet and thin (about 1 rendered pixel) and all the interior clear for a single line of text. Front-facing flat artwork. No text, no characters, no calligraphy, no labels, no watermarks, no shadows, no glow, no scroll rods, no seals, no flourishes, no decorative motifs, no speech tail. The tiny pointing tail will be supplied separately by the game. This is the actual frame asset, not a mockup, not a scene, not a sheet of variants.
