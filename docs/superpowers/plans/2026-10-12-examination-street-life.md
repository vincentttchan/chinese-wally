# 榜下尋人核心流程實作計劃

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. 本對話依序執行；不另行委派代理。Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 先交付可玩的第一幕核心預覽：尋回考生、比較動作、收藏、v4見聞冊及畫中收尾。

**Architecture:** 新增第一幕資料與控制器，重用現有場景拖曳、縮放及凝神。主線、收藏與閱讀狀態分開；尚未複核的候選資料不進入遊戲。首輪預覽標示覆蓋範圍，完整人物及收藏覆蓋另列交付階段。

**Tech Stack:** 既有 React、TypeScript、CSS、Vite；不增加套件。

**Spec:** `docs/chapters/examination-street-life-spec.md`；使用者已確認。

## Global Constraints

- 保留第一幕場景；「原創虛構章節；人物對白為遊戲創作」。
- 頭部小像入畫後保留；提示由樣貌開始，玩家要求才移鏡。
- 見聞冊沿用v4；整張文字美術收尾v3維持撤回，不新增美術版本。
- 主線完成不要求收藏齊全；同類去重、保留首次位置；重尋保留收藏。
- 《宮中鬧元宵》及第二幕維持現況。共用場景改動採可選參數，預設行為不變。
- 不新增或執行測試、建置或型別檢查；每步只記錄實際完成的程式閱讀與被要求的畫面檢視。
- 預覽入口 `/#examination-street-life-preview`；首輪不切換正式第一幕入口。

## Review Focus

1. 箱子與考生熱區重疊：點箱只收藏，點考生才尋人成功（任務1、3）。
2. 比較前提前點人物、重點同一位：不跳過觀察，不增加第二種動作（任務2）。
3. 連點、儲存失敗、舊存檔：同類只收一次；資料不可靠時保留當次可玩性（任務2、4）。
4. 合冊、視窗改變、動畫取消：恢復鏡頭及凝神，狀態不永久鎖住（任務3、4）。
5. 局部缺圖：不在不同底圖人物上啟用局部熱區，提供重試（任務3）。

以上作實作閱讀檢視清單，尚未執行操作驗收；自動化測試須另有使用者要求。

## 任務1：建立可用資料與精確點選

**Files:** 新增 `src/game/examinationStreetLife.ts`、`src/game/examinationHit.ts`；修改 `src/components/ScrollScene.tsx`，僅增加可選點選解析器。

**Interfaces:**

```ts
type TileId = 'board' | 'tea' | 'bridge';
type CategoryId = 'paper-ink' | 'tea-ware' | 'travel-case' | 'cargo-basket';
type LocalShape = {kind:'circle';x:number;y:number;r:number}
  | {kind:'polygon';points:{x:number;y:number}[]};
type Inspectable = {id:string;tile:TileId;shape:LocalShape;
  kind:'person'|'object';sourceId:string;category?:CategoryId};
// 新增 ScrollScene 可選prop；既有呼叫不傳此prop。
type HitResolver = (world:Point, scale:number, size:Size,
  actors:SceneActor[]) => SceneActor|null;
```

- [ ] 讀取v2 `inventory.json`，只選 `source-reviewed`；首輪至少涵蓋目標、兩個比較角色與四類各兩個已近看實例。
- [ ] 為選用人物繪製局部身體輪廓；物件用分開部件形狀，不能把頭部錨點圓當整人熱區。
- [ ] 定義所有部件ID→實例ID→類別ID映射；物件資料含源圖及局部位置。
- [ ] 在 `ScrollScene` 現有pointer-up中，傳入解析器時使用其結果，否則保持原本解析。物件精確形狀優先，人物其後；小物件不以44px擴充區遮住旁人。
- [ ] 第一幕解析器將世界座標轉成局部像素：`tileIndex=floor(world.x/size.width*3)`、`localX=(world.x/size.width*3-tileIndex)*1254`、`localY=world.y/size.height*1254`；依圓或多邊形命中返回對應SceneActor。世界右界夾限至第三段。
- [ ] 對選用資料記錄輪廓、人物／箱子的分離及尚未啟用的覆蓋範圍。

**交付：**第一幕專用資料及點選解析；不更動其他章節的解析結果。

## 任務2：主線、比較及收藏狀態

**Files:** 新增 `src/game/examinationStreetLifeState.ts`、`src/game/examinationStreetLifeStorage.ts`。

**Interfaces:**

```ts
type Phase='intro'|'exploring'|'found'|'observing'|'comparison-done'|'ending'|'complete';
type Origin={instanceId:string;partId:string;tile:TileId;x:number;y:number};
type State={phase:Phase;seen:('read'|'write')[];
  collected:Partial<Record<CategoryId,Origin>>;visits:Record<string,number>;hint:number};
type Action={type:'begin'}|{type:'found'}|{type:'observe'}
  |{type:'compare';kind:'read'|'write'}|{type:'return-bridge'}
  |{type:'finish'}|{type:'collect';category:CategoryId;origin:Origin}
  |{type:'visit';id:string}|{type:'hint'}|{type:'restart'};
```

- [ ] 實作 `examinationReducer(state:State,action:Action):State`。只允許合法階段轉移；`compare`只在observing接受，使用去重的兩種動作。
- [ ] 找到只到found；玩家按觀察才到observing；兩種動作完成到comparison-done，回橋才進ending。
- [ ] 收藏遇到已有類別直接保留原狀；先提交資料才播放回饋。重尋保留collected並重設其他欄位。
- [ ] 實作 `loadExaminationCollection():State['collected']`、`saveExaminationCollection(value:State['collected']):boolean`；鍵為 `chinese-wally.examination-street-life.collection.v1`。
- [ ] 讀檔只接納四類、存在的實例／部件、有效局部座標；不接納其他章節資料。JSON解析或儲存異常返回空收藏／false，當次遊戲繼續。
- [ ] 閱讀檢視Review Focus第2、3項的條件分支，記錄未執行的操作驗收。

**交付：**尋人不等於完成，收藏與主線互不代替。

## 任務3：可玩的尋人與比較預覽

**Files:** 新增 `src/components/ExaminationStreetLifeGame.tsx`、`ExaminationStreetLifeIntro.tsx`、`ExaminationStreetLifeSpeech.tsx`、`src/examination-street-life.css`；修改 `src/main.tsx` 加預覽路由。

**Interfaces:** `ExaminationStreetLifeGame()` 協調任務1資料及任務2 reducer；使用既有 `SceneViewport`、`StudyCommand`、`onInspect(id,anchor)`、`onReady(ready)`。

- [ ] 引言兩步按規格文案；小像先與源圖近看核對。使用既有輔助素材並標示摹繪；不合辨認特徵時用源圖頭部裁圖供預覽，記錄清晰度限制。
- [ ] `ScrollScene requireTiles={true}`、`active={ready && phase!=='intro'}`；阻擋讀取／過渡期間重複操作；圖片失敗保留重試。
- [ ] 增加角落頭部小像、凝神／彩色及分層提示；不圈答案、不在開局展示全身或箱子。
- [ ] 人物回應按獨立visit次數選三句；目標、比較人物與物件按ID分流。自由探索點比較人物只說話。
- [ ] 找到考生顯示短確認與「看看榜前」；按鈕觸發 `dispatch({type:'observe'})` 並發出移鏡命令。
- [ ] 觀察界面點兩位人物，各提交read／write；完成後顯示解讀及「回到橋邊」。
- [ ] 對白尖角跟隨viewport換算，放在人物旁空位；保留正文20px與可見焦點。
- [ ] 在Router增加 `#examination-street-life-preview` 分支指向新控制器；其餘路由保持原分支。

**交付：**可自主尋人並完成一次比較的獨立入口。

## 任務4：收藏、v4冊頁與畫中收尾

**Files:** 新增 `src/components/ExaminationStreetLifeJournal.tsx`、`ExaminationStreetLifeCollection.tsx`、`ExaminationStreetLifeEnding.tsx`；擴充第一幕控制器與專用CSS；將 `output/art-direction/examination-street-life-v4/assets/` 的 `paper-v1.png`、`tea-v1.png`、`case-v1.png`、`basket-v1.png` 複製至 `public/art/examination-street-life/collectibles/`，保留檔名。

**Interfaces:**

```ts
type JournalProps={collected:State['collected'];
 onLook:(origin:Origin)=>void;onClose:()=>void};
type CollectionFlight={category:CategoryId;from:Point;to:Point;token:number};
```

- [ ] 從v4沿用四件圖樣與版面，數量改由collected計算；標示收藏摹繪，不使用固定2／4。
- [ ] 收藏先dispatch與保存，首次再顯現圖樣、飛入冊子按鈕及通知；重複只輕回饋。目的地由按鈕getBoundingClientRect計算，尺寸改變或取消飛行時仍保留成功狀態。
- [ ] 冊頁總覽與詳情分頁，桌面並置／手機上下；詳情依保存的Origin回看，不固定回茶攤範例。
- [ ] 開冊保存viewport與凝神設定；合冊恢復快照及焦點。傳入 `StudyCommand.onSettled` 後再顯示文字，避免移鏡時文字遮人。
- [ ] 畫中收尾使用規格文案及三個出口；用按語交代會合，不新增或指認畫中書童。再尋一次保留收藏。
- [ ] 儲存失敗、缺圖、減少動態與動畫取消均有文字狀態與可用出口；所有定時器在卸載時清除。
- [ ] 更新 `docs/art/examination-street-life-runtime.md`，記錄入口、素材副本、首輪實際覆蓋及未執行檢視。

**交付：**核心流程預覽可供玩家操作；明示人物／收藏覆蓋仍是首輪範圍。

## 任務5：補齊覆蓋與正式入口交付

**Files:** 更新第一幕資料、對白、專用CSS、`docs/chapters/examination-street-life-inventory-review-v2.md`、`docs/art/examination-street-life-runtime.md`；正式入口切換僅在整章後續確認後修改 `src/main.tsx`。

- [ ] 將515個人物待複核及37組收藏逐象限近看處理；錯位、重複與非人物候選撤下，逐個保留原因。
- [ ] 逐段補漏，為每位清晰人物記錄可見依據、輪廓及三句差異化對白；不能直接批量採用活動樣板。
- [ ] 同類收藏全部實例登記與回應，檢視紙／筆、杯／盤、籃／籠、箱／捆包的分類邊界。
- [ ] 定稿資料取代首輪資料，記錄確定數量與不可互動原因；首輪候選數不作完成指標。
- [ ] 保存代表效果、來源與限制；依使用者實際要求執行檢視，沒有執行的項目保持未完成。
- [ ] 提供整章交付供確認。確認後才將正式第一幕入口指向新控制器，保留對照資料。

**交付：**全畫覆蓋完成後的第一幕；不得以任務4核心預覽宣稱整章完成。

## 執行安排

順序1→2→3→4，先提供核心預覽；接續5完成全畫資料。每項完成就記錄實際進度，不新增美術討論輪次。只對自己的檔案作提交，保留工作區其他任務的改動。

計劃自檢：規格的流程、收藏、呈現、錯誤狀態及完整覆蓋均有對應任務；未將TDD或技能中的測試建議轉成未被要求的測試工作。計劃待使用者審閱，產品程式尚未開始修改。
