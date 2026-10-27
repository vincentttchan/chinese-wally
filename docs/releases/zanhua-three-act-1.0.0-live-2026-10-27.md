# 《簪花仕女圖》三幕入場 1.0.0 正式上線

2026-10-27。使用者已確認完整三幕入場 1.0.0，要求接到正式章節入口並上線，保留學畫人身份及現有入場效果，舊版封存，其他章節不變。本次授權取代先前的本機候審限制。

## 正式入口與舊版封存

- 正式入口：<https://vincentttchan.github.io/chinese-wally/#zanhua>，主路由直接使用 `ZanhuaThreeActGameV1`。
- 完整舊版：<https://vincentttchan.github.io/chinese-wally/chapters/zanhua-before-three-act-20261027/>；亦保留 `#zanhua-legacy`，使用原 `ZanhuaPreview.tsx`。
- 新版獨立完整文件：`public/chapters/zanhua-three-act-v1/index.html`，與使用者確認的本機 1.0.0 逐位元相同。其原 `version.json` 保留建立時的候審註記，現行正式狀態另記於 `data/active-release.json` 與本次發布紀錄。
- 舊版原章節程式、獨立完整舊版、原素材、原發布標記與共同三幕基準標記均保留，不移動或覆寫。

## 本次變更

只將 `#zanhua` 接到已確認的新版，並新增舊版路由；重新產生主網站與本機首頁包。學畫人身份、師長囑咐、封面交疊、七欄對齊、逐字呈現、背景向右緩移、樣貌提示及原畫鏡頭交接均保留，沒有修改已確認的入場來源或獨立成品。

沿用原有尋人、觀察、衣飾細看、收藏、見聞冊、音樂、收尾與留印。收藏鍵仍為 `chinese-wally:zanhua-findings:v1`，沒有清除或遷移進度。

## 其他章節保留

以前次正式主分支 `306b9fe093f6422340319807f3a9fdf692ac0f5d` 為基底，核對原有 src/public 檔案。除本章路由所在 `src/main.tsx` 與重新封裝的 `public/index.html` 外，其餘既有來源與素材不變，清單及數目見 `zanhua-three-act-1.0.0-deployment-preservation.json`。

《宮中鬧元宵》1.1.0、《在人群中聽樂》2.2.0、洛水、清明及榜下尋人均沿用現有發布內容；簪花使用獨立作用範圍的入場 CSS，不修改共用 CSS。沒有更新三幕共同封存標記，也沒有帶入其他工作目錄中的未審視修改。

## 建置與確認範圍

本輪 `npm run build` 已完成型別檢查、Vite 發布建置及本機首頁封裝。新舊簪花獨立成品及其來源指紋與已確認版本相同。

本機完整新版先前已走過三幕、樣貌、入畫、第一位女子、原畫觀察、逗犬演繹、見聞冊及回封面，詳見[本機完整章節記錄](zanhua-three-act-v1-2026-10-27.md)。本輪針對正式路由、線上新舊入口與發布結果作確認，沒有執行測試套件或重新通關全部內容。

正式部署提交、GitHub Actions 結果、線上文件指紋與實際畫面於完成後記錄在 `zanhua-three-act-1.0.0-live.json`。
