# 全章節網站發布紀錄 · 2026-10-22

本次上線版本已依使用者要求正式封存為 `site-2026-10-23`，固定對應部署提交 `c9e99bfbc13322269c29d5d0d12071c739c3b828`；見[正式封存紀錄](../releases/site-2026-10-23.md)。後續僅保存紀錄的提交不改變這份上線版本。

## 2026-10-23 線上確認完成

- GitHub Pages 部署已成功完成。遠端 main 仍為 `c9e99bfbc13322269c29d5d0d12071c739c3b828`；本次只核對與更新紀錄，沒有重新部署或改動遊戲內容。
- 六章入口已在正式網站實際載入；21 個關鍵線上檔案與本次發布快照的 SHA-256 全數一致，涵蓋主程式、樣式、六首配樂、六章代表圖片、簪花石章／朱印、康衢獨立文件與署名。
- 目前本機 src 的來源指紋與線上 release manifest 一致；manifest 中 477 個素材與目前本機版本亦無差異。
- 簪花音樂共用開關實際顯示：關閉 → 載入中 → 開啟 → 關閉。其餘五章音檔逐一比對內容指紋，沒有更換配樂。
- 完整檢視範圍與限制見[線上確認紀錄](site-verification-2026-10-23.md)。下方排隊狀態保留為 10 月 22 日的歷程。

## 使用者要求

發布《簪花仕女圖》正式版，並確保現有章節為目前最新版本，保留已定稿的畫面、流程和背景音樂。

## 已完成的發布準備與推送

- 網站：https://vincentttchan.github.io/chinese-wally/
- 遠端主分支原版本：`dcf1369abaaf8964d15607a25703a73da9f5ec58`。
- 最新發布提交：`c9e99bfbc13322269c29d5d0d12071c739c3b828`，已推送 `origin/main`。
- 最新部署：https://github.com/vincentttchan/chinese-wally/actions/runs/39796696844
- 章節：《簪花仕女圖》`#zanhua`、《洛水之間》`#luoshen`、《宮中鬧元宵》`#lantern-festival`、《在人群中聽樂》`#kangqu-listening`、《清明上河圖》`#qingming-shanghe`、《榜下尋人》`#examination`。
- 從線上最新提交建立獨立發布快照，納入本機現行程式與素材；保留線上現有橫向導覽、目前章節可見及金色描邊更新。沒有切換、重設目前使用者分支或改動原暫存區。
- 重新執行康衢 `--runtime-only` 正式封裝，同步現行自由聽樂版本；保留各章節已定稿介面、流程、配樂。
- 簪花正式路由、朱印與石章、返回選單及既有現成配樂一併發布；既有其他五章音檔與音樂引擎相較線上基準沒有變更。
- `public/release.json` 記錄六章入口、音檔與 477 個靜態素材 SHA-256，供線上版本核對。

## 實際完成的建置與盤點

- 從發布快照複製 725 個必要建置輸入，逐一確認與 Git 暫存快照的 blob 相同，在獨立目錄執行 `npm run build`。
- TypeScript 檢查、Vite 218 模組及本機 HTML 封裝成功。輸出 `index-Dn722hlC.js`（1,297.34kB，gzip 391.09kB）與 `index-DmxTvyau.css`（207.20kB，gzip 42.83kB）。既有大於 500kB 的 chunk 提示保留，未為此更動定稿架構。
- 建置輸出的 477 個素材與發布 manifest 全數一致；發布快照與當時本機 src/public/scripts/建置設定沒有後續差異。沒有額外執行測試套件或重新通關。
- 六首配樂指紋：簪花 `c16be78cb00e…`、洛神 `d53baadf544c…`、元宵 `46caeb57f106…`、康衢 `6482317dfc38…`、清明 `f323097c1727…`、榜下 `0fc1757554a5…`。完整值見 release manifest。

## 2026-10-22 當時部署狀態與限制（後續已完成）

- 尚未完成線上切換確認。GitHub Actions 延遲，最新部署仍排隊、沒有 runner、沒有開始執行建置步驟。
- GitHub 狀態 API（2026-10-22 14:35 UTC 更新）回報 Actions degraded_performance，事件為「Incident with Actions Results」：工作與步驟結果以及部分 repository 更新延遲。狀態 API：https://www.githubstatus.com/api/v2/summary.json 。一般狀態網頁的快取仍可能顯示較早的 operational，這裡以較新的 API 回應記錄，不能將個別佇列原因全部斷言為該事件。
- 初始兩次同一份遊戲內容的部署被舊 pages concurrency 佇列阻擋；已送出取消要求。最新提交將 group 改為 `pages-${{ github.ref }}`，避免舊佇列鎖，維持同一分支相互取消的行為。沒有改動遊戲內容。
- 網站實際 HTTP 檢查仍取得上一版 JS `index-BdLpcrN1.js`／CSS `index-D63O-KVn.css`；新 release.json 當時為 404。不能將成功推送冒充已成功上線。
- 未完成部署後六章入口、21 個關鍵檔案（兩個 bundle、六首音樂、六章圖片、印章素材、康衢正式文件、相容頁與署名）與音樂開關的線上核對，需待部署成功後執行。
- HTTP 檢查的系統 Python 缺少可用 CA 鏈，改用系統 curl 的正常憑證驗證，沒有略過 TLS 驗證。

- 最後實際查看 GitHub 部署頁仍為 Queued。代表截圖與 21 檔案核對計畫保存於 `output/releases/site-publication-2026-10-22/`。最新遠端部署保留排程；本機狀態監看程序停止，沒有取消最新部署，也沒有建立未經要求的後續自動監看。
