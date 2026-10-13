# 每章獨立配樂

2026-10-13｜範圍：現行「宮中鬧元宵」「榜下尋人」「在人群中聽樂」三個章節。

## 曲目

- 宮中鬧元宵保留原有 Chinese Restaurant Background 4。
- 榜下尋人改用 Chinese Restaurant Background 8，提供較從容的探索氣氛。
- 在人群中聽樂使用 Chinese Restaurant Background 7，提供較明快的合奏背景。
- 依曲目頁的描述選曲；配樂是現代背景音樂，沒有聲稱復原明、清演奏。

來源、下載網址、時長、SHA256、署名與授權記錄見 `public/audio/CREDITS.md`。

## 共用實作

- `src/audio/chapterMusicTracks.js`：章節曲目與署名資料。
- `src/audio/chapterMusic.js`：玩家主動開啟、音量漸變、背景靜音、循環、錯誤重試與離開時清理。
- `src/audio/useAmbience.ts`：React 章節接入共用引擎；預設保持元宵配樂。
- 康衢章節從共用 JS 與現行 ArtIcons 包裝播放機制，沿用 `round-control` 手繪音樂開關。
- 修改康衢的 v1.2 源檔，經 `scripts/package-kangqu-chapter.py --runtime-only` 更新公開章節，不直接改生成的 HTML。此模式保留已包裝美術及來源紀錄，適合只更新程式與文案。
- 網頁用音訊緩衝交疊循環；`file:` 本地版本用音訊元素循環，以避開本地 fetch 限制。兩種方式都在閱讀時降低音量。
- 換章節不自動開啟新音樂。開關由玩家控制，離開後停止上一章的播放。

## 檢視範圍

已取得並查看兩首 MP3 的格式、時長及來源資料。TypeScript 與完整 `npm run build` 成功；最後一次共用引擎的小調整另以保留公開素材的 Vite 程式建置完成，並重新包裝 `public/index.html`。本次不執行自動化測試或瀏覽器試玩；實際音量、音色適配與跨瀏覽器聆聽仍需使用者遊玩時確認。

完整素材重新包裝曾因舊鼓圖樣來源檔案複製逾時而中止；改用保留現行美術的 runtime-only 模式後完成。第一次 TypeScript 建置程序被系統終止，已限制 Node 記憶體後重新建置。

完整 Vite 建置曾長時間等待舊動畫素材及 CSS 檔案，最終仍成功完成（約 5 分 18 秒）。本次沒有部署或推送。
