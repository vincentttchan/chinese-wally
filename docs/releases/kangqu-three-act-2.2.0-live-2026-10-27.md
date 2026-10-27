# 《在人群中聽樂》2.2.0 正式入口與上線

使用者於 2026-10-27 確認 2.2.0，要求接到正式章節入口並上線，保留 2.1.14 舊版封存，其他章節不變。

## 本次發布

- 正式入口：`#kangqu-listening`，宿主直接開啟 `chapters/kangqu-listening-v2-2.2.0/index.html?v=2.2.0-20261027`。
- 舊分享網址 `chapters/kangqu-listening/index.html` 轉往同一 2.2.0。
- 2.2.0 文件與使用者確認的獨立版相同；保留三幕文案、外鄉客身份、封面交疊淡化、文字對齊、逐字呈現及原畫右移。
- 2.1.14 完整原文：`chapters/kangqu-listening-v2-2.1.14/original-index.html`；可開啟版是同目錄 `index.html`，僅加入素材 base URL。
- 原 `kangqu-listening-v2/index.html` 同樣保留 2.1.14，作為版本基底與唯讀素材目錄。正式入口不會誤用其無記憶版本。
- 更早的原上線版另存 `chapters/kangqu-listening-legacy-20261027/`，原文與前次線上版逐位元相同。
- 166 個已審視素材逐一與 2.1.14 版本清單的 SHA-256 核對相同後帶入。沒有發布無關的舊修訂或研究素材。
- 收藏繼續使用 `chinese-wally:kangqu-listening-v2:journal:v2`，沒有清除進度。

## 其他章節保留

以正式發布前的 `fef33cc345de3c971db9b3d943d80513ea13b544` 為基底，只帶入已確認的本章文件、素材與宿主入口修改。其他五章、Lantern 1.1.0 及其封存、共用 CSS、音樂、導航與素材均保留。

720 個既有 src/public 檔案逐一比對 Git blob 相同，清單見 `kangqu-three-act-2.2.0-deployment-preservation.json`。既有執行檔案的修改範圍只有本章宿主、章節文件路徑、舊章節轉接與重新產生的首頁包；章節卡片資料與主路由不變。既有 Git 封存標記沒有移動。

## 建置與檢視

本輪 `npm run build`（型別檢查、Vite 發布建置、本機首頁封裝）完成。只作發布所需的入口、封存、素材指紋及畫面檢視，沒有增加或執行測試套件，沒有重走全章所有動畫。

正式版部署提交為 `b150a346bee6cc017de1e1fb36b3e578fde1c9f9`；GitHub Actions `40440537045` 於 2026-10-27 02:49:48 UTC（香港 10:49:48）完成成功。正式入口實際開啟 2.2.0 iframe，載入提示正常消失，封面可進入直排三幕；2.1.14 線上封存也可開啟。六份線上文件與本次發布檔案完全一致，包括未改動的 Lantern 1.1.0。詳細結果記錄在同目錄 `kangqu-three-act-2.2.0-live.json`。

## 後續維護

- `scripts/promote-kangqu-three-act-2.2.0.py` 驗明已審視版、封存及素材後，產生原分享網址的轉接與 active-release 記錄。
- `scripts/package-kangqu-three-act-v2.2.0.py` 仍只建立 2.2.0 獨立版，不能覆寫保留的 2.1.14。
- `kangqu-listening-v2`、`kangqu-listening` 的共用素材仍被兩個封存版引用；不能因入口轉移而刪除。
