# 洛水之間：素材目錄說明

現行內容及用途以 [章節文件](../../../docs/chapters/luoshen.md) 與 [素材來源／使用條件](../../../docs/chapters/luoshen-release-sources-2026-10-19.md) 為準（2026-10-19）。

- full-scroll.jpg、detail-0.jpg…detail-9.jpg：北京故宮博物院藏《洛神賦圖卷（宋摹）》之原畫畫心，來源 https://www.dpm.org.cn/bigimg/737/0 。裁切、縮小及 JPEG 編碼，未生成或補畫。
- head-*-cutout.png：依原畫參考製作的透明樣貌摹繪，不作原畫證據。
- collection-*-cutout.png：五類透明收藏插畫。最終鳥形為單鳥象徵，雙鳥底色稿不屬現行素材。
- 原始 JPG 與製作 JSON 保留作對照、座標及提示詞追溯。

原畫及衍生素材的實際使用範圍仍待確認，目錄內沒有館方授權憑證；可下載或可供研究觀看不等同已取得互動遊戲、公開傳播或衍生用途的許可。館方流程：https://www.dpm.org.cn/bottom/apply_image 。正式使用與署名以實際許可為準。

2026-10-19 原位動畫示範增補：detail-8 原畫像素用作鳥身／翼層；生成補底另存於 ../animations/luoshen-birds/silk-plate-v1.png，只於雙鳥附近遮罩短暫顯示，結束即撤除，不屬原畫或既有 33 項資產快照。提示詞、尺寸與雜湊見 docs/art/luoshen-birds-animation-2026-10-19.json；方案及驗收見 docs/chapters/luoshen-animation-plan-2026-10-19.md。

同日精修後：現行雙鳥改為原圖像素連續變形，不使用上述生成補底。silk-plate-v1.png 僅保留為早期製作歷程；現行播放只讀未修改的 detail-8.jpg。整合與驗收見 docs/chapters/luoshen-birds-integration-2026-10-19.md。


2026-10-20 髮式比較：`hair-seat-study-v1.png`、`hair-first-study-v1.png` 是以本卷榻前／初見髮式及既有樣貌摹繪作參考，經內置 image_gen 製作的獨立透明髮式摹繪。它們有深墨髮束和雙環空隙，只放在現有小題箋內；不以白色描線覆蓋原畫。這是衍生觀察圖樣，不是直接抽取的未改原畫像素，也不是歷史髮式復原。提示詞、來源及雜湊見 `docs/art/luoshen/hair-studies-v1-2026-10-20.json`；原畫及衍生用途許可仍待確認。


2026-10-20 兩岸相對：`farewell-goddess-study-v1.png`、`farewell-cao-study-v1.png` 為依未改 `detail-4.jpg` 製作的透明半身姿態摹繪，使用內置 image_gen。神女以可見的髮髻、舉臂與衣袖作提示，曹植以冠髮、留鬚及收攏衣袖作提示；不重建被鳥形遮住的下半身，不替未核實的持物命名。它們只放在既有小題箋，完成後仍同看原畫中的兩人，原圖不疊描線或替換人物。提示詞、原檔、顯示裁框及雜湊見 `docs/art/luoshen/farewell-studies-v1-2026-10-20.json`。原畫與衍生用途許可仍待確認，沒有新取得館方授權。


2026-10-21 兩岸神女原位動畫：以已確認的 `farewell-goddess-study-v1.png` 製作分層摹繪 atlas 及局部生成補底，保存於 `public/art/animations/luoshen-farewell/`。只在播放時代替舊神女區域；每格重新放回原畫鳥形及四周邊框像素，播完撤除全部動畫圖層。頭／手採剛體轉動，衣袖下段從同一舉臂圖層分出並沿袖口連接；atlas 右下方的自由衣袖方案未採用。素材及提示詞見 `docs/art/luoshen/farewell-animation-v1-2026-10-21.json`。此為遊戲演繹及生成補底，不是歷史復原；原畫與衍生使用條件仍待確認。
# 2026-10-21：兩岸曹植動畫素材

整組模式另使用 `../animations/luoshen-farewell-scene/retinue-master-v1.png`、`mount-master-v1.png`、`silk-plate-v1.png`，均由內建 imagegen 依未改原畫製作；三位隨從、鳥形及兩位主角只在演繹時替換，播完可回原畫。來源、提示詞及條件見 `docs/art/luoshen/farewell-scene-v1-2026-10-21.json`，影像及衍生使用許可仍待確認。書頁仍沿用清明章節 `book-page-blank.png`，只調整洛神排版，沒有新畫一套介面。

現行修訂已改用 `../animations/luoshen-cao/figure-master-v2.png` 與 `silk-plate-v3.png`；完整人物由同一母圖分層，修正衣領接縫與袍邊裁切，舊圖保留為歷程。素材及提示詞見 `docs/art/luoshen/cao-animation-v2-2026-10-21.json`，原畫與衍生使用條件仍待確認。

`../animations/luoshen-cao/figure-parts-v1.png` 及 `silk-plate-v2.png` 由內建 imagegen 參照未修改的 detail-4 與既有曹植摹繪製作，只作短暫動畫演繹。`silk-plate-v1.png` 為保留的修訂歷程，不在遊戲載入。原畫影像及衍生圖樣使用範圍仍待確認，未有館方授權憑證。來源、提示詞與 SHA-256 見 `docs/art/luoshen/cao-animation-v1-2026-10-21.json`；可返回未改原畫對照。


## 2026-10-21 雲車離去摹繪演繹

`../animations/luoshen-cloudcar/master-v2.png`、`silk-plate-v1.png` 為內建 image_gen 依本章原畫 detail-3 局部生成，僅於演繹時暫顯；v1 母圖只作製作歷程。原畫旗飾、小傘、牽引龍形保持原畫；不將生成圖當作歷史復原。來源、提示詞及原始生成檔案見 `docs/art/luoshen/cloudcar-v1-2026-10-21.json`。原畫與衍生素材正式公開／商用／署名範圍尚待確認，未有館方授權憑證。

## 2026-10-21 神獸收藏

`collection-beast-cutout.png` 為依使用者指定原畫截圖，以內建 image_gen 製作的透明摹繪圖樣，保留兩隻淺色長角神獸的成對姿態。不是原畫方形裁圖。全卷兩處點選共用 `beast` 類別、同類一次；原畫對照另存。具體神獸名稱尚待核實，圖樣不作歷史復原。素材雜湊、原始生成檔及提示詞見 `docs/art/luoshen/beast-collection-2026-10-21.json`。原畫及衍生素材的正式公開／商用／署名條件仍待確認，未有館方授權憑證。

## 2026-10-21 線索元素候選：下層舟人

`elements/boatman-v2.png` 為依原畫局部以內建 image_gen 製作的透明候選摹繪，v1 為歷程。用於原畫／元素／alpha 金光比對，尚未疊回原畫。不是直接裁下的原畫像素，也不作歷史復原。出處、提示詞、雜湊與限制見 `docs/art/luoshen/clue-boatman-2026-10-21.json`；原畫與衍生圖樣公開／商用／署名條件仍待確認，未有館方授權憑證。

### 2026-10-21 衣袖姿態元素
`elements/sleeves-cao-v2.png`、`elements/sleeves-companion-v2.png` 由內建 image_gen 參照既有宋摹本局部製作透明摹繪，v2移除外圍柔霧。用於題箋小像比較，並非原畫人物復原。來源、雜湊、生成路徑與提示見 `docs/art/luoshen/clue-sleeves-2026-10-21.json` 及同日 prompts。原畫及衍生圖公開／商用／署名條件仍待確認，未有館方授權憑證。

### 2026-10-21 曹植畫中展袖補底
`../animations/luoshen-opening-sleeves/repair-plate-v2.png` 由內建 image_gen 製作，原位演繹期間只取舊袖形內補底；袖部沿用 `elements/sleeves-cao-v2.png`，原畫冠髮、面孔與軀幹固定。原始路徑、提示及條件見 `docs/art/luoshen/opening-sleeve-inplace-2026-10-21.json`。補底為遊戲演繹，公開／商用／署名條件仍待確認。

同日更正：曹植原位版已撤掉裁袖與原畫頭身拼接，現改重用完整 `elements/sleeves-cao-v2.png` 及既有展袖動作。這次僅改整合及配準，沒有新增角色生成；既有PNG雜湊未變。原畫與整體摹繪演繹分清，播完還原。

### 2026-10-21 同行者收袖接回
沿用 `elements/sleeves-companion-v2.png` 與既有收袖動作，沒有新增人物生成。新補底 `../animations/luoshen-opening-sleeves/companion-repair-plate-v1.png` 由內建 image_gen 製作，僅在原人物輪廓內用於演繹；曹植前景與旁人面孔保留。提示、原始路徑與使用條件見 `docs/art/luoshen/companion-reconnected-2026-10-21.json`，現行動畫素材清單見 `animation-manifest-2026-10-21.json`。公開／商用／署名條件仍待確認。
