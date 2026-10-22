# 三段動畫接入後：六次尋找及畫中收尾全流程檢查

2026-10-20。依使用者要求，由全新正式章節進度走到收尾，再檢查收藏、見聞冊及重玩。未改動真實使用者存檔，也未發布部署。

## 方法與結論

在 1000×800 及 390×844 各執行一輪完整 happy-dom 模擬操作，使用實際 LuoshenGame、ScrollScene、存檔與見聞冊元件；影像事件及動畫時間由測試控制。兩輪均通過；未重現新的主線阻塞、重複入冊或動畫圖層殘留，因此本輪沒有修改遊戲實作。

先前瀏覽器存取遭安全政策拒絕，本輪沒有換途徑繞過。**這是完整模擬互動及離線畫布驗證，並非實際瀏覽器／手機試玩。** 真實觸控、介面遮擋、Tab 順序、安全區、播放流暢度與控制台仍待確認。

## 每輪完整操作

1. 新進度入畫，先點非當前人物，確認主線不前進；連續收下華蓋、龍形，開合見聞冊確認數量。
2. 六次尋找順序：曹植 C1 → 洛神 L1 → 坐榻曹植 C2 → 低身洛神 L8 → 雲車洛神 L9 → 舟上曹植 C4。每次先讀找到後的短對白，再主動近看原畫。
3. 完成全部 14 項主線觀察；一般觀察透過「靠近看」進入，再點相應原畫細節。各段解讀的對照按鈕逐一操作，回到見聞冊後再接下一段。
4. 在第二次尋找中實際走完三段演繹：雙鳥播放／重播／返回原畫 → 衣帶收藏所開啟的完整洛神播放／重播／原畫／繼續探索 → 龍形原畫／玩家選播放／重播／原畫／圖文對讀。每段均檢查自然完成與取消後無其他動畫殘留。
5. 舟船收下後五類收藏齊全。依次完成岸邊曹植、歸途車輪、車中曹植的三段畫中收尾，最後仍留在原畫，主線狀態 complete、index 6、ending 3。
6. 收尾後逐一點擊全部 30 個登記收藏位置的 DOM 熱區按鈕，確認同類回應、首次發現位置及五類總數不變；衣帶提示逐次可退出。另有實際命中解析函式檢查各位置可點區域；不據此宣稱已驗證實體觸控精度。
7. 見聞冊五類逐一翻閱，確認使用 `collection-類別-cutout.png` 去背圖樣；返回第一處原畫，存在下一處時再切換；回冊仍保留該收藏詳情，最後返回總覽。
8. 故事回看四章「相遇、流連、離別、追懷」逐一開啟，點人物返回原畫，再回冊，確認仍保留所選故事章節。
9. 合冊返回完成題箋，進入自由探索後可重開題箋；再尋一次回到卷首主線，五類收藏及首次發現位置全部保留。

## 驗證結果

49 項相關檢查通過，TypeScript 通過；本地服務與遊戲模組 HTTP 200。

```sh
LUOSHEN_EVIDENCE_DIR=output/luoshen-full-flow-2026-10-20 ./node_modules/.bin/tsx --tsconfig tsconfig.json --test --test-name-pattern='complete fresh chapter' tests/luoshenRedrawnIntegration.test.tsx
./node_modules/.bin/tsx --tsconfig tsconfig.json --test tests/luoshenAnimationPlayback.test.tsx tests/luoshenRedrawnIntegration.test.tsx tests/luoshenRedrawnBird.test.tsx tests/luoshenDragonMotion.test.ts tests/luoshenDragonAnimation.test.tsx tests/luoshenRibbonAnimation.test.tsx tests/luoshenProgress.test.ts tests/luoshenFeedback.test.tsx tests/luoshenKeyboard.test.tsx tests/luoshenHit.test.ts
./node_modules/.bin/tsc --noEmit
```

既有回歸亦涵蓋三段播放互斥、舊回呼不能結束新動畫、飛鳥／洛神返回鏡頭、旋轉停播與重新取景、入冊中的延遲提示不覆蓋新選擇、素材失敗／重試、減少動態、存檔相容與續玩、人物命中及鄰近熱區分離。

本輪改善了測試操作選取：排除 `[inert]` 背景按鈕，避免在見聞冊打開時點到背後導覽列中同名的「相遇／流連」。這是模擬器操作修正，沒有把它當作遊戲缺陷。

## 代表畫面與保留紀錄

資料夾：`output/luoshen-full-flow-2026-10-20/`。

- 兩個 `flow-尺寸.json` 各保存 19 個代表狀態，含實際存檔、鏡頭、文字與 DOM。
- `representative-1000x800.png`、`representative-390x844.png` 保存衣袖、飛鳥、洛神、龍形、雲車及車中收尾的離線畫布取景；每張均有「不含介面」標示。
- 所有畫面直接使用當輪實際鏡頭、十張原畫圖磚及現行演繹函式輸出。飛鳥為靜止對照，洛神／龍形為 2.4 秒演繹畫格。沒有以重畫介面冒充實際截圖，未驗證題箋與畫面重疊。
- 收藏齊全、完成及追懷故事的模擬 DOM 另存 HTML；`verification.json` 保存範圍及未驗收項目。來源、素材授權與學生試玩的待確認條件不變。
