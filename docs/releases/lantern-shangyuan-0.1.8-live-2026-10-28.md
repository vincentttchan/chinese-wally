# 宮中鬧元宵上元隨記0.1.8正式發布

2026-10-28（香港）。使用者確認整個設計優化完成，要求取代舊版本並更新，授權正式入口與發布。

正式入口：<https://vincentttchan.github.io/chinese-wally/#lantern-festival>。完整文件：`public/chapters/lantern-shangyuan-v2-0.1.8-live/index.html`。

以遠端main 546d76861e0d06a4ddc5226281e26c9d1d4034b1的乾淨發布副本為基底；採用經確認的0.1.8完整遊戲，不採用questions快速試玩版本。只更改正式題名、正式存檔與章節導航宿主交接。正式收藏沿用原鍵，主線使用正式新鍵，預覽鍵隔離。所需共用素材逐檔比對現行正式站相同，未覆寫素材。

完整保留三幕1.1.0成品於`public/chapters/lantern-three-act-v1-1.1.0-archive-20261028/`，原文件網址改轉新版；舊版本、舊來源、Git標記、Release與本機預覽均保留。除宮中原入口、主站路由及產生首頁以外，960個既有src/public檔案不變，見`lantern-shangyuan-0.1.8-20261028/preservation.json`。康衢、簪花、洛水、清明上鎖及榜下獨立狀態維持。

乾淨副本npm ci及NODE_DISABLE_COMPILE_CACHE=1 npm run build通過型別、Vite與本機首頁打包；本機以/chinese-wally/子路徑實際開啟正式路由，確認iframe載入完整新版封面，章節導航仍有清明已上鎖且無榜下主站入口。未重新通關三庭與所有動畫；本次兩題與縮短題箋的實際檢視沿用各預覽記錄，沒有宣稱新增手機檢視。

批准來源ZIP、預覽manifest、正式manifest及提升轉換記錄分開保存；實際部署提交及線上指紋在GitHub發布記錄與本機補充核對檔保存。

## 線上部署確認

部署提交：`9527bad5619ad941946c1aba8f3038dc5ec83abe`。GitHub Actions [40629346928](https://github.com/vincentttchan/chinese-wally/actions/runs/40629346928)成功。10份主站、JS/CSS、新版章節及metadata、舊入口轉接、舊宮中存檔與康衢／簪花／洛水文件均HTTP200，SHA256與乾淨發布建置完全相同；見同名JSON核對檔。

瀏覽器首次無參數首頁曾讀到舊快取；本次交付使用<https://vincentttchan.github.io/chinese-wally/?v=0.1.8-20261028#lantern-festival>避免舊首頁快取。

原工作目錄只同步宮中正式文件、源碼入口及維護文件。同步前本機來源保存在`output/releases/lantern-before-0.1.8-live-20261028/`；未重建原工作目錄public/index.html，以保留其中其他未發布內容。線上首頁由乾淨副本建置發布。

已實際開啟線上新版封面，宿主iframe指向0.1.8-live，控制台沒有error或warn。新增Release標記site-2026-10-28-lantern-shangyuan-0.1.8指向實際部署提交；所有舊標記保留。
