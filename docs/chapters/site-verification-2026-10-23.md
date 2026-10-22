# 全章節網站部署確認 · 2026-10-23

正式封存標記為 `site-2026-10-23`；見[封存與後續維護規則](../releases/site-2026-10-23.md)。下列遠端 main 的核對描述為正式封存紀錄提交前的檢查時點。

## 結果

正式網站已切換至 `c9e99bfbc13322269c29d5d0d12071c739c3b828`，包含《簪花仕女圖》正式版及其餘五章目前正式內容。畫面、流程與背景音樂沿用原版本；這次只檢視線上結果和更新本機紀錄，沒有修改產品程式、素材或部署設定，沒有重建、重新發布或額外執行測試套件。

- [網站章節選單](https://vincentttchan.github.io/chinese-wally/#painting-selection)
- [簪花正式入口](https://vincentttchan.github.io/chinese-wally/#zanhua)
- [成功部署](https://github.com/vincentttchan/chinese-wally/actions/runs/39796696844)

## 實際完成的檢視

1. GitHub Actions run completed / success，checkout、npm ci、npm run build、artifact 上傳與 Deploy 全部成功。重新查閱遠端 main，仍是上述同一提交。
2. 直接從正式網站讀取 21 個關鍵檔案，比對 10 月 22 日發布前保存的 SHA-256：21 / 21 全數一致。包含 index.html、release.json、JS、CSS、康衢文件、六首配樂、六章圖片、石章／朱印兩圖、音樂署名及舊預覽相容頁。
3. 網站主程式 `index-Dn722hlC.js`、樣式 `index-DmxTvyau.css`；已取代當時的舊版檔名，沒有只依 Actions 成功標記判斷網站已更新。
4. 線上 release manifest 的 sourceDigest 與目前本機完整 src 指紋相同（`bb1a9a35fc613bc471a8f5aac0af1dde3b8f1fe972050e8d66654984c9959d0f`）；manifest 登記的 477 個 public 素材與目前本機逐檔盤點沒有差異。
5. 內置瀏覽器實際開啟正式章節選單及六章：簪花、洛水之間、宮中鬧元宵、在人群中聽樂、清明上河圖、榜下尋人，皆顯示相應引言。洛神、元宵、清明、榜下的原畫 img 均 complete 且自然寬度非零；簪花實際進入尋人原畫與工具列。康衢獨立 iframe 載入 `index.html?v=free-musicians-20261022`，顯示三幕引言，並可由其導覽進入清明。
6. 簪花兩幕引言 → 入畫尋人 → 現有手繪音樂開關：關閉 → 載入中 → 關閉音樂（已開啟）→ 開啟本章音樂（已關閉）。六首線上音檔的完整內容指紋均與發布前一致；沒有換曲、合成或改編音樂。
7. 本次瀏覽器檢視取得的 error / warn 紀錄為空。代表截圖、21 個檔案比對結果、live release manifest 與本機差異盤點保存於 `output/releases/site-publication-2026-10-23/`。

## 範圍與限制

這是正式部署內容、入口及指定音樂開關的核對；沒有重新完整通關六章、逐一點選全部收藏、重新做手機／手勢／輔助科技回歸，沒有聲學聽感或長時間循環量測。21 個關鍵檔案在正式網站完整下載比對；477 是線上 manifest 對目前本機素材的盤點數，不冒稱已重新下載全部 477 個線上檔案。原有編譯程式與樣式完全相同，沒有為本次檢視改變定稿畫面與流程。
