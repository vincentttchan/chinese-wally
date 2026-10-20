# 洛水之間：手機、鍵盤、故障恢復與敘事驗收

日期：2026-10-19。原有完成存檔未重設。瀏覽器使用 CUA Chrome；沒有使用外部 Playwright 或修改瀏覽器內部狀態。測試以不同 localhost 來源隔離進度。

## 修正

1. 鍵盤在題箋與原畫之間往返過長：原先從題箋到衣袖曾需 87 次 Tab。現在鍵盤啟動「靠近看」，鏡頭停定後直接聚焦當前細節；Escape 回題箋。收尾完成觀察、出現繼續按鈕時，題箋會重新獲得焦點。
2. 封面擋住載入失敗重試：原本能看見「重新載入」卻無法點擊。提高本章錯誤提示層級，主圖或局部失敗都能在封面上直接重試。
3. 旋轉後觀察細節可能被換位的題箋遮擋：觀察中改變尺寸會依當前細節重新取景，實測 390×844 → 568×320 後細節留在題箋左方。
4. 敘事：曹植坐榻、低身神女、雲車洛神、樓船曹植各有不同短對白；送別和乘舟後的接續文字更明確。流連、離別、追懷回看改為接續前一刻的敘述，保留原畫事實與虛構對白的區別，沒有新增動畫或必讀長文。

涉及：src/components/LuoshenGame.tsx、src/components/LuoshenPanels.tsx、src/game/luoshen.ts、src/luoshen.css。測試：tests/luoshenKeyboard.test.tsx、tests/luoshenReliability.test.tsx。

## 實際瀏覽器檢查

| 檢查 | 結果／範圍 |
| --- | --- |
| 頁面／非空白／無框架錯誤頁 | 通過；最終重新載入後本章 error 記錄為空 |
| 全程鍵盤主線 | Tab／Enter 完成六次尋找、14 處必經觀察與三幕收尾；首段發現焦點負擔後修正，再續測到完成，並另核對首段直達細節及重新載入續玩 |
| 題箋與原畫焦點 | 靠近看 → 對應 actor button → Enter 完成；Escape → 題箋，通過 |
| 鍵盤見聞冊 | 故事回看 → 流連 → 初見髮式 → 下一處 → Escape 返冊 → 合冊，通過 |
| 小手機 | 320×568 完成題箋內部可捲動，主要自由探索固定可見，次要入口可讀可按 |
| 其他比例 | 390×667、390×844、844×390、568×320；題箋、操作說明、故事回看、原畫對照及旋轉重取景 |
| 彩色拖曳 | 實際指標拖曳，畫卷 x 從 -15760.90 移至 -15950.90 |
| 局部圖失敗 | 測試伺服器讓 detail-4.jpg 回 503，清除故障後點重新載入，可再入畫 |
| 主圖失敗 | full-scroll.jpg 回 503，清除故障後可重試恢復 |
| 慢速載入 | detail-4.jpg 延遲三秒，等待素材齊備才開放入畫 |
| 音樂失敗 | WAV 回 503，顯示重試提示且遊戲可用；恢復後音樂可開關，測畢關閉 |
| 儲存不可用 | 獨立測試頁以 CSP sandbox allow-scripts 產生無儲存權限的來源；能入畫、尋得曹植、進入衣袖觀察；操作說明顯示存檔不可用。未改使用者的瀏覽器全域設定 |
| 敘事排版 | 更新後的流連、離別、追懷於手機見聞冊檢視；短對白隨主線走過 |

故障伺服器只用正式 dist 輸出，在 5180 埠控制指定素材回應；腳本與控制檔在 /tmp/luoshen-acceptance。故障測試中的 503 屬預期測試輸出。未拔斷實際網路。

## 程式層檢查

25 項相關測試通過；npm run build 通過，仍有既有 bundle 大於 500kB 提示。

新增的手勢測試驗證：凝神下單一 touch pointer 移動光區而不移畫、兩個 pointer 縮放、pointercancel 清除拖曳；彩色下單一 touch pointer 可移畫。這是 HappyDOM 事件測試，不代表實體手機手勢已驗收。減少動態的收藏回饋由現有測試驗證，未更改作業系統的減少動態設定。

## 需要實體手機才能確認

- iOS Safari／Android Chrome：真實單指凝神與雙指拖曳縮放、手指遮擋、誤觸及操作手感；手勢被系統打斷後是否恢復。
- 網址列展開／收合、瀏海與底部安全區、軟鍵盤或來電切換、橫豎旋轉時的實際 viewport 行為。
- 音樂在首次觸控、背景切換／鎖屏／來電後的播放政策，以及低記憶體裝置的續玩恢復。
- 真實小螢幕可讀性與觸控準確度；VoiceOver／TalkBack 朗讀順序尚未驗證。

## 代表畫面

- keyboard-complete.png：鍵盤通關。
- keyboard-observation-focus.png：鍵盤直達細節。
- short-landscape-observation.png：修正後旋轉避讓。
- small-phone-complete.png：320×568 完成題箋。
- mobile-image-failure.png、mobile-base-image-failure.png：可操作的失敗畫面。
- mobile-load-recovered.png：重試後入畫。
- mobile-slow-loading.png：慢速載入等待。
- mobile-music-failure.png：音樂失敗提示。
- mobile-storage-unavailable.png：儲存失敗仍可玩。
- mobile-story-lingering.png、mobile-story-farewell.png、mobile-story-longing.png：更新敘事。
