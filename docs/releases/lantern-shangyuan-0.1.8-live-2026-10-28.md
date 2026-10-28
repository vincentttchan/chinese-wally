# 宮中鬧元宵上元隨記0.1.8正式發布

2026-10-28（香港）。使用者確認整個設計優化完成，要求取代舊版本並更新，授權正式入口與發布。

正式入口：<https://vincentttchan.github.io/chinese-wally/#lantern-festival>。完整文件：`public/chapters/lantern-shangyuan-v2-0.1.8-live/index.html`。

以遠端main 546d76861e0d06a4ddc5226281e26c9d1d4034b1的乾淨發布副本為基底；採用經確認的0.1.8完整遊戲，不採用questions快速試玩版本。只更改正式題名、正式存檔與章節導航宿主交接。正式收藏沿用原鍵，主線使用正式新鍵，預覽鍵隔離。所需共用素材逐檔比對現行正式站相同，未覆寫素材。

完整保留三幕1.1.0成品於`public/chapters/lantern-three-act-v1-1.1.0-archive-20261028/`，原文件網址改轉新版；舊版本、舊來源、Git標記、Release與本機預覽均保留。除宮中原入口、主站路由及產生首頁以外，960個既有src/public檔案不變，見`lantern-shangyuan-0.1.8-20261028/preservation.json`。康衢、簪花、洛水、清明上鎖及榜下獨立狀態維持。

乾淨副本npm ci及NODE_DISABLE_COMPILE_CACHE=1 npm run build通過型別、Vite與本機首頁打包；本機以/chinese-wally/子路徑實際開啟正式路由，確認iframe載入完整新版封面，章節導航仍有清明已上鎖且無榜下主站入口。未重新通關三庭與所有動畫；本次兩題與縮短題箋的實際檢視沿用各預覽記錄，沒有宣稱新增手機檢視。

批准來源ZIP、預覽manifest、正式manifest及提升轉換記錄分開保存；實際部署提交及線上指紋在GitHub發布記錄與本機補充核對檔保存。
