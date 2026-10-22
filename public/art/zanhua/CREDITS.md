# 《簪花仕女圖》代表效果素材

取得日期：2026-10-20。遼寧省博物館藏，傳周昉作；本篇圖像為傳世作品的公開複製圖，非本專案重繪，亦非館方直接交付的數位母檔。

- `full-scroll.jpg`：6455×1378像素，保留原始裝裱邊及來源比例。與研究下載原檔內容相同。
- [來源說明頁](https://commons.wikimedia.org/wiki/File:Zhou_Fang._Court_Ladies_Wearing_Flowered_Headdresses._(46x180)_Liaoning_Provincial_Museum,_Shenyang..jpg)。平台將此檔標示為PD-Art／Public Domain Mark；該標示不是館方另行提供的授權書。
- 原始檔SHA-256：`cc8956b101f60880d1c0736d56e0f988667ba08983d5b526940da56d198de909`，對應本專案 `output/art-research/zanhua-shinv/inventory.json` 的下載記錄。
- `portraits/P1.png`：原圖矩形[5520,220,5730,420]，210×200像素。
- `portraits/P4.png`：原圖矩形[3005,200,3210,420]，205×220像素。
- `portraits/P6.png`：原圖矩形[1180,200,1435,450]，255×250像素。
- 樣貌提示在瀏覽器以CSS輪廓裁邊去除大部分底色；原PNG與原圖仍保留原始像素。未以生成或銳化方式修改眉眼、面形、衣紋或手中物。
- 尋人框、提示卡底、人物對白框、題箋絹紙、按鈕及手繪圖示，均沿用《宮中鬧元宵》現行樣式與素材；新增CSS只處理本章原畫裁圖的幾何尺寸。
- 本頁是獨立代表效果預覽。本章獨立配樂尚未加入，不借用其他章節的配樂冒充完成。

## 2026-10-20 v0.5：完整髮型及收藏圖樣

使用者要求去背後保留髮型。先前只含面部的PNG及CSS裁邊不再用作提示人像，舊檔留作歷程。

- `portraits/P1-head-v2.png`、`P4-head-v2.png`、`P6-head-v2.png`：內建image_gen以完整頭部原畫裁圖製作的透明樣貌輔助圖，保留髮髻、髮飾、頭花、面向與頸部。工具重新處理部分輪廓、色彩與紋理，故標示「樣貌摹繪，原畫為準」，不稱為未改動原畫像素。只用於提示，不替換主場景。
- 輸入原圖裁框：P1=[5380,0,5875,465]；P4=[2890,0,3350,465]；P6=[1050,0,1550,510]，格式[x0,y0,x1,y1]，以6455×1378原圖為準。
- `collectibles/atlas-v1.png`：1254×1254透明圖集；簪花、長柄扇、小犬、鶴四種收藏插畫，由內建image_gen參考完整原畫製作。僅作遊戲收藏圖樣；動物姿態、裝飾組合及設色不當作原畫證據。物件回看始終使用原畫及首次發現的位置。
- 來源原畫及平台再利用標示見上文。提示詞、生成檔來源與限制保存於 `docs/art/zanhua/portrait-and-collectibles-v0.5.md`。

## v0.6 逗犬演繹

`animation/dog-background-v1.png`、`animation/dog-layer-v1.png`：2026-10-20以內建 image_gen 依原畫局部製作的背景補層與透明犬層。僅供短暫遊戲演繹，並非原畫修復、館方素材或歷史動作復原。播放後恢復完整未改動原畫。生成提示、映射、色差處理與已知細節差異見 `docs/art/zanhua/dog-animation-v0.6.md`。

## v0.7 持花舒袖與斜首簪花

`animation/P4-plate-v1.png`、`animation/P6-plate-v1.png`：2026-10-20使用內建 image_gen，依P4/P6原尺寸局部製作的動畫背景補層。只在移動人物後露出的輪廓範圍短暫顯示，並非館方素材、文物修復或歷史動作復原。

成品移動的手袖、面貌、髮髻及花飾，均直接顯示未改動 `full-scroll.jpg` 的原畫像素；沒有用AI摹繪替代原畫人物。生成的透明手袖及頭頸層因改變細節而棄用，保存在研究輸出中。完整提示、原檔、輪廓映射與已知限制見 `docs/art/zanhua/figure-animation-v0.7.md` 及其提示JSON。播放後移除全部動畫層並恢復原畫。

## v0.8 全人物演繹

`animation/P1-full-background-v1.png`、`animation/P4-full-background-v1.png`、`animation/P6-full-background-v1.png`：2026-10-20內建 image_gen 依三位原畫全身局部製作的背景補層。僅在原畫人物微動後露出的範圍顯示；人物、髮型、衣紋仍使用未改動原畫像素。全身動作為遊戲演繹，不是文物修復或歷史動作復原。完整提示、檔案及限制見 `docs/art/zanhua/full-figure-animation-v0.8.md` 與提示JSON；原畫及生成原檔保留。

## v0.9 逗犬的長柄補層

`animation/P1-lure-clean-v1.png`：2026-10-20內建image_gen依P1原畫局部移除長柄與垂穗所製的967×1626補圖；只在長柄／穗原位的窄遮罩顯示，補足動作後露出的衣料及絹地。生成圖的人像不作人物層。人物及長柄仍使用原畫像素，犬沿用v0.6的生成動畫層，播放後恢復原畫。用途、提示及限制見 `docs/art/zanhua/dog-figure-animation-v0.9.md` 與同名prompts.json；不屬館方素材、文物修復或歷史動作復原。

## v0.10 逗犬的表情演繹

`animation/P1-attentive-v1.png`、`animation/P1-delighted-v1.png`：2026-10-20內建image_gen依原畫P1頭部裁圖製作的兩個1223×1286表情參考層。演繹時只在眉眼及嘴角的柔邊遮罩中顯示，臉型、髮型、衣服等其他部分維持原畫像素。表情是遊戲虛構演繹，不是原畫證據、館方修復或人物心理史實；播放後恢復原畫。提示、輸入、生成原檔與使用範圍見 `docs/art/zanhua/dog-expression-v0.10.md` 及同名prompts.json。

## v0.11 持花與斜首的表情演繹

`animation/P4-attentive-v1.png`、`animation/P4-soft-smile-v1.png`（各1211×1299），以及`animation/P6-curious-v1.png`、`animation/P6-reflective-v1.png`（各1254×1254）：2026-10-20使用內建image_gen依原畫各人的頭部裁圖製作。僅在眉眼、嘴角柔邊遮罩中顯示，其他生成區域不作人物層。表情與情節為遊戲編排，不是原畫證據、館方素材、文物修復或人物心理史實；播放後恢復原畫。完整提示、原始檔、映射及限制見 `docs/art/zanhua/court-expressions-v0.11.md` 及同名prompts.json。

## v0.15 原畫補位與歷史內容

2026-10-21。依使用者指出的動畫色差，現行三位人物補位改用`full-scroll.jpg`的鄰近絹地；小犬亦改為原畫輪廓像素。前述全身生成背景、犬生成層／犬背景及長柄生成補圖保留作歷程，已不在現行播放中顯示。頭部局部表情仍沿用v0.10/v0.11衍生素材。原圖本身未重繪；鄰近絹地取樣只為短暫遊戲合成，不作原畫證據或文物修復。

移除逐動作字幕，演繹性質改由引言、重播入口、語意標籤及畫作小記交代。歷史來源、互動內容、取樣方式與實際檢視範圍見`docs/chapters/zanhua-context-and-motion-v0.15.md`。沒有新增生成圖片。

## v0.16 犬的連續輪廓

2026-10-21。修正原畫犬的SVG剪裁輪廓，以同一連續輪廓處理原位補底與全犬移動，納入頭頂、吻、下頜及頸部。仍使用`full-scroll.jpg`原畫像素，未新增生成圖片；合成只用於遊戲演繹。詳見`docs/chapters/zanhua-dialogue-and-dog-v0.16.md`。

## v0.22 完整髮髻造型圖

- `studies/P6-coiffure-study-v1.png`：內建image_gen參照斜首女子的完整頭部裁片製作，真正透明背景，保留髮髻、簪花及髮飾，去除面孔與衣物。屬「造型摹繪，細節以原畫為準」，部分細節經生成補繪，不視作歷史器物復原或未改動畫素。
- `studies/P6-head-original.png`：既有原畫450×450頭部裁片副本，用於並排對照，原圖來源沿用本文件上文。
- 提示詞、生成原檔及實際檢視：`docs/art/zanhua/coiffure-study-v0.22.md`。

## 衣飾完整造型摹繪 v0.27（2026-10-21）

- `studies/P1-dress-study-v1.png`（968×1625）及 `studies/P4-dress-study-v1.png`（937×1678）：以既有 P1／P4 原畫局部為參考，由 OpenAI 內建 image_gen 生成的透明全身圖解。僅用於理解衣飾層次，並非原畫提取或歷史服裝復原；細紋、色彩與面孔均含生成演繹。
- `studies/P1-dress-original.png`、`studies/P4-dress-original.png`：既有 `output/art-research/zanhua-shinv/crops/P1-context-native.png`、`P4-context-native.png` 的未修改副本。原畫來源及權利沿用本檔既有記錄。
- 完整提示詞保存於 `docs/art/zanhua/P1-dress-study-v1.prompt.txt` 與 `P4-dress-study-v1.prompt.txt`；未用 CLI/API key。

## 衣飾分層圖樣 v0.28（2026-10-21）

- `studies/P1-dress-layers-v1.png`：1942×809 RGBA；`studies/P4-dress-layers-v1.png`：1774×887 RGBA。內建 image_gen 各生成一張透明圖集，分含長裙、寬袖外罩衣及披帛，以 v0.27 完整造型摹繪為參考；程式按 SVG 裁取區域展示，不修改生成像素。
- 遮擋部分、衣物完整結構、繫帶與紋飾均含補繪，只作衣飾層次示意，不能當成歷史實物復原。原畫對照不作修改。
- 提示詞：`docs/art/zanhua/P1-dress-layers-v1.prompt.txt`、`P4-dress-layers-v1.prompt.txt`。

## 髮型分層圖樣 v0.29（2026-10-21）

- `studies/P6-coiffure-layers-v1.png`：2172×724，含alpha。以既有完整髮型摹繪為參考，由內建 image_gen 生成高髻、簪花及金色細飾的透明圖集。完整提示詞：`docs/art/zanhua/P6-coiffure-layers-v1.prompt.txt`。
- 原生成檔：`/Users/vincentttchan99/.codex/generated_images/01a15750-1b3b-7cf1-96bf-91ee0c695108/exec-2d9acfb1-863f-4a83-8480-d9bac9b1b43a.png`。以SVG區域展示，未修改生成像素。
- 圖集只作部件形態及位置關係示意；遮擋處、紋樣、飾物數目與形狀含生成補繪，不能作為義髻構造或古代實物復原。原畫對照與資料來源沿用既有記錄。

### v0.31 沿獨立美術圖描邊（2026-10-21）

沿用 P1、P4 的 dress-layers-v1 及 P6 的 coiffure-layers-v1 三張透明美術圖，不增加歷史器物復原的主張。九組輪廓由 `scripts/art/trace-zanhua-alpha.py` 讀取透明度邊緣生成，輸出 `src/game/zanhuaArtEdges.ts`；P4 先套用與展示相同的分圖遮罩。描線與圖像共用圖集座標，不使用點擊區的概略多邊形當作物件輪廓。門檻112、約2px取樣，小於12取樣像素的碎屑略去；屬展示用輪廓，並非文物測繪資料。

### v0.32 細部取邊更新（2026-10-21）

P4、P6透明美術圖改用原尺寸取邊（alpha門檻112、簡化容許0.65原圖像素）。非金飾略去48平方像素以下碎屑；金飾門檻12平方像素，保留較小的空隙及細部。P1維持原設定。仍由同一取邊腳本生成，沒有另行生成或重畫圖像。

## v0.35 原位完整造型摹繪（2026-10-22）
- `studies/P6-full-study-v1.png`：OpenAI imagegen 生成，透明底全身造型；依據原畫 P6-context-native 及現有 P6-coiffure-study-v1 的畫風。提示保存於 `docs/art/zanhua/P6-full-study-v1.prompt.txt`。
- 用途：原位教學摹繪，不是原畫復原。被遮擋衣紋、鶴紋與髮飾含示意補繪，僅供分層理解；始終提供原畫對照。
- 侍女／長柄扇動畫：使用 full-scroll.jpg 的原畫像素、手工局部輪廓及相連握柄支點，一次性克制演繹，非史實動作紀錄。


## v0.36 摹繪部件聚焦與閱讀構圖（2026-10-22）
- 沿用 P1/P4 衣飾、P6 全身及既有部件 atlas；未新生成或修改 raster 圖檔。局部高光與抽出動畫以同一張摹繪的遮罩副本繪製，再淡接既有獨立分圖。
- 高束裙腰與曳地裙襬合為同一件「高束長裙」互動。可見部分的遮罩與整件衣物補繪分圖有區別，文字說明中段被外罩衣物遮擋。
- 完整摹繪移入左側閱讀區時，暫以既有 `animation/P1-full-background-v1.png`、`P4-full-background-v1.png`、`P6-full-background-v1.png` 隱去原人物；原畫絹面樣本估算通道比例，只在 SVG 顯示時調色及羽化。該背景是生成教學補層，非文物修復，原畫對照／關閉細看時不顯示。

## 髮飾聚焦遮罩校準（2026-10-22）
- `studies/P6-high-hair-focus-v2.png`、`P6-hair-flower-focus-v2.png`、`P6-hair-ornament-focus-v2.png`：由既有 `P6-full-study-v1.png` 的像素、手工區域與色彩條件衍生的白色透明遮罩，僅供介面聚焦使用。重製腳本：`scripts/art/trace-zanhua-p6-coiffure.py`；對應座標：`src/game/zanhuaP6CoiffureContours.ts`。
- 未重畫或改動原畫、全身摹繪及分圖。金飾遮罩跟隨摹繪中的金色細線，不能作為原物材質或器形的歷史證據。
- 侍女演繹擴大既有原畫像素層的扇子、手臂、身體與頭部轉動幅度，握柄仍共用支點；仍屬遊戲演繹。
