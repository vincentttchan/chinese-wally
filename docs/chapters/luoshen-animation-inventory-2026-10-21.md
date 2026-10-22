# 洛水之間：現行動畫版本與漏接盤點

本輪依使用者要求審視「是否仍有未更新動畫」。檢查正式章節 `LuoshenGame.tsx` 的播放分支、每個動畫元件載入的素材、共用動作及主入口相依關係，並比對設計歷程。沒有重新製作素材、修改遊玩行為或執行額外測試；沒有重新存取先前遭拒的瀏覽器，因此以下是程式接線與素材版本審視，不能當成實際播放品質驗收。

## 發現與優先次序

1. **同行者收袖：已製作但漏接主線。** `elements/sleeves-companion-v2.png` 及 `luoshenSleeveMotion.ts` 的 `companion` 動作仍在；`LuoshenSleeveStudies` 曾在題箋使用它，現已不由主入口匯入。主線第一段第二處只有原畫聚焦與短句，沒有播放收袖。應沿用既有素材與動作接回畫中，毋須再生成角色。
2. **預覽頁仍是較早互動。** `#luoshen-birds-preview`、`#luoshen-ribbon-preview`、`#luoshen-dragon-preview` 使用現行動畫元件／素材，但仍有文字播放按鈕；飛鳥預覽播完保留摹繪停格，正式主線則自動恢復原畫。三頁 `ScrollScene` 仍採預設背景設定，與主線明確關閉背景的設定不同。這是入口與互動未同步，不代表鳥／洛神／龍形美術仍舊。整理時宜明確標示或封存效果稿，保留正式章節為試玩基準。
3. **未動畫化的細節須與漏接分開。** 下層舟人已有 `elements/boatman-v2.png` 候選，但尚無其原位動作接線；榻前神女、車前牽引、舟上曹植與長桿仍為靜態聚焦／短句。它們不能標為「動畫已完成」，也不是已完成動畫被舊版替換。

## 主線現行引用

| 對象 | 實際元件／素材 | 審視結果 |
| --- | --- | --- |
| 岸上曹植展袖 | `LuoshenOpeningSleeveAnimation` → `sleeves-cao-v2.png` + `drawSleeveStudy` | 重用完整既有美術與原動作；原畫頭身／新袖拼接已撤下 |
| 同行者收袖 | 主線普通細節分支 | 漏接；美術與動作已在檔案中 |
| 初見雙鳥 | `LuoshenRedrawnBird` → `redrawn/bird-parts-v2.png` + `silk-plate-v3.png` | 指向獨立重繪分層版，非原畫扭曲版 |
| 初見洛神 | `LuoshenRibbonAnimation` → `luoshen-figure/figure-parts-v2.png` | 名稱仍含 Ribbon，但實際是完整洛神，並非舊的單獨衣帶版 |
| 開首龍形 | `LuoshenDragonAnimation` → `dragon-parts-v2.png` + `hindleg-v3.png` | 指向修正後的分層素材 |
| 兩岸神女 | `LuoshenFarewellAnimation` → `luoshen-farewell/figure-parts-v1.png` | v1是此對象現行素材，不能僅看檔名判定過時 |
| 兩岸曹植 | 同上 figure=cao → `luoshen-cao/figure-master-v2.png` + `silk-plate-v3.png` | 指向已修正的完整母圖及補底 |
| 同看兩人／隨從／鳥形坐騎 | `LuoshenFarewellSceneAnimation` → 同一神女、曹植素材 + `retinue-master-v1.png`、`mount-master-v1.png` | 主角版本與單人一致；配角素材也已接入同一場景時鐘 |
| 雲車 | `LuoshenCloudCarAnimation` → `master-v2.png` + 固定頭臉、連續布條動作程式 | 已指向後續修正版；仍以整組摹繪分區處理，單憑程式不能斷言動作已理想，亦不應因此重畫已完成素材 |

## 留存但未被主入口匯入

靜態追蹤 `src/main.tsx` 的本地匯入關係，以下均未由應用入口載入：

- `LuoshenBirdAnimation.tsx`、`luoshenBirdMotion.ts`：早期原畫鳥形變形方案。
- `luoshenRibbonMotion.ts`、`luoshenRibbonRedraw.ts`：早期衣帶／重繪過程程式。
- `LuoshenSleeveStudies.tsx`：題箋小像動作方案，主線已撤下。

`master-v1.png`、`dragon-parts-v1.png`、舊曹植 `figure-parts-v1.png` 及較早補底也仍保留在素材資料夾，未見現行播放元件引用。檔案留存本身不表示玩家仍在看舊動畫。本輪沒有刪除它們，以免丟失製作歷程。

建議下一輪先接回同行者收袖，然後整理預覽入口；其餘已接入的獨立人物／動物素材先保留，若實際播放發現具體問題，再調整配準、圖層或節奏，避免無必要重製。

## 同日接回結果

上文為接回前盤點。使用者要求「全部接回」後，同行者已沿用既有美術／動作接入正式章節；三個舊預覽入口也已接入主線互動，不再使用舊預覽介面。現行登記見 `docs/art/luoshen/animation-manifest-2026-10-21.json`，實作、證據與未動畫化項目見 `luoshen-animations-reconnected-2026-10-21.md`。
