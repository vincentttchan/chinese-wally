# 人群中聽樂：原版遊戲整合

2026-10-13。使用者要求將這個章節加入原本版本。

## 入口及資料

- 原版首頁 Introduction 的章節入口：`#kangqu-listening`。
- 原版歷史畫作選單：`#historical-paintings`，和宮中鬧元宵並列。
- GameRouter 以 KangquGame 承接；載入網站 public 資產，不指向效果稿目錄。
- 選單介紹更新為四位人物、樂隊、儀仗及吉祥彩牆，章節標示「新章節」。
- 最新 v1.2 文案、202 人／606 句對白、六類收藏、四種暗八仙圖案與定位、演繹及冊頁流程均由 package-kangqu-chapter.py 組裝到正式 public 目錄。
- 移除公開章節回到 authoring 效果稿的 file 專用連結改寫；網站「畫作選單」回到原版選單。

## 保存與交付

保留已完成宮中鬧元宵的章節內容與操作。原版採用目前工作區源碼；未更改預設章節或另設新首頁。

最新來源：`output/art-direction/wanshou-third-scroll/v1.2`。網站章節文件：`public/chapters/kangqu-listening/index.html`。主應用程式依 Vite base 路徑解析章節與素材。

本次已執行章節資產組裝及 npm run build：TypeScript 編譯與 Vite 生產建置成功。dist 中章節 HTML、人物對白資料、內容來源及原畫與 public 組裝檔的檔案比對相符，數值保存於 kangqu-listening-build-integration-2026-10-13.json。未啟動瀏覽器或本地伺服器，未新增或執行測試，未推送或部署線上網站。瀏覽器互動、動畫接縫、冊頁與對白實際效果仍未判定。

## 本機封面入口補正

使用者回報本機遊戲首頁仍未見新章節後，查到封面存在多個獨立實作：通用 Introduction 已有入口，但 LanternGame 仍只列出練習，ExaminationStreetLifeGame 的封面沒有章節選單。

新增共用 ChapterLinks，三個封面統一讀取 historicalChapters 及既有練習章節資料。歷史畫作入口排在選單前方，包含「明代 · 宮中鬧元宵」與「清代 · 在人群中聽樂」，保留原有封面字體、連結樣式與目前章節標示。再次執行 npm run build 成功，更新 dist 生產檔；未執行瀏覽器封面視覺檢查或測試。

## 截圖揭示的本地檔案入口問題

使用者提供的截圖仍顯示康衢章節封面，網址卻已到 `public/#historical-paintings`。文件核對發現 public/index.html 不存在：原版 React 選單在網站建置入口中，章節的返回連結卻指到本地 public 目錄。

已補 public/index.html，直接沿用目前網站生產建置的 React 程式與 CSS，內嵌編譯內容並改用 public 目錄相對素材路徑。沒有另做封面樣式或替換宮中鬧元宵內容。scripts/package-local-home.py 只組裝檔案，不執行網頁；npm run build 完成網站建置後同步輸出此本地首頁。

章節的「畫作選單」明確連到 ../../index.html#historical-paintings。檔案來源的 parent／iframe 載入訊息使用有效的 targetOrigin，接收端仍核對訊息來源視窗。網站伺服器版本保留原本 Vite 建置入口。

本次資產組裝、TypeScript 與 Vite 建置，以及本地首頁輸出成功。未使用瀏覽器、伺服器或其他方式繞過先前存取限制，未新增或執行測試。實際開啟與導覽結果仍需使用者確認。

## 本地章節載入層停留的補正

使用者下一張截圖顯示 public/index.html#kangqu-listening 停在主應用的「正在展開畫卷」層。源碼顯示該層需要 iframe 子章節回傳 ready；截圖不能判定究竟是本地嵌框載入、圖片載入或訊息未到達。

本地 file 入口改為直接開啟已有的章節文件：封面及畫作選單的康衢連結使用章節文件路徑；既有 #kangqu-listening 本地網址由路由轉到同一文件，不建立 iframe，保留可按的「開啟章節」回退入口。章節返回 ../../index.html#historical-paintings。HTTP 網站維持既有路由與載入訊息。

再次完成 TypeScript、Vite 與本地首頁組裝。這修正了本地入口對 iframe ready 的依賴，未實際操作瀏覽器，因此不宣稱用截圖確認載入已成功。

## 使用者確認的並列封面導覽

使用者指定 10:20:56 截圖的封面導覽為標準，並要求實作。康衢獨立章節的封面亦已補上同樣五項：明代／宮中鬧元宵、清代／在人群中聽樂、卷一／榜下尋人、卷二／廟會尋蹤、畫作選單。沿用共用 chapter-links 樣式與目前章節標示，連結明確回到原版 public/index.html 對應路由。章節資產、本機首頁及網站生產建置已同步更新；未作瀏覽器實際操作或測試。

使用者隨後要求將封面首幕小題「為皇太后祝壽的街道」改成「清代 · 康衢駢慶」。來源及 public 章節已由組裝程序更新，dist 章節文件亦已同步。此輪完整建置的 TypeScript 步驟被系統以 SIGKILL 中止，未宣稱完整建置成功；主應用沒有本輪程式修改，保留上一輪建置檔。未執行測試或瀏覽器檢視。
