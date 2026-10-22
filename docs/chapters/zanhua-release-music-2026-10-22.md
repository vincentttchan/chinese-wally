# 《簪花仕女圖》正式封裝與背景音樂

日期：2026-10-22（香港）。接續使用者要求完成正式封裝及本章配樂，沿用音樂開關，保留已定稿的畫面與流程；音樂使用網上現成曲目，不製作音樂。

## 正式封裝

- 正式路由為 `#zanhua`。畫作選單改進入此路由，`src/main.tsx` 直接使用已確認的 `ZanhuaPreview` 元件（在入口命名為 `ZanhuaGame`），沒有複製另一套畫面、文案、狀態機或素材。
- 單一主要入口納入本章，因此現有 Vite 建置及 `scripts/package-local-home.py` 均包含本章。維持原有單一編譯 bundle 的本機封裝方式，沒有另建 UI 或拆分章節邏輯。
- 網頁輸出：`dist/`，部署 base 維持 `/chinese-wally/`。`npm run preview -- --port 5192` 亦使用相同 base，方便查看實際建置輸出。
- 本機輸出：`public/index.html`，已內嵌編譯後的 CSS／JS，保留 `public/art/`、`public/audio/`、`public/fonts/` 等相對資產。搬移本機版時需保存整個 public 目錄，不能只搬單一 HTML。
- 選單返回地址由 `src/game/zanhuaNavigation.ts` 統一產生：網頁版 `/chinese-wally/index.html#painting-selection`，本機封裝為 `./index.html#painting-selection`。
- 開發時保留根目錄 `zanhua-preview.html` 的原本預覽及查閱入口。正式輸出中的同名相容頁來自 `public/zanhua-preview.html`，相對跳轉至 `./index.html#zanhua`，舊書籤仍可入畫。本相容頁從引言開始；開發預覽的 scene/person 捷徑沒有搬入相容跳轉。
- 網頁與本機封裝均產出；本次未 push、未觸發 GitHub Pages，也沒有發布至遠端網站。

## 配樂與來源

- 採用 **Chinese Restaurant Background 3 — Sascha Ende**，作者頁介紹為慢速古箏純音樂，適合靜觀庭園與衣飾的氣氛。這是本次依曲目頁介紹作出的選曲判斷，未冒稱唐代曲目復原。
- [曲目頁](https://ende.app/en/song/12392-chinese-restaurant-background-3)；[作者授權頁](https://ende.app/en/standard-license)；[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。2026-10-22 查閱曲目頁，標示私人／商業可用；保留作者、曲名、來源與授權連結。
- 直接下載作者曲目頁的公開 MP3：`https://ende.app/storage/mp3low/6ba5f034-2504-4fe0-98ed-02fe452b33af.mp3`，保存為 `public/audio/zanhua-music.mp3`。
- 沒有合成、製作或改編音樂，音檔內容未修改。`afinfo` 顯示約 131.16 秒，48kHz、雙聲道、128kbps。
- SHA-256：`c16be78cb00ea97f236af1f9a50b1aaa1f94f67f9cabc86c170b1393f1d2c8bf`。dist 與 public 音檔一致。
- 曲目登記於 `src/audio/chapterMusicTracks.js`／`.d.ts`。完整署名保存於 `public/audio/CREDITS.md`；遊戲的畫作小記亦提供曲目與授權連結。
- 沿用 `useAmbience`、`chapterMusic.js` 及 `ArtIcons` 的共用手繪開關。由玩家入畫後開啟；閱讀、圖解及收尾降低音量，背景頁靜音，離開章節釋放播放資源。引擎本身未改動。

## 實際完成的核對

- 最終 `npm run build` 成功（exit 0）：TypeScript、Vite 217 個模組及本機 HTML 封裝均完成。網頁編譯 bundle 約 1.30MB／gzip 約 391KB；Vite 有大於 500KB 的 chunk 提示，沒有為此改動現有單檔封裝架構。
- 檔案盤點：dist 主要入口、舊網址相容頁、石章／朱印兩圖及音檔存在；本機 HTML 不含外部 module script、包含正式路由與音檔引用，已移除網頁部署 base，返回選單地址保留。
- 內置瀏覽器 1280×720，以 `vite preview` 查看正式輸出：選單 → `#zanhua` → 兩幕引言 → 尋人；共用音樂開關先顯示關閉，按下後經載入進入開啟，再按下可關閉。
- 實際查看畫作小記，曲名、作者及 CC BY 4.0 連結有顯示；本次觀察的控制台 error／warn 為空。
- 實際打開正式輸出的 `/chinese-wally/zanhua-preview.html`，轉至 `/chinese-wally/index.html#zanhua` 並顯示同一引言。
- 以既有 `?scene=complete&person=2#zanhua` 捷徑查看小結 → 蓋印 → 完成 → 返回選單，返回 URL 保留 `/chinese-wally/`，沒有變回站台根目錄。這不是重新完整通關三位人物。
- 代表截圖保存於 `output/gameplay-preview/zanhua/release-music-2026-10-22/`：`web-music-on.png`、`web-music-credit.png`、`web-seal-pressing.png`、`web-seal-complete.png`。

## 檢視限制

- 直接開啟 `file://.../public/index.html#zanhua` 的瀏覽器檢視被內置瀏覽器 URL 政策阻擋（只允許 HTTP／HTTPS）。未繞過限制；本機封裝僅核對產物、相對路徑及共用引擎的既有 file 分支，未宣稱已在 file 模式實際播放音樂。
- 音樂的開啟／關閉以播放器完成載入後的 UI 狀態確認，未做聲學聽感或長時間循環量測；沒有額外執行測試套件、手機回歸、全人物主線、實機雙指或其他章節流程。
- 既有已確認的場景、美術、部件圖解、動畫、對白、小結、蓋印及收藏規則維持原樣；此輪只改入口／返回地址、章節頁標題、音樂開關及署名。
