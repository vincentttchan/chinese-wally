# 清明上河圖可玩章節 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 把已確認五人接力及必經史料觀察做成可開啟、可完成、可回看見聞冊的獨立章節。
**Architecture:** React chapter runtime supplies independent painting, people, observation and collection data to the existing ScrollScene and shared Lantern UI classes/assets. The mainline reducer guards each painting observation before continuing; collection origins and mainline progress remain separate.
**Tech Stack:** Existing React/TypeScript/Vite, shared chapter music engine; no new product dependencies.
**Spec:** docs/chapters/qingming-observation-and-hints-v0.3.md; docs/chapters/qingming-mainline-flow-v0.2.md.

## Global Constraints

- 沿用《宮中鬧元宵》現行按鈕、圖示、提示卡、題箋、對白、見聞冊與字體；基準章節內容不改。
- 五人接力、虹橋船運、城門銜接、原畫與短史料必經、長文選讀。
- 原画事实、史料、虛構對白分清；保留原像素素材和來源。
- 同類見聞去重，保存首次位置；再尋一次保留收藏。
- 音樂由玩家開啟、章節獨立曲目、附來源；減少動態仍可繼續。
- 使用者 AGENTS.md 優先：不新增或執行未要求測試。以編譯打包、來源及實際畫面檢視記錄交付，不跑測試套件。
- 在既有 codex/scroll-mystery-prototype 分支原地新增。工作區大量既有未提交素材；不切換或重置、不把其他工作一起提交。

## Review Focus

- Missing/failed image: retry available, introduction cannot begin before assets load.
- Observation clicks: adjacent people/signs cannot advance the wrong task; source-only clicks cannot bypass painting.
- Journal: preserve camera and focus on close; collect once and retain first origin; storage failure does not block play.
- Keyboard, mobile and reduced motion: essential actions remain available; no transition leaves the scene locked.
- Route/local packaging and baseline: new chapter reachable in shared cover; existing chapters untouched.

## Tasks

### Task 1: 原畫、頭部及觀察素材
- [x] Split the verified 38,414×1,800 source into ten original-pixel tiles and a lightweight base.
- [x] Preserve five head crops, observation/collection crops and source/hash/coordinate records under public/art/qingming.
- [x] Obtain independently credited modern background music using the existing engine.

### Task 2: 章節資料與主線狀態
- [x] Create src/game/qingming.ts: normalized actors, seven stages (five people, bridge, gate), source passages, collection correspondence and nearby individual replies.
- [x] Create src/game/qingmingState.ts: guarded mainline transitions, isolated persistence and first-origin collection state.
- [x] Record coverage actually authored and limitations; do not pretend a few regions cover every person.

### Task 3: 共用介面上的可玩流程
- [x] Create src/components/QingmingGame.tsx plus small chapter note/speech/journal units using shared UI classes and ArtIcons/ScrollScene/LanternNavigator/ChapterDialog.
- [x] Connect explicit close/look/continue actions, focus, reduced motion, camera restoration, replay, source and music credits.
- [x] Add only chapter geometry/content CSS; no replacement visual design.

### Task 4: 入口及打包
- [x] Register the route, shared cover link and chapter music track. Package public/index.html using the existing build command.
- [x] Open the chapter locally for review and preserve representative actual screenshots if available.

### Task 5: 交付檢視與紀錄
- [x] Read compiler/build output; fix issues introduced by this chapter.
- [x] Review changed files and exact interaction coverage; obtain one fresh code review as required by executing-plans, without executing tests.
- [x] Record completed implementation, actual inspections and remaining limitations, with runnable entry link.

## Execution decisions

使用者「do it」授權開始實作；原地依序執行，不再為已確認設計要求重複許可。測試規則依使用者指示覆蓋技能 TDD 預設。計劃與進度保存在本地文件，不提交整個髒工作區。

## Progress ledger

Task 1 complete: ten original-pixel tiles, base, five heads and observation crops; independent credited MP3.
Task 2 complete: chapter data, seven stage nodes, guarded reducer, isolated origins/read persistence.
Task 3 complete: shared UI runtime, journal, camera restoration, source/reply/focus/replay.
Task 4 entry complete: route and shared covers; first build packaged successfully.
Final review: one independent static review; clipped-speaker action and failed-load recovery fixed, journal view state corrected. No tests run per user instructions.
最新修正後打包及代表畫面記錄待收尾。

Final packaging: TypeScript passed. Full public copy hit an existing Kangqu image timeout; source untouched. Vite copyPublicDir=false build and local packager passed. Full dist assets-copy success is not claimed.
