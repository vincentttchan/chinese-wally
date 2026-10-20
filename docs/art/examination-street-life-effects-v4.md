# 榜下尋人・見聞冊重設效果稿 v0.4

日期：2026-10-11。使用者拒絕v2見聞冊後，確認重設方向：原畫與淡絹閱讀區銜接、四件收藏兩欄兩列、總覽與詳情分頁、詳情聚焦器物、輕巧文字操作。本輪製作獨立見聞冊效果稿，未修改正式遊戲或其他章節。

## 檔案與入口

- 頁面：`output/art-direction/examination-street-life-v4/review.html`。
- 樣式與示意操作：同目錄 `journal.css`、`journal.js`。
- [收藏總覽](http://127.0.0.1:5184/output/art-direction/examination-street-life-v4/review.html?view=journal)。
- [茶具詳情](http://127.0.0.1:5184/output/art-direction/examination-street-life-v4/review.html?view=journal&mode=detail&item=tea)。
- [手機框架](http://127.0.0.1:5184/output/art-direction/examination-street-life-v4/review.html?view=journal&size=phone)。
- 靜態服務沿用 `python3 output/art-direction/examination-street-life-v1/serve_preview.py`。

## 版面與文案

桌面以場景在左、閱讀區在右呈現，淡絹面在文字開始前達到不透明；不使用完整題箋框或大外框。手機場景在上、閱讀區在下。四件圖樣按兩欄兩列排列，已收下兩件用色彩與「已收下」小字印記表示；未發現兩件用淡墨及明確狀態文字表示。

總覽文案：「把沿街看見的細節，收進自己的見聞冊。」；頁底：「點選已收下的圖樣，回看畫中的發現。」

| 類別 | 效果稿狀態 | 詳情／提示 |
|---|---|---|
| 紙筆 | 已收下 | 首次發現・榜牆旁。「紙放在桌上，他正低頭寫字。」「看榜的人讀消息，抄寫的人把消息記下來。」 |
| 茶具 | 已收下 | 首次發現・茶攤。「杯壺擺在桌上，旁邊有人坐着。」「歇腳、喝茶，也是一條街上的日常。」 |
| 隨身箱 | 尚未發現 | 留意出門的人手中帶着甚麼。 |
| 貨籃 | 尚未發現 | 留意提拿、搬運或擺放的竹籃。 |

詳情頁展示收藏摹繪、首次發現地點、一句觀察及短解說，場景在旁邊保留。回看發現處暫時收起冊區，展示完整既有局部；返回時回到原詳情。合冊與回看都只是本頁示意，未實作正式遊戲鏡頭、縮放、存檔或動畫。收藏2／4為固定狀態；未發現圖樣只顯示提示，不能解鎖。全部文字保持HTML活字。

## 美術與來源

新素材使用內建 `image_gen.imagegen` 分四次生成，每次一件透明背景收藏小圖。提示全文在v4的 `prompts/paper.txt`、`tea.txt`、`case.txt`、`basket.txt`。四件均為1254×1254 PNG，已讀取alpha資訊並保留透明背景。

| 工作區素材（v4/assets/） | 參考與用途 | 原始生成檔名 |
|---|---|---|
| paper-v1.png | `public/art/hd/board.png`；抄寫桌上的紙筆，用作收藏摹繪 | exec-28481859-27ee-4464-bb3a-ea030db76558.png |
| tea-v1.png | `public/art/hd/tea.png`；茶桌上的杯壺，用作收藏摹繪 | exec-ce10ab34-aaef-407a-8b46-25e200dc9b6f.png |
| case-v1.png | `public/art/hd/board.png`；畫中藍色束箱，用作隨身箱類別圖樣 | exec-a5c625ed-b050-4c3c-a847-77d0d04e163f.png |
| basket-v1.png | `public/art/hd/board.png`；畫中竹籃，用作貨籃類別圖樣 | exec-660ea673-a2bf-44fa-870e-d43f7ef48b26.png |

原始生成檔所在目錄：`/Users/vincentttchan99/.codex/generated_images/01a119a9-10fb-7df0-adcb-f9a6235ebcf3/`。頁面只引用工作區副本。

四件是依參考製作的生成小圖，形狀、材質筆觸與尺寸是美術演繹，不宣稱逐像素取自場景；箱內物品與籃中具體貨物未作判定。畫面標示「原創虛構章節・圖樣為收藏摹繪」。正式採用前仍須核對各類所有實例與代表圖樣。

紙絹紋理為v2 `paper-panel-v1.png` 的副本 `paper-texture-source-v1.png`；CSS僅展示中央紋理，外框不進入冊區，未修改圖檔。參考方向來自 `docs/art/lantern-journal-overview-v1.md` 及已確認總覽圖；未更動元宵見聞冊。

標題／名稱：Songti TC、Noto Serif TC、serif本機備用。對白式補充及操作：既有 `public/fonts/LXGWWenKaiTC-Regular.ttf`，以WenKai載入。正文20px、主要操作16px，手機保持正文大小。

## 已完成檢視與限制

已查看榜牆、茶攤與橋邊來源圖片、四張生成結果；確認小圖為完整物件、無生成文字，並記錄尺寸與alpha。已完成效果稿HTML、CSS與示意狀態的製作檢視。獨立靜態服務重新啟動後，頁面、茶具素材與榜牆場景的HTTP回應均為200；此為預覽交付確認，不代表瀏覽器畫面或互動驗收。

尚未完成瀏覽器實際渲染、手機裝置檢視或操作驗收。可切換390×844手機框架不代表裝置檢查完成。圖樣與場景的一致性、閱讀區比例仍待使用者查看效果稿。

本輪未新增或執行測試／建置；未接入正式遊戲、未部署。正式人物與全部重複收藏盤點、實際存檔及動畫等工作仍待後續。v3整張文字美術收尾仍維持撤回，v4只重設見聞冊。
