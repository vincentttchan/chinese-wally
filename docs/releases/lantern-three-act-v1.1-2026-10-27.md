# 宮中鬧元宵三幕入場 1.1.0

2026-10-27（香港）｜正式上線並封存。

使用者確認三幕入場版本，要求正式上線並保留舊版；其後補充封面「走進這一卷」到三幕入場需要更流暢的過渡。本版一併完成這項調整。《在人群中聽樂》仍等待使用者審視，不納入本次更新。

## 內容

- 保留原有封面，點「走進這一卷」後，封面文字約240ms淡去，封面底色約760ms淡去；已備妥的入場原畫與暗幕約1050ms交疊淡入。
- 兩個原畫取景共同存在於交接期間，避免直接移除封面造成換景跳切。第一幕逐字呈現等交接完成後才開始；慢速載入時保留封面並顯示「正在展卷」。減少動態時直接交接。
- 三幕依次為「宮中元宵」「畫中元宵」「初次隨行」，沿用已確認文案、七欄對齊、相同起筆位置、逐字顯現與原畫向右緩移。
- 最後「入畫尋人」接原有可操作章節，保留相機交接、凝神、提示、人物回應、收藏、音樂與收尾。小內侍身份及對白為遊戲虛構。

## 上線與舊版

- 正式入口：[宮中鬧元宵](https://vincentttchan.github.io/chinese-wally/#lantern-festival)。預設入口亦進入本章新版。
- 保留舊章節原碼，提供[舊版流程](https://vincentttchan.github.io/chinese-wally/#lantern-festival-legacy)。
- 已確認的本機1.0.0成品另存於 `public/chapters/lantern-three-act-v1-1.0.0/`，保留其版本記錄；1.1.0另有 `public/chapters/lantern-three-act-v1/` 獨立完整入口。
- 既有 `site-2026-10-23`、`site-2026-10-23-zanhua-navigation` 標記及官方封存附件保留。新版本另立標記 `site-2026-10-27-lantern-three-act-v1.1.0`。

## 發布範圍

發布工作目錄由 `origin/main` 的 `bebe5ca` 建立，只加入宮中新版來源、成品、路由及紀錄。沒有把原工作目錄尚未審視的改動合併到正式版本。

《在人群中聽樂》的正式章節、來源、音樂與其他原有畫作檔案保留；發布前後逐檔對照存於 `output/releases/lantern-three-act-v1-2026-10-27/protected-official-before.json` 與後續對照記錄。

## 建置與檢視

獨立版本先由 `vite.lantern-three-act-v1.config.ts` 建置、`package-lantern-three-act-v1.mjs` 封裝，再執行正式站既有 `npm run build`，包含型別檢查與全站產物建置。沒有新增或執行測試套件。

已在本機獨立入口觀看封面交接與第一幕開始；1.0.0階段已走過三幕、實際入畫及返回封面。正式站產物另走過三幕至可操作尋人，當次控制台無error／warn。線上新版與舊版入口均已實際開啟。


## 正式部署結果

- 部署提交：`1026563b73501884d1664053970ccd38ec17c6f2`。
- [GitHub Pages部署](https://github.com/vincentttchan/chinese-wally/actions/runs/40435996153)：成功，2026-10-27 10:03（香港）完成。
- [固定標記與發布](https://github.com/vincentttchan/chinese-wally/releases/tag/site-2026-10-27-lantern-three-act-v1.1.0)：`site-2026-10-27-lantern-three-act-v1.1.0`，指向上述部署提交。
- 線上主入口、1.1.0版本記錄及1.0.0封存記錄皆回應HTTP 200；已在內置瀏覽器開啟新版1.1封面、交接與第一幕，以及舊版兩幕入口。
- 正式《在人群中聽樂》頁面SHA-256為 `a895044ce6904cc78198acb577eee1ff998d225a626cd1379b1d876b64a49cb6`，與發布前保存檔一致。部署目錄44個檔案及84個受保護的既有來源／素材亦核對相同。
- [線上核對記錄](lantern-three-act-v1.1-live.json)。本機代表畫面另存於 `output/releases/lantern-three-act-v1-2026-10-27/live-entry-v1.1.png` 與 `live-legacy.png`。

本次只新增宮中版本，沒有帶入原工作目錄待審視的康衢新版。舊正式標記、發布附件、舊宮中程式及1.0.0已確認成品均保留。
