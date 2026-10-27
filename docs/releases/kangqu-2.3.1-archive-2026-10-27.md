# 正式封存：《康衢駢慶》2.3.1 · 2026-10-27

使用者已確認將本次實際上線的 2.3.1 正式封存，作為本章後續維護基準；所有舊版及原封存繼續保留。

## 固定版本

- 固定標記：`site-2026-10-27-kangqu-2.3.1`，沿用原指向，不移動或重建。
- 實際部署提交：`65e6497244b970fb2eefd27d3d44818ee8da0d04`。
- 成功部署：[GitHub Actions 40475459248](https://github.com/vincentttchan/chinese-wally/actions/runs/40475459248)。
- 正式文件：`public/chapters/kangqu-listening-v2-2.3.1/index.html`；[主站入口](https://vincentttchan.github.io/chinese-wally/#kangqu-listening)。
- [GitHub Release 與封存下載](https://github.com/vincentttchan/chinese-wally/releases/tag/site-2026-10-27-kangqu-2.3.1)。
- [原發布紀錄](kangqu-2.3.1-live-2026-10-27.md)、[19 份線上文件核對](kangqu-2.3.1-live-2026-10-27.json)及[933 份既有來源／公開檔案保留清單](kangqu-2.3.1-preservation-2026-10-27.json)仍保留。

本次維護文件提交只登記正式封存，不是另一份遊戲版本。封存取自上述成功 run 的原始 Pages 部署包，沒有重新建置。

## 後續維護基準

封存完整 2.3.1 的畫面與流程：三位人物的對白、原畫觀察及交接、51 字畫作小記、畫家如何營造祝壽慶典氣氛的總結題與回饋，以及現有封面、三幕入場、樣貌提示、介面、熱區、動畫、音樂開關與配樂、收藏、見聞冊、留印、存檔機制、收尾及導航。

沒有使用者明確的新修改指示，不改動上述定稿，不以舊預覽或舊封存降回 2.2.0。日後修改另存新版本，保留本次封存及所有舊來源、素材、文件、標記、Release 和附件。`AGENTS.md` 與製作標準 1.4 已登記此基準。

榜下維持獨立可玩版本、清明維持上鎖；其他章節及原共同三幕入場製作基準不因本次封存而改動。

## 封存附件

本機位置：`output/releases/site-2026-10-27-kangqu-2.3.1/`。GitHub Release 保存相同附件：

- `github-pages-artifact.zip`：直接下載的實際部署原包，內含 `artifact.tar`，保留當次整個網站與其相對素材結構。
- `website-file-manifest.json`：部署包內每個一般檔案的路徑、大小與 SHA-256。
- `archive-records.zip`：維護政策、製作標準、來源署名、文案與打包來源、原發布核對及本次封存記錄。
- `release-record.json`：固定提交、run、官方 artifact digest、逐檔及舊標記／Release 保留核對。
- `SHA256SUMS`：上述四份附件的校驗值。

大型 ZIP 不加入 Git 歷史。封存目錄中的 JSON、指紋與舊標記／Release 清單亦保存在 `docs/releases/kangqu-2.3.1-archive-2026-10-27/`。

## 還原說明

1. 下載附件，先用 `SHA256SUMS` 核對四份檔案。
2. 解開 `github-pages-artifact.zip`，再解開其中 `artifact.tar`。保留 `/chinese-wally/` 的網站路徑及所有相對素材位置，可依 `website-file-manifest.json` 再逐檔核對。
3. 原始碼從固定標記 `site-2026-10-27-kangqu-2.3.1` 另開乾淨目錄取回；維護及來源記錄亦見 `archive-records.zip`。
4. 康衢獨立 HTML 引用既有原畫、介面、音樂、字體及動畫目錄，不能只保存單一 HTML 就視為完整還原。封存保存存檔機制與鍵名；個別玩家的見聞與印記仍保存在各自瀏覽器，本包不包含玩家個人存檔。

還原封存不等於獲准覆蓋線上版本；正式入口繼續使用已上線的 2.3.1。

## 舊版保留與實際檢視範圍

2.3.0／2.3.1 本機預覽、2.2.0 導航版、2.2.0 原版、2.1.14 及更早文件、共用素材和所有先前封存都保留。舊遠端標記清單見 [preserved-tags.json](kangqu-2.3.1-archive-2026-10-27/preserved-tags.json)，舊 Release 與附件身分及指紋見 [preserved-releases.json](kangqu-2.3.1-archive-2026-10-27/preserved-releases.json)。

本次只執行部署原包下載、官方 digest 核對、tar 逐檔指紋、與原 19 份線上核對記錄比對，以及舊標記和 Release 保留核對。沒有修改執行內容、重新建置、部署、重新通關或執行新測試；遊戲檢視範圍沿用先前發布紀錄。
