# 第一卷：點擊後局部轉變試作（已撤回）

2026-10-06：使用者覺得效果未如理想，已移除圖片切換、覆布圖層、新增人物熱區與記錄所見流程。回到由玩家控制的「凝神觀察」，見 `../player-observation.md`。以下只保留試作歷程；素材移至 `output/art-direction/retired-picture-change/`，不再由遊戲載入。

## 已確認方向

2026-10-06：使用者將原來的局部影片方案改為點擊後切換圖片；接受「直接點擊 → 局部轉變 → 記錄所見」。沿用清明上河圖式淡彩長卷，保持滿版、左右探索與原人物比例。

## 接入內容

- 茶客：覆布遮住手中書箱；點擊後切換至摺起覆布，露出原畫中的書箱。
- 普通提籃客人：同樣揭布，露出原畫中的青菜籃；不產生案件線索。
- 掌櫃只提供觀察方向，直接問訊不再收錄書箱線索。
- 茶客畫面切換與線索記錄分成兩個動作；按「記下所見」後才收錄。可以先觀察或先問訊，沒有強制順序。
- 同一局保留已揭開的狀態；重玩、換卷重置。重複記錄不增加線索數量。
- 對位依 3762 × 1254 高清拼接圖的中央茶攤，座標統一換算到整卷比例。
- 兩張透明 PNG 用於兩個狀態；轉換約 380 ms。減少動態效果時即時切換。
- 以圖片覆布圖層試驗流程；原人物姿勢沿用原畫。素材可於後續確認玩法後升級為精細人物姿勢差異圖。

## 素材來源

內建 image_gen 生成，沒有使用外部影片服務。風格參照既有 `public/art/hd/tea.png`。

- `public/art/observation/cover-cloth.png`：覆蓋狀態的灰綠色布。
- `public/art/observation/folded-cloth.png`：被拉開、摺起的布。
- 原生成圖保留於 Codex generated_images；專案素材縮至 512 px 寬以降低下載及解碼成本，保留 alpha。

### 覆蓋狀態提示詞

Create a tiny game animation layer, NOT a new scene. Reference image role: palette and ink-line style reference, Song dynasty handscroll crowded tea market. Needed output is ONE isolated soft folded cloth covering a small rectangular book chest. Genuine transparent background. No person, no hands, no chest itself, no scenery, no text, no border, no glow. Cloth silhouette: a softly draped rectangular grey-green linen cloth, about 110 pixels wide to 95 tall in relative proportions, viewed slightly from above at the same oblique angle as the reference. Top edge slopes upward to the right; lower corners loosely folded, lower hem uneven. Fine restrained dark ink outlines and a few hand-painted wrinkles; warm pale grey olive woven cloth, softly textured rice-paper watercolor, muted color. It must look like an unobtrusive prop painted in this exact illustrated handscroll. Entire isolated cloth centered and filling most of transparent canvas. Keep folds sparse and readable at small size.

### 揭開狀態提示詞

Edit target: the isolated grey-green linen covering cloth in reference. Create its AFTER state for a handscroll game click interaction. Output ONE isolated small folded and gathered piece of the SAME cloth on genuine transparent background. It has been pulled off a small book chest and set beside it, loosely crumpled into a low horizontal fold. Keep the exact restrained warm grey-green watercolor palette, fine dark ink lines, rice-paper texture and traditional Chinese handscroll illustration style. No box, no hands, no person, no floor, no shadow extending outside cloth, no background, no text, no glow. Folds gathered toward left with one short draped flap to right. Width to height approximately 2:1; compact low bundle, a clearly different state from the original cloth stretched over a rectangular chest. Center it with a small transparent margin.
