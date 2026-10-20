# 榜下尋人・介面美術效果稿 v0.2

日期：2026-10-11。使用者評價上一版「暫時效果理想」，要求改善設計與按鈕美術。保留五種代表畫面、文案與場景位置，製作獨立美術修訂稿；整章尚未定稿。

後續紀錄：使用者曾提出將收尾固定文字與印章改為美術圖，看到v3生成結果後表示「不能接受，回到上一版本」。v3停止採用，目前代表效果恢復v2；這不代表v2已整體定稿。

2026-10-11後續回覆：使用者提供v2見聞冊截圖並表示「這個設計不能接受」。v2見聞冊明確未獲接受。截圖顯示題箋紙面邊框被用於整頁冊區、四個示意圖樣與正文混排、大幅茶攤人物裁圖；下一輪須重新討論冊頁構成。基準依據為已確認元宵見聞冊總覽及現行`lantern-field-journal.css`，沿用總覽／單件詳情分頁、原画與安靜絹色閱讀區並置、收藏摹繪與輕操作的原則。上述檢視是設計診斷，不代表已完成新版或裝置驗收。

## 入口與檔案

- [畫中收尾預覽](http://127.0.0.1:5184/output/art-direction/examination-street-life-v2/review.html?view=ending)。同頁可切換尋人卡、人物對白、觀察題箋、見聞冊及手機框架。
- 頁面：`output/art-direction/examination-street-life-v2/review.html`；美術樣式：同目錄 `art-skin.css`。
- 靜態預覽使用既有 `python3 output/art-direction/examination-street-life-v1/serve_preview.py`，服務整個工作區的效果稿與本地素材。v1保存作設計歷程。

## 美術調整

- 尋人卡、題箋及完成按語使用暖紙底、細紙紋、淡墨角線；正文保持活字。
- 人物對白使用基準章節的空白淡絹框副本，尖角沿用原示意定位。
- 「繼續逛逛」「回到橋邊」使用朱線紙條；次要操作使用淡墨紙條；「再尋一次」使用較輕的底線入口。全部按鈕文字為HTML，保留焦點與點擊熱區。
- 見聞冊加入紙面美術底圖，仍保留原畫與閱讀區並置。收藏圖樣仍為v1的向量示意，並非定稿收藏素材。
- CSS九宮格縮放框緣，中心填滿，以應對不同文字高度；未改寫既有場景圖片。

## 素材記錄

生成方式：內建 `image_gen.imagegen`，2026-10-11。兩次分別生成一個空白底圖。參考 `public/art/ui/lantern-search-frame-v1.png` 的紙色與線條；參考用途為介面風格，未修改基準章節素材。

| 檔案（v2/assets/） | 尺寸／透明 | 用途／來源 |
|---|---|---|
| paper-panel-v1.png | 1254×1254，alpha | 新生成空白紙面，用於題箋、卡、冊頁及次要操作 |
| action-slip-v1.png | 2172×724，alpha | 新生成朱線空白紙條，用於主要操作 |
| dialogue-paper-reference-v1.png | 1774×887，alpha | `public/art/ui/lantern-dialogue-ink-frame-v1.png` 的未修改副本 |

完整生成提示保存在v2目錄的 `panel-prompt.txt`、`button-prompt.txt`。原始生成檔分別為：

- `/Users/vincentttchan99/.codex/generated_images/01a119a9-10fb-7df0-adcb-f9a6235ebcf3/exec-c2017767-292d-4e4a-adae-c6d8ad1aeac8.png`
- `/Users/vincentttchan99/.codex/generated_images/01a119a9-10fb-7df0-adcb-f9a6235ebcf3/exec-ff965586-ba1b-4605-ab43-fca5700b5b50.png`

消費頁面只引用工作區副本。畫面繼續清楚標示「原創虛構章節」，人物對白為遊戲創作。

## 已完成檢視與限制

已查看基準空白美術框與兩張生成結果：紙面留白、無生成文字、框線與朱色均可用作效果稿底圖。檔案尺寸與alpha資訊已讀取。

已完成HTML、CSS與素材引用的製作檢視，靜態頁面HTTP回應為200。本輪未執行測試或建置；未完成瀏覽器實際渲染與手機裝置檢視，因此九宮格邊緣、細字對比及不同高度的視覺效果仍待使用者查看代表頁面。仍為獨立效果稿，未接入正式遊戲。正式人物／重複物件盤點、收藏美術及動畫樣段等限制沿用v1。
