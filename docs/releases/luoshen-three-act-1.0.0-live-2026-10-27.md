# 《洛水之間》三幕入場1.0.0正式上線

2026-10-27。使用者已確認完整1.0.0，要求接到正式章節入口及上線，保留「循賦入畫的年輕書生」身份及現有入場效果，舊版封存，其他章節不變。本次明確授權取代先前本機候審限制。

## 正式入口與完整舊版

- 正式入口：<https://vincentttchan.github.io/chinese-wally/#luoshen>，直接使用 `LuoshenThreeActGameV1`。
- 完整舊版：<https://vincentttchan.github.io/chinese-wally/chapters/luoshen-before-three-act-20261027/>；另保留 `#luoshen-legacy` 使用原 `LuoshenGame.tsx`。既有洛水試玩入口亦維持原元件。
- 新版獨立完整成品：`public/chapters/luoshen-three-act-v1/index.html`，逐位元保留本機確認版；原version.json的候審註記保留為建立當時紀錄。現行正式狀態另記於 `data/active-release.json`。
- 原元件、素材、舊版、已確認樣段及既有發布標記均保留，不移動或覆寫。

## 本次變更與範圍

只將正式 `#luoshen` 接到已確認新版、增加舊版路由，並重新建置正式網站及本機首頁。三幕入場來源、原文、身份、七欄對齊、逐字節奏、封面交疊、背景向右緩移、樣貌與鏡頭交接保持原樣。完整章節元件僅把頁籤標題從本機版字樣恢復為「洛水之間 · 洛神賦圖」；不改入場或玩法。

尋人、觀察、《洛神賦》對讀、收藏、動畫、配樂及收尾沿用；儲存鍵仍為 `painting-luoshen-v1`，沒有清除或遷移進度。

以前次正式main `65b144abc4080f9fa7931716c01867be504bc8ef` 及已確認本機版 `c6cfff0` 為核對基底。除路由 `src/main.tsx`、重新封裝的 `public/index.html` 外，原正式來源及素材不變。已確認新版元件的唯一額外差異為上述頁籤標題；其他五章與共用樣式不變，沒有帶入其他工作目錄的未審視內容。詳細清單見 `luoshen-three-act-1.0.0-deployment-preservation.json`。

## 建置及實際確認

本機1.0.0先前已完成三幕、尋人、兩處衣袖觀察、古籍對讀、回封面及續玩檢視，詳見[本機完整版本紀錄](luoshen-three-act-v1-2026-10-27.md)。本輪只作正式建置、正式新舊路由與線上發布確認，不執行測試套件或重新通關全章。

正式部署提交：`236b7775c872ee4bcf2c1ae20957dbc53fd30c83`。GitHub Actions `40458232066` 已成功完成，結果更新時間為 2026-10-27T05:58:31Z（香港 2026-10-27 13:58:31）。

線上正式根入口實際走過封面、三幕、年輕書生身份、曹植樣貌提示至可操作尋人；三幕七欄位置一致，逐字由0／84至84／84，背景x向右增加。入畫前後transform相同，error／warn記錄為空。舊版根路由仍顯示原有兩幕引言。十份線上文件與發布檔案完全相同，包括洛水新舊成品及保留的簪花、宮中、康衢新舊入場文件。

新版固定發布標記為 `site-2026-10-27-luoshen-three-act-v1.0.0`；舊正式版另以 `site-2026-10-27-luoshen-before-three-act` 封存於前次正式提交 `65b144abc4080f9fa7931716c01867be504bc8ef`。既有全部標記保持原指向。詳細工作流程、HTTP指紋、對齊及畫面見 `luoshen-three-act-1.0.0-live.json` 與 `output/releases/luoshen-three-act-1.0.0-live-2026-10-27`。本次沒有重新執行全章通關、實體手機或輔助科技驗收。
