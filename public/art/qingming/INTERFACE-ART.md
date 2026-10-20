# 清明章節書冊與收藏美術

2026-10-15。以下為介面及收藏摹繪，不是張擇端原畫或歷史復原。原畫全卷、分塊及來源檔沿用 `SOURCE.md`。

| 素材 | 來源／用途 |
|---|---|
| `book-closed.png` | 已確認 v5.5 代表稿的手繪薄冊，作翻書入口 |
| `book-page-blank.png` | 由已確認書頁美術移除固定文字，供不同卷次與篇名共用 |
| `bridge-boat-v55.png` | v5.5 已確認的橋、船與人物關係小景；收藏摹繪，非原畫證據或橋樑工程復原 |
| `paper-shop-study.png` | 已確認的紙馬鋪收藏摹繪；原畫陳列另有實際裁圖對照 |

原代表稿素材及提示：`output/art-direction/qingming-reading-journal-v5/prompts-v55.md`。四個檔案均已複製到正式章節素材目錄，不依賴生成工具的暫存路徑。

## 通用空白書頁的新增提示

使用內建 imagegen 編輯，`transparent_background=true`。編輯目標為代表稿的 `book-page-cutout-v55.png`；原輸出保留，複製至正式目錄。

> Use case: precise-object-edit. Edit this exact transparent cutout hand-painted book page. Remove ONLY all black header text from upper quarter: 書中記載, 東京夢華錄, 孟元老·卷一〈河道〉. Fill the removed lettering areas seamlessly with exactly matching aged cream paper texture. Preserve ALL other book contours, paper, shape, texture, warm muted colors, thin horizontal footer line, red cloth bookmark, bottom curled corner, stacked leaves, 1024x1536 composition and transparent outside background. Entire inside page must be opaque. No text, letters, symbols, drawings or ruling added. This will be a reusable book art background; accurate text will be rendered separately by the game.

原輸出：`/Users/vincentttchan99/.codex/generated_images/01a1334a-8a96-75c0-882c-d9c1e86547f9/exec-83611a71-7608-40b9-a159-b911d33444af.png`。

書名、卷次、篇名及原文由程式排印，保留引文標點與省略。史料不由生成圖片辨認或推定。其餘四類收藏圖樣本輪沿用既有素材，未宣稱已重繪。
