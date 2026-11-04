# 《夜訪畫坊》正式上線封存

2026-11-04（香港）。本次實際部署的版本為畫坊入口、觀畫帖與逐卷解鎖的維護及還原基準。

- 固定標記為 `site-2026-11-04-night-atelier`，指向部署提交 [`234d08ae93ce4ac38b65719b507bcf1323d73a7e`](https://github.com/vincentttchan/chinese-wally/commit/234d08ae93ce4ac38b65719b507bcf1323d73a7e)。
- GitHub Pages 於香港時間 09:26 完成部署。部署編號為 `7535303393`，原始 Pages 網站包編號為 `13286693282`。[正式站](https://vincentttchan.github.io/chinese-wally/) · [成功部署紀錄](https://github.com/vincentttchan/chinese-wally/actions/runs/41753947817)
- [GitHub Release 及還原附件](https://github.com/vincentttchan/chinese-wally/releases/tag/site-2026-11-04-night-atelier)

## 維護基準

主站首頁通往 `public/atelier/index.html`。玩家點亮廊燈、開門、聽同窗交代學畫人身份，再按案上印章進入《簪花仕女圖》。旅程依次開放簪花、宮中、康衢、洛水。畫坊內隱藏跨章導航，觀畫帖顯示已完成的畫作，可回訪各卷封面。「繼續旅程」開啟最新解鎖的畫卷。

- 《簪花仕女圖》完成章末回望與小結後收藏；留印可自選。
- 《宮中鬧元宵》兩題均作答、確認並讀完說明即可完成。
- 《在人群中聽樂》經畫作小記、作答並讀完說明即可完成。
- 《洛水之間》沿用正式三幕入場，章末完成及收藏條件待定。

觀畫帖與解鎖共用本機瀏覽器進度鍵 `chinese-wally:atelier:completed-chapters:v1`。同源瀏覽器已有 v19 預覽進度時，可由 `chinese-wally:study-v12:completed-chapters` 讀取。宮中旅程版的主線進度鍵是 `chinese-wally:atelier:lantern-shangyuan-v2:journey:v1`。網站包保存程式及素材，各玩家的個人進度由自己的瀏覽器保存。

保留此標記、發布附件及既有章節封存。日後修改另立版本，以此提交與原部署包作比對基準。

## 正式站驗收

2026-11-04 在桌面 Chrome 使用隔離的瀏覽器存檔核對。

| 測試情境 | 實際結果 |
| --- | --- |
| 全新存檔 | 完成點燈、開門、蓋印與簪花三幕入場，再走完三段尋人與觀察、章末回望及小結。觀畫帖只收藏簪花，下一卷開啟宮中封面。 |
| 宮中與康衢章末測試存檔 | 宮中兩題確認及說明後解鎖康衢。康衢讀完小記、作答及閱讀說明後解鎖洛水，觀畫帖顯示三卷。這兩章由章末測試狀態開始。 |
| 已有一卷收藏 | 重開主站可從觀畫帖重訪簪花；再重開，點一次「繼續旅程」即進入宮中。 |
| 已有三卷收藏的測試存檔 | 從畫坊與洛水均可重訪簪花，三卷進度保留。重開且簪花封面已預載時，點一次「繼續旅程」即進入洛水，無須重試。 |

## 還原

1. 從 Release 下載 `github-pages-artifact.zip`、`website-file-manifest.json`、`artifact-metadata.json`、`release-record.json` 和 `SHA256SUMS`。用 `shasum -a 256 -c SHA256SUMS` 核對。ZIP 是 Actions 當次實際上傳的原包，校驗值與 GitHub 官方 digest 一致。
2. 在空白目錄解開 ZIP，再解開其中的 `artifact.tar`。以 `website-file-manifest.json` 核對每個檔案的相對路徑、大小和 SHA-256。用 HTTP 測試時，把整份網站放在 `/chinese-wally/` 路徑下，保持 `atelier/`、章節與素材的相對位置。
3. 需要維護原始碼時，在乾淨工作目錄取出固定標記。該版本使用 Node.js 24，建置指令為 `npm ci` 和 `npm run build`，輸出在 `dist/`。需要逐位元還原當次上線成品時，使用已核對的原部署包。

封存作業只新增維護紀錄、固定標記與 Release 附件。驗收結果取自上線當日的正式站檢查。
