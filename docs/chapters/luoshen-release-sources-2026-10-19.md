# 《洛水之間》素材來源與使用條件

整理／查閱日期：2026-10-19。本文是專案來源及授權狀態記錄，不是已取得授權的聲明；館方條款及實際書面回覆優先。沒有代使用者申請、聯絡、簽約或付款。

## 1. 原畫與解說來源

| 來源 | 用途 | 證據與限制 |
|---|---|---|
| [故宮藏品介紹](https://www.dpm.org.cn/collection/paint/234597.html) | 宋摹本、尺寸、文物號、敘事框架 | 本輪重新查閱；現存本不作顧愷之親筆 |
| [館方原畫看圖器](https://www.dpm.org.cn/bigimg/737/0) | 本章完整畫心及局部像素 | 素材取得記錄為 2026-10-15；本輪未重新下載 |
| [故宮「龍在蒼穹」](https://minghuaji.dpm.org.cn/specialTopic/view/7) | 雲車、龍形與賦文關係 | 沿用研究紀錄，本輪未重新核讀全文；不逐龍辨數 |
| [館方書法作品的《洛神賦》錄文](https://www.dpm.org.cn/subject_zhaomengfu/achievement/245842.html) | 翩若驚鴻、恨人神之道殊、御輕舟而上溯等短句 | 文學對讀；不是本畫另一張原圖，也不是歷史實錄 |
| 《不懂中國畫，只怪你太年輕》相關書介 | 故事懸念與通俗引入的方向參考 | 沿用早期書介研究，未取得／閱讀本書相關章節全文；不列作已核讀或逐頁引用來源，遊戲未複製其插圖及段落 |

原畫可見事實與專案比對分開：初見、雲車等敘事參考館方；其他重現身影依冠髮、衣飾及場景比對，仍有研究空間。虛構對白在介面語意與小記中標明。

## 2. 現行素材表

完整檔名、位元組數、像素／音訊規格及 SHA-256 見[本輪快照](luoshen-final-assets-2026-10-19.json)。SHA 用於版本辨識，不代表授權成立。

| 素材 | 製作／取得 | 用途與處理 | 使用條件狀態 |
|---|---|---|---|
| public/art/luoshen/full-scroll.jpg | 2026-10-15 館方縮放圖層 | 11970×566 底圖；保留完整畫心，縮小及 JPEG 編碼 | 館方影像用途範圍待確認 |
| detail-0.jpg…detail-9.jpg | 同上 | 十張各 1995×943，世界座標 19950×943；裁切及編碼，未生成／補畫 | 同上；裁切、拼接及互動展示須在用途說明列明 |
| cover.jpg、head-*.jpg、collection-{dragon,boat,canopy}.jpg | 同上 | 封面／研究參考／原畫比較；非新增畫作 | 同上；原畫裁圖仍屬同一來源影像 |
| head-{C1,L1,C2,L8,L9,C4}-cutout.png | 2026-10-15 built-in image_gen | 透明樣貌摹繪，依原畫參考重新表現；非未改動的原畫像素 | 保存提示詞與參考；衍生用途仍列入範圍確認，不因生成便標成館方已授權 |
| collection-{dragon,boat,canopy}-cutout.png | 2026-10-15 built-in image_gen | 元宵風格參考、原畫形象派生的收藏插畫 | 同上；不得以館方原圖或精確復原名義呈現 |
| collection-ribbon-cutout.png | 2026-10-16 built-in image_gen | 衣帶象徵插畫 | 同上 |
| collection-bird-cutout.png | 2026-10-16 built-in image_gen | 最終單鳥象徵；早期雙鳥有底色稿已棄用 | 最終以 collection-bird-final-2026-10-16.json 為準；不是鳥種鑑定 |
| public/art/ui/reading-paper.png 等共用介面素材 | 沿用《宮中鬧元宵》 | 紙張、手繪圖示、對白及控制樣式 | 沿用既有專案記錄；本輪未重審共用素材全部權利鏈，不等同新增可再授權聲明 |
| public/audio/luoshen-music.wav | 2026-10-15 本專案程式合成 | 《洛水微波》；48 秒、24kHz、單聲道、無外部採樣 | 專案原創製作記錄，未另指定對外開放授權；見 public/audio/CREDITS.md |
| LXGW WenKai TC | 既有本地字型 | public/fonts/LXGWWenKaiTC-Regular.ttf | 隨附 LXGWWenKaiTC-OFL.txt；保留 SIL OFL 聲明 |
| Noto Serif TC／系統備用字體 | 共用 CSS Google Fonts 載入／系統字體 | 正文與標題；網絡不可用時使用備用字體 | 本章未新增本地字型檔；外部字型可用性不作離線保證 |

原畫圖層的世界裁切為第 16 級全域 (15600,92) 至 (35550,1035)。較早 fetch-record.json 的原點 (15300,0) 與研究拼圖尺寸不同，不直接用作現行點擊世界座標。

追溯檔案：

- docs/art/luoshen/selection-2026-10-15/playable-art-manifest.json、fetch-record.json
- public/art/luoshen/cutout-assets-2026-10-15.json
- public/art/luoshen/collection-cutout-assets-2026-10-15.json
- public/art/luoshen/collection-additions-2026-10-16.json、collection-bird-final-2026-10-16.json
- public/art/luoshen/collection-sites-2026-10-16.json（後續已校準座標）
- scripts/prepare-luoshen-art.py、scripts/generate-luoshen-audio.py

## 3. 館方公開使用條件與本專案狀態

本輪查得[館方影像授權頁](https://www.dpm.org.cn/bottom/apply_image)與[名畫記下載／授權說明](https://minghuaji.dpm.org.cn/help/detail?id=3)的搜尋收錄內容；中文頁直接開啟逾時，故不聲稱完成中文全文逐條核讀。成功讀取[館方英文 Image Services](https://intl.dpm.org.cn/detail/327.html)；其說明包括按具體用途申請、一次使用、提供署名、再利用或媒介變更另行確認，並指明中英文有差異時以中文為準。[網站使用條款](https://www.dpm.org.cn/bottom/privacy/254.html)亦列出圖片使用的授權聯絡方式，本輪直接開啟同樣逾時。

**現況：**本專案目錄內尚無館方書面許可、申請編號、核准使用期限、媒介、地域或商業範圍記錄；也未完成相關衍生圖樣用途的權利確認。不將「古畫年代久遠」「網站可看見」「本地教學／非商業」直接寫成已取得數位影像使用許可；現有本地製作狀態也不是許可證明。

## 4. 申請／確認時需說清的用途

- 指定宋摹本及文物號新00147329、來源圖層、完整畫心與局部樣本。
- 互動網頁遊戲：課堂內部、受限登入或公開網站；使用地區、人數、期限、免費／收費及是否提供離線檔。
- 原圖縮小、JPEG 編碼、分片、裁切、灰階／凝神及鏡頭縮放；不補畫原畫。
- 以原畫為參考的人物摹繪與收藏象徵插畫；需詢明其衍生、修改及再利用範圍。
- 宣傳截圖、學生講義、影片、展示、網站或程式庫內的素材分發是否涵蓋。
- 要求的完整署名、來源連結、標示方式，以及是否需換用授權檔案。

本文件採用的暫定來源標示為「北京故宮博物院藏《洛神賦圖卷（宋摹）》；原畫影像來源：故宮博物院」。正式署名仍以回覆為準。香港／海外影像申請聯絡窗口見[官方申請頁](https://intl.dpm.org.cn/detail/327.html)，本輪沒有向館方發出訊息。

待填記錄：申請人與日期、用途版本、館方回覆及憑證位置、核准媒介／期限／地域、衍生與宣傳範圍、署名原文、費用與限制。收到回覆前，本文件不標記任何上述用途為「已獲授權」。
