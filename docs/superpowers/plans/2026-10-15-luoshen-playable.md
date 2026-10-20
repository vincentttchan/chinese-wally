# 洛神賦圖可玩初版 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task in the current session.

**Goal:** 以六次尋找、必經原畫觀察及畫中收尾製作獨立可玩章節。
**Architecture:** 原畫與座標、故事資料及進度分開；復用ScrollScene、LanternNavigator、ChapterDialog、ArtIcons與現行lantern樣式素材。新增章節專用協調器，不改宮中鬧元宵流程。
**Tech Stack:** React、TypeScript、Vite、Python素材裁切及原創合成配樂。
**Spec:** docs/chapters/luoshen-character-selection-and-flow-v0.2.md；使用者已確認六次流程並明確要求直接製作。

## Global Constraints

- 使用C1→L1→C2→L8→L9→C4，不增加細看畫法環節。
- 以原畫操作完成觀察，不能只按讀完推進；人物對白為虛構。
- 介面共用宮中鬧元宵，原畫、文案與存檔獨立。
- 按AGENTS不自行增加或執行測試；只作編譯與素材檢視，記錄限制。

## Review Focus

- 觀察題箋不能遮住待點細節，窄屏可收起。
- 切換或重玩不能保留上一關觀察完成狀態。
- 同一主角不同位置仍有回應，不誤判推進。
- 主線收藏分開，同類見聞去重且來源可回看。
- 素材／存檔失敗要能繼續或重試，不影響已完成章節。

### Task 1: 原畫、頭像與獨立章節資料

- [x] 以現有館方圖塊保留完整畫心，補足右邊界，產生底圖及清晰分片。
- [x] 保存六次主線頭部原裁圖、角色與觀察細節座標；資料置src/game/luoshen.ts。
- [x] 加入本章原創現代配樂及署名，沿用chapterMusic。

### Task 2: 可玩流程

- [x] 新增src/game/luoshenState.ts進度轉換與防禦性獨立存檔。
- [x] 新增LuoshenGame，復用畫卷／導覽／對話定位／題箋／手繪素材；主線、觀察、冊子與收尾分離。
- [x] 六次尋找後回看岸邊與車駕，完成後保留探索、回看與重玩。

### Task 3: 入口與交付

- [x] 在main.tsx及historicalChapters.ts新增獨立入口。
- [x] 編譯與封裝本地入口；保留實際素材檢視及限制紀錄。

## 執行紀錄

- Ruling: 依使用者已明確要求直接製作，於本次工作內完成計畫及實作，不再要求重複批准。
- Ruling: 使用者AGENTS優先，不執行技能預設測試；只執行必要編譯與素材目視。
- Task 1–3 已完成；獨立只讀審閱指出C6漏項已補，詳製作紀錄。
