# 榜下尋人 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 完成一個約兩分鐘、原創古風長卷的可遊玩尋人原型。

**Architecture:** React 管理案件狀態，畫卷圖像與相對座標點擊範圍共用一個移動縮放容器。關卡內容獨立為資料，提示按探索階段定位，DOM 呈現繁體中文對話和線索卡。

**Tech Stack:** Vite、React、TypeScript、CSS；Node 原生測試驗證核心狀態與幾何計算。

**Spec:** `docs/superpowers/specs/2026-10-05-scroll-mystery-design.md`

## Global Constraints

- 原創科舉放榜日、淡雅城市風俗畫長卷、兩條線索、一個目標。
- 集齊線索後由玩家結合證據，介面不直接寫出合併答案。
- 電腦拖曳與滾輪、手機拖曳與雙指縮放、可用視角按鈕。
- 正常探索無浮動任務標記；提示才圈出區域或人物。
- 點錯不扣分；重玩恢復全部狀態。
- 畫卷載入失敗可重試；有效觸控範圍至少 44 像素。

## Review Focus

- 拖曳及縮放不可誤觸線索；以瀏覽器操作檢查。
- 線索任意順序與重複點擊不可損壞進度；以核心狀態測試檢查。
- 找到目標前須有兩條線索；錯誤候選人不可完成；以核心狀態測試檢查。
- 畫卷拖動和視窗變化後點擊範圍仍對齊，手機兩指中途放開不跳動；以幾何測試與手機視窗操作檢查。
- 生成插畫必須清楚包含兩位證人與唯一符合全部證據的考生；人工觀察原圖並校正相對座標。

## Files and responsibilities

- `src/game/level.ts`：文案、人物及座標。
- `src/game/state.ts`：開始、收集、選人、重玩。
- `src/game/geometry.ts`：縮放邊界、焦點縮放、視角對齊。
- `src/components/ScrollScene.tsx`：畫卷載入、手勢、點擊範圍與提示。
- `src/App.tsx`、`src/styles.css`：開場、遊戲介面、線索、對話及結局。
- `public/art/`：長卷插畫；`docs/art/`：最終生成提示與素材出處。
- `tests/game.test.ts`、`tests/geometry.test.ts`：關鍵進度與手勢幾何。

### Task 1: Core gameplay and project setup

**Interfaces:** `createGame(): GameState`；`reduceGame(state, action): GameState`；`level` 包含 `SceneActor[]`，每個人物有 ID、種類、相對位置、點擊範圍及對話。

- [x] 建立 Vite / React / TypeScript 專案設定及依賴。
- [x] 先寫任意順序收集、重複收集、未集齊點目標、點錯、成功、重玩測試；執行 `npm test` 確認缺少實作時失敗。
- [x] 實作關卡資料與純函式狀態轉換；重跑 `npm test` 通過。

### Task 2: Painting and interactive viewport

**Interfaces:** `fitView(size, image)`、`clampView(view, size, image)`、`zoomAt(view, factor, point, limits)`；`ScrollScene` 接收 actors、active 狀態、提示人物 ID、選人 callback。

- [x] 用內建 imagegen 生成原創橫向畫卷，人工檢查核心人物，將圖片保存在 `public/art/`，記錄提示。
- [x] 幾何測試覆盖焦點縮放、倍率上下限、拖曳邊界、小尺寸畫面；先確認失敗再實作。
- [x] 實作拖曳、滾輪、雙指縮放、縮放按鈕、全景、觸控範圍、載入與重試。
- [x] 依原圖校正 actors 座標，驗證提示與點擊區域跟隨圖像。

### Task 3: Themed UI and complete playthrough

**Interfaces:** 使用 Task 1 狀態及 Task 2 畫卷；dialog 狀態独立於進度，重新開始同時重設視角、提示與對話。

- [x] 實作墨色、絹紙與朱印的遊戲介面，主畫面保留畫卷觀察空間。
- [x] 開場一句委託，兩張小線索卡，分級提示，簡短人物證詞與結局。
- [x] 桌面與手機完整操作驗證；確認點錯、集齊前點目標、重玩、縮放拖曳與線索任意順序。
- [x] 執行 `npm test`、`npm run build`；修復發現的阻礙。
- [x] 補上 README 啟動指令，啟動可試玩的本地伺服器並打開頁面；完成全分支審閱。
