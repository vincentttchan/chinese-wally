# 四章封面正式封存

2026-11-19（香港）。使用者確認本次實際上線的四章封面作為日後維護基準。

| 版本 | 固定標記 | 正式部署（香港時間） | 部署編號 | 原始 Pages 包編號 |
| --- | --- | --- | ---: | ---: |
| 本次封存 | `site-2026-11-19-four-chapter-covers` | 2026-11-19 11:01:34 | 7902752761 | 14493583887 |
| 更新前原版 | `site-2026-11-19-before-cover-ruhua` | 2026-11-18 22:14:53 | 7885749839 | 14434952111 |

本次固定標記對應 `23a4541646e8ca81b884110af0797c5f1b424a8b`；原版標記對應 `adbeee1fb9e957a4920d05741d23b065c9835938`。[本次成功部署](https://github.com/vincentttchan/chinese-wally/actions/runs/44448286370) · [原版成功部署](https://github.com/vincentttchan/chinese-wally/actions/runs/44321877439) · [GitHub Release 與附件](https://github.com/vincentttchan/chinese-wally/releases/tag/site-2026-11-19-four-chapter-covers)

## 維護基準

| 章節 | 教育部隸書主標直排字距 | 小印 |
| --- | ---: | --- |
| 簪花仕女圖 | 0.12 em | 崇羲篆體「入畫」 |
| 宮中鬧元宵 | 0.12 em | 崇羲篆體「入畫」，淡紙底 |
| 在人群中聽樂 | 0.06 em | 崇羲篆體「入畫」 |
| 洛水之間 | 0.16 em | 崇羲篆體「入畫」 |

使用 `public/fonts/chapter-cover-li-v2.css` 及共用 `public/fonts/chongxi/cover-seal-ruhua.png`。PNG 是用崇羲篆體原檔排印的透明圖，大小為 2,932 位元組，原字型檔與既有觀畫紀念印用途依原版保存。[教育部隸書來源與授權](../../public/fonts/MoeLI-credits.md) · [崇羲篆體來源與授權](../../public/fonts/chongxi/CREDITS.md)

在主站維護時，以畫坊實際顯示的四章封面作對照。保留既有封面構圖、印框、朱色與位置，以及首頁、遊戲內容和旅程設定。日後改動另立版本，保留兩個固定標記、原始部署包及各章既有封存。

## 上線核對

沿用 2026-11-19 部署後的正式站核對紀錄。Chrome 390 × 844 視窗中，四章印文均為「入畫」，都載入相同的 2,932 位元組 PNG，封面無完整崇羲篆體載入請求。只有宮中小印套用淡紙底。四章主標的實際字距分別為 0.12、0.12、0.06、0.16 em。畫坊首頁 HTML 與遊戲共用樣式與更新前部署相同。封存期間只核對附件與部署資料。

## 還原

1. 從 Release 下載需要的網站包。本次封存為 `github-pages-artifact.zip`，原版為 `original-github-pages-artifact.zip`。下載 `SHA256SUMS`，比對所選包的 SHA-256。兩個 ZIP 均為各自成功部署的原始 Actions 附件。
2. 在空白目錄解開所選 ZIP，再解開其中的 `artifact.tar`。本次使用 `website-file-manifest.json`，原版使用 `original-website-file-manifest.json`，可按相對路徑、檔案大小及 SHA-256 逐檔核對。以 HTTP 打開時應保留 `/chinese-wally/` 路徑和網站的完整目錄結構。
3. 維護原始碼時，按需要取出上述固定標記。建置環境為 Node.js 24，使用 `npm ci` 及 `npm run build`，輸出位於 `dist/`。需要逐位元還原已上線成品時，以原始部署包為準。
