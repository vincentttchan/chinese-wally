# 開始前的人物去背圖（2026-10-06）

使用內建 image_gen 工具，transparent_background=true。從遊戲原畫中目標人物的近照去背，保留黑帽、灰藍衣、白扇／方形書箱，移除鄰近人物與場景。結果為生成式去背，細節可能與原畫有少量差異；不是逐像素的原圖遮罩。

兩張 PNG 保存生成的透明 alpha，原畫沒有修改。圖片只用在引言最後一幕，入畫立即移除；遊戲中不提供再次查看入口。書生保留被遮擋後可見的輪廓，沒有補畫腿腳。

兩張均為 1076 × 1461 RGBA，alpha 範圍 0–255，已確認有完全透明背景。介面以 CSS 放大人物以減少透明留白；手機 390 × 844 無水平溢出，入畫後人物圖元素為零。28 項測試、正式建置與 diff 格式檢查通過；未推送或部署。

- 皇帝：`public/art/portraits/emperor-cutout-v1.png`
- 書生：`public/art/portraits/scholar-cutout-v1.png`
- 輸入近照：`output/emperor-source-reference.png`、`output/scholar-source-reference.png`

第一輪整幅原畫的去背結果增加了太多細節，因此未採用。採用近照重試的下列提示。

## 皇帝最終提示

Use case: background-extraction. Edit the attached close-up game painting by removing background to actual alpha transparency. Keep ONLY the central gray-blue robed man with black cap and OPEN WHITE FAN. Preserve the exact simple low-detail silhouette, pose, facial direction, fan angle and muted colors shown. Treat this as a cutout of the source, not a new drawing. NO added detail, no new face, no new clothing folds, no outline, no shadow, no reconstructed feet. Remove every other person, floor and architectural object. Keep only visible pixels of the central man, including his white fan and brown belt pouches. Do not change the proportions or make him taller. Empty background must be transparent zero-alpha. Center with tight modest transparent margins. This character must match the source for students to identify in a crowded painting.

## 書生最終提示

Use case: background-extraction. Edit the attached close-up game painting by removing background to actual alpha transparency. Keep ONLY the central black-capped gray-blue robed scholar holding a flat TAN SQUARE BOOK BOX upright at his chest with both hands. Preserve the exact simple low-detail silhouette, pose, facial direction, box size and muted colors shown. Treat this as a cutout of the source, not a new drawing. NO added detail, no new face, no new clothing folds, no outline, no shadow, no reconstructed feet. Remove every other person, including the tan clothed foreground man facing away, the head in front of the lower robe, bridge railing, crowds and floor. Keep only visible parts of the central scholar and his square box. His lower body is occluded: leave those areas transparent, do not invent missing legs or feet, and do not attach any neighbouring person's body. Do not change proportions. Empty background must be transparent zero-alpha. Center with modest transparent margins. This character must match the source for students to identify in a crowded painting.
