# 古畫與介面美術

所有美術素材均由內建 imagegen 生成，已複製到專案內，可隨網站部署。

## 目前使用的全景

`public/art/examination-panorama-v2.png`：1586 × 992，約 16:10。沿用張擇端《清明上河圖》的細線、淡彩和古絹語言，場景、人物及尋人故事均為虛構。參考截圖只提供介面與構圖方向。

檢視生成畫作後，依抄榜人、茶攤掌櫃、青衫持卷者、褐衣書箱者與青衫書箱者的實際位置更新 `src/game/level.ts`。河水及茶壺蒸汽亦重新定位。旗幟直接使用畫作中的布幡，不再複製局部圖像作扭曲動畫。

最終生成提示：`examination-panorama-v2-prompt.txt`。附參考圖的首次請求連線失敗，改用同一構圖與畫風描述、無參考圖的請求成功。

## 介面美術

- `public/art/ui/painted-icons.png`：1254 × 1254，透明背景，4 × 4 手繪圖示圖集。聲音、全螢幕、線索簿、提示、方向與關閉等控制使用點陣美術，介面不再使用 Lucide SVG。印章格的生成文字未採用，任務印章文字仍以網頁文字呈現。
- `public/art/ui/reading-paper.png`：1448 × 1086，淡色紙箋背景。使用九宮切片保留邊框與小角飾，避免拉伸裝飾蓋住文字。
- 線索簿證人小像直接取自目前畫作，以 CSS 視窗裁切對準人物。文字、證詞、計數及無障礙標籤保留網頁內容。

提示保存在 `ui-atlas-prompt.txt` 與 `ui-paper-prompt.txt`。

## 保留素材

`public/art/examination-scroll.png` 為最初的 2172 × 724（3:1）長卷，保留作為畫風參考；提示為 `examination-scroll-prompt.txt`。較早未成功的全景規格保留在 `examination-panorama-prompt.txt`。
