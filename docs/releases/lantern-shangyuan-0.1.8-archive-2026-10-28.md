# 正式封存：《宮中鬧元宵》上元隨記0.1.8

2026-10-28（香港）。使用者要求將本次實際上線的完整0.1.8封存為後續維護基準，保留所有舊版本、素材及來源；本次不重新建置或部署。

## 固定版本

- 固定標記：`site-2026-10-28-lantern-shangyuan-0.1.8`，沿用原指向，不移動或重建。
- 實際部署提交：`9527bad5619ad941946c1aba8f3038dc5ec83abe`。
- 成功部署：[GitHub Actions 40629346928](https://github.com/vincentttchan/chinese-wally/actions/runs/40629346928)。
- 正式文件：`public/chapters/lantern-shangyuan-v2-0.1.8-live/index.html`；[正式入口](https://vincentttchan.github.io/chinese-wally/?v=0.1.8-20261028#lantern-festival)。
- [GitHub Release與封存下載](https://github.com/vincentttchan/chinese-wally/releases/tag/site-2026-10-28-lantern-shangyuan-0.1.8)。

本次文件提交只登記封存，不是另一份遊戲版本。封存使用成功run的原始Pages部署包，沒有重建。維護基準包含完整三幕、三庭尋人與短對白、原畫觀察及演繹、支線收藏、兩題選取後確認與獨立說明頁、按內容縮短的靠左說明框、直接觀遊留印，以及現有封面、介面、音樂、見聞冊、存檔、收尾和導航。0.1.8-questions仍是獨立快速試玩，不當作正式入口。

## 後續維護與保留

沒有使用者明確新修改指示，不改定稿或以舊預覽回退；修改另存新版本，保留本次封存及所有舊成品、素材、文案、來源、Git標記、Release及既有附件。舊宮中1.1.0完整文件仍在`public/chapters/lantern-three-act-v1-1.1.0-archive-20261028/`；1.0.0、更早章節及全部本機0.1.x預覽與來源均保留。原正式章節網址繼續轉到0.1.8。

康衢2.3.1、簪花、洛水及其他章節不因本次封存改動；榜下維持獨立、清明維持上鎖，共同三幕入場製作基準不變。AGENTS.md與製作標準1.5已登記本章維護基準。

## 封存附件

本機目錄：`output/releases/site-2026-10-28-lantern-shangyuan-0.1.8/`。同名Release新增以下附件，所有既有附件保留：

- `github-pages-artifact.zip`：直接下載的當次原始部署包，內含`artifact.tar`，保存當次整個網站及相對素材結構。
- `website-file-manifest.json`：部署包逐檔路徑、大小及SHA-256。
- `archive-records.zip`：封存政策、來源與署名記錄、原發布核對、批准來源ZIP、全部現存0.1.x來源ZIP、版本資料及預覽文件備份。
- `release-record.json`：固定提交、run、官方artifact digest、逐檔指紋、原線上核對與舊標記／Release保留核對。
- `SHA256SUMS`：上述四份附件的校驗值。

大型ZIP不加入Git歷史，JSON及指紋另存於`docs/releases/lantern-shangyuan-0.1.8-archive-2026-10-28/`。本機預覽文件的重複篆體字檔於archive-records.zip去重保存並登記還原映射，所有預覽原目錄保持原樣。

## 還原

1. 下載附件，依SHA256SUMS核對四份檔案。解開github-pages-artifact.zip，再解開artifact.tar，保留/chinese-wally/網站路徑及所有相對素材位置；用website-file-manifest.json逐檔核對。
2. 原始碼由固定標記另開乾淨目錄取回；批准完整章節來源另見原有approved-source-0.1.8.zip與archive-records.zip。原批准來源與正式HTML的正式存檔、題名、導航交接差異見發布記錄及提升記錄。
3. 章節引用原畫、動畫、介面、音樂及字型，不能只保存單一HTML就視為完整還原。本機預覽的來源、文件與去重字型依archive-records內preview-file-map.json的映射還原。
4. 封存包含存檔機制及鍵名，不包含各玩家瀏覽器的個人收藏或印記。還原備份不等於獲准覆蓋線上版本。

## 實際核對範圍

本次只下載部署原包、核對官方digest、建立tar逐檔指紋、比對原10份線上檔案指紋、核對舊標記與Release附件保留及封存附件上傳結果。沒有改動遊戲、重建、部署、重走流程或執行新測試，遊戲檢視範圍仍以原發布記錄為準。
