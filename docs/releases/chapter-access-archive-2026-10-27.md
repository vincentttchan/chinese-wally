# 正式封存：章節入口調整 · 2026-10-27

使用者確認將這次上線版本正式封存，作為後續維護基準，保留所有舊版與封存標記。

## 固定版本與範圍

- 封存標記：`site-2026-10-27-chapter-access`，對應已部署提交 `5e488f8d7125a64e6975f93159daac451b2b8e8a`。沿用原標記，沒有移動、改寫或新增替代版本。
- [GitHub Release 與下載](https://github.com/vincentttchan/chinese-wally/releases/tag/site-2026-10-27-chapter-access) · [成功部署](https://github.com/vincentttchan/chinese-wally/actions/runs/40460342079) · [正式網站](https://vincentttchan.github.io/chinese-wally/)。
- [發布及實際核對紀錄](chapter-access-live-2026-10-27.md)、[線上文件指紋](chapter-access-live-2026-10-27.json)及 [925 個既有檔案保留紀錄](chapter-access-deployment-preservation-2026-10-27.json)繼續保存。
- 本次文件提交只登記封存與維護政策，不是另一份遊戲版本。

## 後續維護基準

《榜下尋人》已從主站抽離，獨立版保留於 `chapters/examination-standalone-20261027/index.html`；《清明上河圖》保留名稱並上鎖，原網址停在選畫頁；康衢正式文件為 `chapters/kangqu-listening-v2-2.2.0-navigation-20261027/index.html`，除導航外與原 2.2.0 一致。

簪花三幕 1.0.0、洛水三幕 1.0.0、宮中三幕 1.1.0 與康衢 2.2.0 的完整遊戲以本次部署內容保存，包括畫面、流程、文案、動畫、收藏、收尾、背景音樂、音樂操作及存檔鍵。沒有使用者新修改要求，不改動定稿、不接回榜下主站入口、不解鎖清明，也不以整理、重構、換曲或舊預覽覆蓋此版。後續修改另存新版本。

`AGENTS.md` 及製作標準 1.3 已登記這份維護基準；三幕入場的製作原則與逐章身份設計仍沿用既有共同封存。

## 封存附件與還原

本機保存於 `output/releases/site-2026-10-27-chapter-access/`，以下附件亦保存於 GitHub Release：

- `github-pages-artifact.zip`：從成功部署 run 直接下載的官方原包，內含 `artifact.tar`，沒有重新建置。
- `website-file-manifest.json`：部署包內每個一般檔案的路徑、大小與 SHA-256。
- `archive-records.zip`：維護指示、製作標準、發布、封存、來源署名及核對文件。
- `release-record.json`：固定提交、部署包 digest、入口、維護政策及所有原 Git 標記。
- `SHA256SUMS`：以上附件的校驗值。大型 ZIP 不加入 Git 歷史。

先依 `SHA256SUMS` 核對附件，再解開 ZIP 中的 `artifact.tar`，保持 `/chinese-wally/` 網站路徑與相對素材結構。原始碼從固定標記另開工作目錄取回。各章 HTML 引用共用原畫、字體、配樂與動畫素材；不能只複製單一 HTML 就視為完整離線保存。還原封存不等於獲准覆蓋線上版本。

## 舊版與標記保留

所有先前的 `site-2026-10-23`、簪花導航、宮中、康衢、簪花、洛水及共同三幕封存標記保持原指向；完整遠端標記清單見 [preserved-tags.json](chapter-access-archive-2026-10-27/preserved-tags.json)。所有 `public/chapters` 舊版文件及被引用素材仍由本次固定標記與部署包保存。沒有刪除或覆寫舊 Release、附件或原封存。

本次只下載、保存、計算指紋及核對部署內容與原標記；未修改遊戲檔案、重新建置、重新部署、重新通關或執行測試套件。實際發布檢視範圍沿用原紀錄，不擴大聲稱。
