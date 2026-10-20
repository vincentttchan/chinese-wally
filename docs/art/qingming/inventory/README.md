# 清明上河圖人物與同類線索盤點

2026-10-14，v0.5。以本章38,414 × 1,800影像逐段目視登記，未以格點推測人物或補畫被遮身體。

現況：692位人物及222處物件／觀察細節已接入遊戲回應。另有5處疑似身影待核、兩處林間建築不作商業互動。697個人物／待核位置不是歷史人口或權威人物總數。集合觀察不計作個人人數；物件位置不等於獨立店舖或船隻數。

- [逐區指標點擊核對表](hit-review/browser-visible-pass.md)：914個對象的最後一輪可見畫面點擊，全部通過。
- [密集熱區修正紀錄](../../../chapters/qingming-hit-review-2026-10-14.md)
- [完整座標、對白與排除表](coverage-table.md)
- [完整合併資料](coverage.json)
- [同類線索與六類收藏對應](clue-types-and-collections.md)：37個可觸發位置，同類只記一次並保存首次位置。
- [逐項原畫對照工具](coverage-atlas.html)：製作盤點工具，沒有替換遊戲介面。
- [合併與人物重新啟用紀錄](root-reconciliation.json)
- [實作與實際檢視紀錄](../../../chapters/qingming-coverage-2026-10-13.md)

`overlays/` 的54個SVG是合併後現行標記，引用完整生產分段原畫。紅框為人物，藍框為物件／觀察區，灰框為待核或不互動位置。圖樣及底圖本身沒有改畫。`city/`、`river/`、`outskirts/` 的原尺寸裁圖與早期標記保存目視歷程，現行位置和狀態以coverage.json及overlays為準。

欄位：hitPoint是已目視核對的原畫點（人物優先核對臉、頭肩或可見身體；物件核對具體細節）；bounds是原畫像素[左,上,右,下]；evidence是可見依據；replies是首次／再次／後續三句短回應；existingId連回原五位主線、五位鄰人及十四個既有物件／觀察位置；collectionId才觸發同類收藏；excluded必須有reason。人物回應均為遊戲虛構，物件文字為原畫觀察提示。未知招牌與商品沒有猜定店種、貨物來源或人物職業。

修改city.json、river.json或outskirts.json後，以 `python3 scripts/build-qingming-coverage.py` 再生成覆蓋表、對照工具、現行SVG與src/game/qingmingCoverageData.ts。匯入程式只編製人工資料，不自動辨認或增加人物。

2026-10-13–14已逐區在1280 × 720瀏覽器點擊914個對象各一處核對點，修正後全部匹配回應身分與短句；另核對船工及橋上人群的集合觀察。9個針對命中問題的回歸測試、TypeScript編譯與本地打包完成。沒有執行完整自動通關、手機或學生試玩；核對點通過不代表每個邊界像素均已驗收。
