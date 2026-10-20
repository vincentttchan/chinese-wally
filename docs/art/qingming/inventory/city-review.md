# 清明上河圖：左側城市與城門段人物／物件盤點

2026-10-13。範圍：全圖像素 x=0–11999、y=0–1799；原始 production `tile-01.jpg`、`tile-02.jpg`、`tile-03.jpg`，每幅 4000×1800。採人物／物件中心點分派段落，跨段輪廓保留完整座標。這是原畫視讀盤點，人物回應與物件提示皆為遊戲虛構文案，不是歷史人物語錄。

影像來源沿用本章原始 Wikimedia 影像 [Alongtheriver QingMing](https://commons.wikimedia.org/wiki/File:Alongtheriver_QingMing.jpg)。原圖未用生成影像補細節。裁圖只是剪裁／必要的近看放大，未修改原畫內容。

## 完成的視讀

逐一開啟十二幅 1000 像素寬分段裁圖（每幅右側最多重疊 120 像素），逐人手動記錄，不按格點自動產生人物。另近裁醫藥鋪、左側門內、酒樓欄後、遠景轎隊、下方小屋等密集／遮擋位置。近裁排除了兩個最初容易誤認的形狀：門側帷幔繫結、酒樓右翼懸掛彩飾；並將挑籃者的頭與身重新合成單一人物。

完成 **280 個人物條目：278 可互動、2 排除／待核**；其中 **7 個人物已有 existingId**，由整合端沿用現有演員而不是新增副本。另有 **86 個物件條目**，包括招牌、店前陳列、桌案攤位、轎子、輪車、拉車與負載牲口。人物每條均有三句短回應；每個物件亦有三句觀察提示。人物與物件各用自己的 bounds，物件場景框不代替人物框。

## 分段與標註

紅框為人物、藍框為物件；排除人物使用虛線。SVG 下層引用同目錄原畫裁圖。標號對應 JSON id 末三位；既有演員改顯 existingId。下列 peopleCount 採 1000 像素責任段中心點計數，因此重疊不重複計數。

| 裁段 | 責任 x | 人物數 | 標註 |
|---|---:|---:|---|
| city-1-0 | 0–999 | 0 | [SVG](city/1-0-review.svg) |
| city-1-1 | 1000–1999 | 17 | [SVG](city/1-1-review.svg) |
| city-1-2 | 2000–2999 | 44 | [SVG](city/1-2-review.svg) |
| city-1-3 | 3000–3999 | 59 | [SVG](city/1-3-review.svg) |
| city-2-0 | 4000–4999 | 31 | [SVG](city/2-0-review.svg) |
| city-2-1 | 5000–5999 | 26 | [SVG](city/2-1-review.svg) |
| city-2-2 | 6000–6999 | 14 | [SVG](city/2-2-review.svg) |
| city-2-3 | 7000–7999 | 11 | [SVG](city/2-3-review.svg) |
| city-3-0 | 8000–8999 | 21 | [SVG](city/3-0-review.svg) |
| city-3-1 | 9000–9999 | 21 | [SVG](city/3-1-review.svg) |
| city-3-2 | 10000–10999 | 24 | [SVG](city/3-2-review.svg) |
| city-3-3 | 11000–11999 | 12 | [SVG](city/3-3-review.svg) |

## 既有主線對接

人物沿用 person-medicine、person-incense、person-lodging、person-wine 及 neighbour-medicine-standing、neighbour-incense-door、neighbour-wine-robed。物件沿用 medicine-name、medicine-advertisement、incense-sign、incense-goods、lodging-sign、wine-sign、wine-decoration、landmark-gate。existingId 保留既有主線用途；新盤點框只提供單人視覺核對，不能另生成同人副本。

此段沒有紙馬鋪或虹橋的實例。medicine-shop、incense-shop、lodging-shop、wine-shop 僅用於主線已確認的同一店面及其確定相連的桌案；其他傘棚、掛牌、桌案仍為觀察提示，不憑器物或遮棚猜店種。

## 已知限制／未確定處

- **前景樹後腿部殘影**：頭與主要輪廓被樹葉遮擋，已列 excluded，不建立互動框。
- **右下桌左側淺色殘影**：近裁仍不能確定是不是人物，已列 excluded 待核；同桌中央可見坐姿人物則有獨立互動框。
- 字小或被屋簷、樹木遮去的招牌都明記「文字未辨清／釋讀待核」，沒有冒充確定店名。故宮講壇提到十千脚店，但本段未完成可靠圖文定位，不把任何未知招牌改稱十千脚店。
- 遠景人物保留原畫真正可見的細小身影；只能辨動作大類，沒有補寫臉貌或人物身份。
- bounds 為依原畫手動框定的像素矩形，密集人群仍有衣袖／遮擋重疊；整合時需以頭部和較小框優先，避免大框吞掉鄰人與器物。可點擊小人影需要玩家先放大。
- 只執行了這次要求的原畫視讀及盤點代表標註檢視；沒有新增或執行測試、瀏覽器試玩、裝置驗證、歷史文字全文校勘。

此次僅交付盤點 JSON、裁圖與標註，未修改任何遊戲程式或 UI。

## 根代理合併後現況

根代理後續查看樹後衣腿候選276，獨立身形可定位，已啟用；279小個子左界收窄保護主線坐者臉部。現行280位置：279互動、1待核。现行 bounds／status 以 coverage.json 與 overlays 的54段再生成標记為準，原分段SVG保留為視讀歷程。
