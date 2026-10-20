# 《在人群中聽樂》介面統一 v0.6

2026-10-12。使用者明確指定：《宮中鬧元宵》是整個遊戲的標準，整章按鈕及設計須對齊。

## 差異來源

v0.5 只把頁面改成滿版，仍讀入舊效果稿 `common.css`、`effects.css`、`art-ui.css`、`journal-ui.css` 及舊遊玩覆蓋樣式。舊紙紋／朱紅按鈕與字型規則繼續生效，工具、題箋、對白、見聞冊也沒有完整沿用現行元宵設計。

v0.6 完全排除這些舊樣式，直接讀入主網站和現行元宵 CSS，並用同一套 DOM 類別與原有手繪圖示。這是源碼及素材整合，尚未作實際瀏覽器視覺驗收。

## 沿用對照

| 章節介面 | 《宮中鬧元宵》標準來源 | 本輪處理 |
|---|---|---|
| 字體、基礎色、引言與通用按鈕 | `src/styles.css` | 直接讀入；正文 Noto Serif TC／宋體備用，對白及冊頁使用本地 LXGW WenKai TC |
| 凝神光區 | `src/styles.css` 的 `observation-light` | 沿用原有柔邊灰階遮罩及光區，移除效果稿的硬邊彩色裁切圈 |
| 右上凝神、全螢幕與操作選單 | `src/components/ArtIcons.tsx`、`src/lantern.css` | 凝神文字膠囊＋圓形手繪圖示；移除全螢幕／更多文字按鈕 |
| 底部見聞冊、提示、原畫導覽 | `src/lantern.css`、`src/lantern-journal.css` | 同款帶圖示按鈕及縮圖導覽；縮放收入操作選單 |
| 尋人卡及分層提示 | `src/lantern-search-hud.css` | 同款尋人紙框、頭像入口、進度；提示視窗沿用樣貌／文字／回畫中／再給提示結構 |
| 原畫觀察題箋 | `src/lantern-observation.css` | 同款絹紙、正文及分隔線文字操作；位置按本章人物坐標調整 |
| 人物對白 | `src/lantern-journal.css` | 同款墨框、7px 尖角、短句與繼續動作；沿用原生坐標避讓規則 |
| 見聞冊總覽／詳情 | `src/lantern-field-journal.css` | 同款漸隱紙面、標題、印記、關冊、返回長卷及畫中位置／繼續閱讀操作；四類插圖維持兩欄 |
| 通知與畫中收尾 | `src/lantern-feedback.css`、`src/lantern.css` | 同款通知；收尾用現行畫中短文及文字操作，不加入已刪除的「細看畫法」 |
| 主應用等待／重試畫面 | `src/components/KangquGame.tsx` | 改用現行 `scene-status`、`small-button`，移除章節自訂等待介面 |

五張共用圖像直接複製原檔：`painted-icons.png`、`reading-paper.png`、`lantern-search-frame-v1.png`、`lantern-silk-note-v1.png`、`lantern-dialogue-ink-frame-v1.png`。圖示格號直接讀取 `ArtIcons.tsx`，不另畫或以文字符號代替既有圖示。

《康衢駢慶》的原畫、三張人物樣貌及四張收藏插圖沿用。人物、收藏數量、命題及原畫幾何按本畫決定；不複製元宵人物或固定六類收藏。窄屏觀察時預留上方原畫空間，題箋沿用標準下方位置。本章沒有已製作的音樂功能，不添加無效音樂按鈕。

## 可維護來源

- `output/art-direction/wanshou-third-scroll/v0.6/build-artifacts.py` 直接讀取上述 CSS 及圖示格號；`play.css` 只保留原畫尺寸／凝神、熱區、章節圖像及必要空間適配。
- `play.js` 保存主線、熱區、收藏及鏡頭；`interface.js` 用標準介面類別呈現章節資料。
- `scripts/package-kangqu-chapter.py` 先組裝來源，再更新 `public/chapters/kangqu-listening/index.html` 與 18 張圖像。
- `ui-source-manifest.json` 保存標準來源路徑及 SHA，亦複製到 public 的 `data/`。
- 主應用仍用獨立文件隔離章節狀態；本輪共用的是實際樣式來源、圖示及素材，不代表改成直接掛載元宵 React 元件。
- 標準同步記入 `AGENTS.md`、章節標準及模板。

## 完成範圍

已完成源碼對照、介面類別與狀態修改、標準素材打包及規範記錄。未修改已完成的元宵章節介面或內容，未生成新的美術圖。

本輪未新增或執行測試、應用建置、伺服器、瀏覽器／DOM／遊戲操作或裝置試玩。沒有實際排版截圖，不能將字型載入、題箋避讓、手機版面、按鈕或全章遊玩標為驗收通過。此前的純坐標診斷不作本輪介面通過依據。
