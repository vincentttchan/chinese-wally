# 《簪花仕女圖》代表效果 v0.4

日期：2026-10-20。前置內容：[三人主線v0.3](zanhua-shinv-mainline-v0.3.md)。使用者指示「next」後，製作獨立代表效果入口。

## 觀看入口

- [引言與尋人](http://127.0.0.1:5191/zanhua-preview.html)
- [第一位尋人卡](http://127.0.0.1:5191/zanhua-preview.html?scene=search)
- [找到第一位人物](http://127.0.0.1:5191/zanhua-preview.html?scene=found)
- [第一段原畫觀察](http://127.0.0.1:5191/zanhua-preview.html?scene=observe)
- [第二段外衣觀察](http://127.0.0.1:5191/zanhua-preview.html?scene=observe&person=1)
- [第三段頭花觀察](http://127.0.0.1:5191/zanhua-preview.html?scene=observe&person=2)

這些入口由本機Vite伺服器提供；不是正式部署。查詢參數是代表效果的固定觀看入口，沒有加入正式章節選單或現有遊戲路由。

## 沿用基準的內容

- 原有 `ScrollScene`：拖曳、縮放、玩家控制凝神、載入與重試、原畫座標轉換。
- 原有 `LanternNavigator`：改用本章完整原圖及卷左／中／右標記。
- 原有 `LanternEmperorSpeech`：實際沿用對白元件、紙框、尖角及動作按鈕；提供本章人物、畫作尺寸與虛構對白名稱。
- 原有 `LanternPaintingNote`、`LanternPaintingTarget`：沿用題箋及不可見的原畫觀察按鈕；增加可選的畫作尺寸和人物錨點參數。
- 原有 `ChapterDialog`、`LanternNotice`、`ArtIcons`：提示卡、畫作小記、設定、提示通知、手繪圖示。
- 原有 `lantern.css`、`lantern-journal.css`、`lantern-search-hud.css`、`lantern-observation.css`，以及專案文楷字型。

上述三個基準元件僅新增可選參數，原有尺寸、人物、提示字串與對白寬度預設值保留。沒有修改《宮中鬧元宵》的章節資料、流程元件或正式路由；本輪亦未聲稱完成其回歸檢視。

## 已串接的代表內容

引言兩步、樣貌尋找、六位人物的三句輪替回應、P1 → P4 → P6三段找到／觀察／解讀／下一段線索，以及畫中任選一處回看、完成和自由探索。

主線每次先找到人物，玩家按「近看」才移鏡；點擊對應原畫細節後才有解讀與繼續入口。P6也有必經觀察。樣貌卡先面部，提示逐層增加，最後由玩家主動選擇才移至廣域。

這些是可點看的代表內容，不等於整章定稿。六人的人物點擊範圍目前採用逐人候選矩形，觀察物件採用原畫多邊形；完整輪廓、重複物件與觸控邊界尚待後續盤點。

## 代表畫面與實際檢視

本輪使用Codex內建瀏覽器，在桌面視窗實際觀看排版並操作第一段：引言 → 入畫 → 點P1 →「近看動作」→ 點小犬 → 顯示原畫解讀。第一段截圖為1280×720，後續桌面視窗變為897×853；每張圖片的實際尺寸記在截圖目錄的 `manifest.json`，未套用手機模擬或變更瀏覽器裝置設定。

已檢視尋人卡、放大樣貌提示卡、P1短對白、小犬觀察及解讀；調整本章對白寬度，避免末字單獨換行。樣貌圖以原畫裁圖加CSS輪廓裁邊呈現，沒有生成新面孔。

第二、三段以固定觀看入口檢視題箋幾何位置；為避免題箋蓋住鄰近人物面部，將桌面近看錨點調至畫面右側，使題箋落在左側空位。具體保存畫面見下方；只記錄實際產生的圖片。

![引言代表效果](../../output/gameplay-preview/zanhua/v0.4/introduction.png)

![尋人代表效果](../../output/gameplay-preview/zanhua/v0.4/search.png)

![人物樣貌提示](../../output/gameplay-preview/zanhua/v0.4/appearance.png)

![找到P1](../../output/gameplay-preview/zanhua/v0.4/p1-found.png)

![小犬觀察](../../output/gameplay-preview/zanhua/v0.4/p1-observation.png)

![點擊後解讀](../../output/gameplay-preview/zanhua/v0.4/p1-interpretation.png)

![第二段外衣觀察](../../output/gameplay-preview/zanhua/v0.4/p4-observation.png)

![第三段頭花觀察](../../output/gameplay-preview/zanhua/v0.4/p6-observation.png)

## 素材與程式位置

- 入口：倉庫根目錄 `zanhua-preview.html`、`src/zanhua-preview.tsx`。
- 編排與資料：`src/components/ZanhuaPreview.tsx`、`src/game/zanhuaPreview.ts`。
- 本章幾何CSS：`src/zanhua-preview.css`。
- 原畫與來源：`public/art/zanhua/`及[素材說明](../../public/art/zanhua/CREDITS.md)。研究下載與原尺寸裁圖保留在 `output/art-research/zanhua-shinv/`。

## 尚未完成

收藏／見聞冊、全部重複線索位置、本章獨立背景配樂、動畫、正式章節入口與正式封裝尚未加入。本輪不以「畫作小記」冒充已完成見聞冊，也未放置沒有功能的音樂按鈕。

手機、窄屏、完整鍵盤流程、減少動態、載入失敗、整章完整通關與學生試玩尚未檢視。沒有執行自動化測試、型別檢查或正式打包。原畫高倍率下的絹紋與局部磨損仍可見，不以生成高清補畫。
