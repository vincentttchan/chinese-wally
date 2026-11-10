# 最新本機預覽 · 2026-11-10

GitHub 預覽分支：`codex/latest-preview-2026-11-10`。本分支保存目前完整預覽，未要求部署正式站；main 的 Pages 自動部署規則不變。

本機：`npm ci` 後執行 `npm run dev -- --port 4190 --strictPort`，開啟 `http://127.0.0.1:4190/atelier/index.html`。

包含夜訪畫坊最新入場、簪花衣飾與人物流程、洛水章末、逐章解鎖與重訪、自選貼紙觀畫帖，以及可向右拖動、保留未解鎖名稱懸念的觀畫長河。舊版模組、正式章節及封存記錄保留。

本次補齊本機稀疏工作目錄缺少的 90 個既有檔案；這些檔案本已存在 Git 基準，沒有替換圖像內容。另修正 `public/atelier/kangqu.html` 重複 base 設定造成相對素材位置錯誤，使用共享的 `chapters/kangqu-listening-v2/` 素材根目錄，官方 2.3.1 章節文件未改。

驗證：534 張本機 PNG/JPEG/WebP 圖片完整性通過，`npm run build` 成功（保留既有大型 bundle 警告）；預覽分支供檢視與後續修改。正式部署另行處理。
