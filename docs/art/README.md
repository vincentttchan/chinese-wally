# 古畫與介面美術

所有美術素材均由內建 imagegen 生成，已複製到專案內，可隨網站部署。

## 上一版全景（保留作比較）

`public/art/examination-panorama-v2.png`：1586 × 992，約 16:10。沿用張擇端《清明上河圖》的細線、淡彩和古絹語言，場景、人物及尋人故事均為虛構。參考截圖只提供介面與構圖方向。

上一版檢視生成畫作後，曾依抄榜人、茶攤掌櫃、青衫持卷者、褐衣書箱者與青衫書箱者的實際位置更新 `src/game/level.ts`。河水及茶壺蒸汽亦重新定位。旗幟直接使用畫作中的布幡，不再複製局部圖像作扭曲動畫。

最終生成提示：`examination-panorama-v2-prompt.txt`。附參考圖的首次請求連線失敗，改用同一構圖與畫風描述、無參考圖的請求成功。

## 介面美術

- `public/art/ui/painted-icons.png`：1254 × 1254，透明背景，4 × 4 手繪圖示圖集。聲音、全螢幕、線索簿、提示、方向與關閉等控制使用點陣美術，介面不再使用 Lucide SVG。印章格的生成文字未採用，任務印章文字仍以網頁文字呈現。
- `public/art/ui/reading-paper.png`：1448 × 1086，淡色紙箋背景。使用九宮切片保留邊框與小角飾，避免拉伸裝飾蓋住文字。
- 線索簿證人小像直接取自目前畫作，以 CSS 視窗裁切對準人物。文字、證詞、計數及無障礙標籤保留網頁內容。

提示保存在 `ui-atlas-prompt.txt` 與 `ui-paper-prompt.txt`。

## 目前使用的長卷

使用者確認第二版局部樣稿後，已用內建 imagegen 向右延伸為 `public/art/examination-dense-scroll-v3.png`，尺寸 2172 × 724（3:1）。左側沿用榜牆、茶攤及密集生活群組，右側延伸街市與石橋。最終提示為 `examination-dense-scroll-v3-final-prompt.txt`，輸入為第二版樣稿。第一次長描述請求連線失敗，精簡後重試成功；原請求保存於 `examination-dense-scroll-v3-prompt.txt`。

新圖已取代網站主圖。人物熱區、線索簿小像及蒸汽位置同步調整。橋頭三名候選人的青衫、手卷與書箱互為干擾，只有橋頭的青衫書箱者符合兩條證詞；其他區域仍有青衫書箱者，證詞中的去向亦為必要條件。書箱畫在身前，因此文案使用「帶着」，不再稱「背着」。

網站直接以 cover 尺度顯示，最小縮放維持滿版，拖曳探索左右。新畫面沒有清晰開闊河面，移除原圖水紋圖層，避免浮在人物或石橋上；保留茶壺淡蒸汽。旗幟仍直接使用畫內的「茶」幡，沒有扭曲重影圖層。舊長卷 `examination-scroll.png` 及其提示保留作比較。

## 新的尋人美術方向樣稿

內建 imagegen 生成的榜牆與茶攤局部樣稿已保存為 `output/art-direction/examination-crowd-study-v1.png`；經人物尺度調整後，選定第二版 `output/art-direction/examination-crowd-study-v2.png`（1586 × 992）。使用者確認後，第二版已延伸成目前可玩的 3:1 長卷。

生成及編輯提示為 `examination-crowd-study-v1-prompt.txt`、`examination-crowd-study-v2-edit-prompt.txt`；方向及評閱記錄見 `seek-and-find-direction.md`。
