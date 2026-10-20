# 第二版：真實原畫、畫旁書頁與兩件收藏

使用者同意先按自我審視修訂代表效果。2026-10-14 本輪交付是獨立可操作效果稿，未接入正式遊戲。

- [互動預覽](http://127.0.0.1:5186/index.html)
- [檔案、實際檢視及已知限制](../../../output/art-direction/qingming-reading-journal-v2/README.md)
- [內建 image_gen 完整提示詞](../../../output/art-direction/qingming-reading-journal-v2/prompts.md)

## 書頁修訂

![完整短句的頁邊批注](../../../output/art-direction/qingming-reading-journal-v2/reading-selected.png)

背景使用既有虹橋原畫局部原樣副本，未重新生成。書頁改用既有絲箋與活字排版，可翻開、選取三段原文、顯示一則批注、合卷；原文、批注與來源各有層次。批注包含東南糧食、物產入城及官民供應的歷史關係，不只提供詞義。預覽可自行重複操作。

## 收藏修訂

![兩件收藏試排](../../../output/art-direction/qingming-reading-journal-v2/journal-collected.png)

先製作虹橋與紙馬鋪兩件獨立 RGBA 手繪素材，使用現有元宵共用 CSS 的原樣快照及兩欄試排。可切換淡墨未發現狀態、點圖樣對照原畫；不將四件尚未重製的舊圖樣放回來。示範計數不是玩家進度。

這兩件仍待美術確認。虹橋底部木件屬概括摹繪；紙馬鋪以館方參考圖可見的店招與層疊形態為依據，未補出未知商品，圖樣的類別文字也不是原招牌逐字復原。

實際只在內建瀏覽器 1280×720 檢視上述預覽操作與狀態。沒有修改正式遊戲、沒有新增或執行自動測試、沒有手機檢視或部署。預覽改用獨立靜態伺服器，以免 Vite 更新及 iCloud 依賴阻塞干擾檢視。
