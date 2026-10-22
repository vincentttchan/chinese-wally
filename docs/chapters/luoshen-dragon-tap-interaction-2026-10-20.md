# 龍形示範：直接點原畫播放與重播

2026-10-20。依使用者確認的範圍，先把主線初見龍形改成直接點畫互動；飛鳥與洛神保留既有入口。

## 現行操作

- 雙鳥之後進入龍形觀察，題箋保留「飛鳥與龍形 · 2／2」與一句「點看龍形，看看回轉的姿態」，不再要求按「靠近看」或額外播放按鈕。
- 點原畫龍形即啟動現有七件龍形演繹。播放中不接受重複觸發，也不啟動其他動畫。
- 播完卸載龍形及暫時補底，回到可拖曳、縮放的原畫。再點同一位置便重播；重播不重設玩家的鏡頭。
- 題箋不再放「看龍形演繹／再看一次」按鈕。播放中仍可「返回原畫」立即中止，Escape 亦可。
- 保留「圖文對讀／回到圖文對讀」，承接逐步引領。完成原畫點看後才提供必經觀察的下一步；素材失敗仍可繼續，亦可再點龍重試。
- 圖文對讀的導覽入口改名「回看龍形」，只帶回原畫位置，播放由畫中點擊觸發。
- 鍵盤仍可 Tab 到原畫龍形的語意按鈕，按 Enter 啟動；沒有增加常駐圈選或獨立動畫版面。
- 減少動態時保留原畫並清楚提示，不強迫觀看演繹。點畫或重播不新增收藏。

## 試玩入口

- 快速示範：`http://127.0.0.1:5176/#luoshen-dragon-tap-playtest`。直接開啟主線同一個龍形觀察元件，不讀寫正式存檔；其後仍可接圖文對讀及故事。
- 正式章節：`#luoshen`，找到初見洛神並完成雙鳥後，使用上述新互動。
- `#luoshen-dragon-preview` 為舊有獨立美術檢視頁，不作本次互動示範入口。

## 實作與驗證

沿用 ScrollScene 的原畫座標命中、滑動距離門檻、雙指操作及鍵盤按鈕。龍形靜止對照時，只提供該龍形的場景熱區；播放中鎖定，完成後恢復原畫導航。沒有另加覆在畫上的透明浮層去攔截手勢，也沒有改動共用 ScrollScene 或《宮中鬧元宵》。

52 項相關檢查及 TypeScript 通過，遊戲模組 HTTP 200。新增桌面 1000×800、窄屏 390×844 的實際 ScrollScene pointerdown／pointermove／pointerup 模擬：點畫啟動、播放中不重啟、自然返回原畫、拖曳不誤播、保留玩家鏡頭重播、失敗再點重試、原畫中止及鍵盤啟動。新隔離入口確認不讀寫正式存檔。

兩種尺寸的全新六次尋找、14 項觀察、三段收尾、五類 30 個收藏位置、見聞冊及故事回看、保留收藏重玩亦重新通過。

```sh
./node_modules/.bin/tsx --tsconfig tsconfig.json --test tests/luoshenAnimationPlayback.test.tsx tests/luoshenRedrawnIntegration.test.tsx tests/luoshenRedrawnBird.test.tsx tests/luoshenDragonMotion.test.ts tests/luoshenDragonAnimation.test.tsx tests/luoshenRibbonAnimation.test.tsx tests/luoshenProgress.test.ts tests/luoshenFeedback.test.tsx tests/luoshenKeyboard.test.tsx tests/luoshenHit.test.ts
./node_modules/.bin/tsc --noEmit
```

瀏覽器存取先前遭安全政策拒絕，未換途徑繞過；上述為模擬互動及實際狀態／畫布邏輯檢查，不是瀏覽器視覺或實體手機驗收。本輪沒有生成新的頁面截圖；動畫圖像沿用已接受的 V3。實際點擊手感、手機誤觸率、題箋遮擋與流暢度仍待使用者試玩。
