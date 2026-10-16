# 鍾馗動畫樣段

入口：`http://127.0.0.1:5198/#zhongkui-preview`。獨立預覽，未接入正式章節或正式存檔。

原畫依據：`public/art/lantern-festival/detail-11.jpg`，1276 × 1489。依使用者指定製作中央藍袍長鬚的鍾馗裝扮人物。動畫為轉頭、提袖及手中彎曲道具的小幅動作，腳底固定，五秒後回到完整原畫。周邊人物維持原畫。動作先後與對白為遊戲演繹，不作歷史動作復原。

點中人物直接播放，完成後收入新類別「鍾馗戲裝」，重播不重複收藏。沿用共用題箋、原畫投影、收藏飛入及見聞冊介面。這個預覽含原有六類、爐旁取暖及鍾馗戲裝，共八類；收藏僅保留於當次頁面。

素材：`public/art/animations/lantern-zhongkui/`，收藏插畫：`public/art/collectibles/lantern-zhongkui-v1.png`。生成提示與輸出記錄另存 `generation-records.json`。生成姿勢的衣紋、神態與原畫存在細節差異；片段結束恢復原畫。未新增聲音。

採用 `zhongkui-poses-v2.png`，修正初版中彎曲道具消失、重複與換手的連續性問題；修訂提示見 `pose-continuity-v2.json`。原畫彎曲道具的殘影範圍另加局部修補遮罩。

實際檢視：在瀏覽器點中人物播放並查看中段轉頭提袖；結束後開啟見聞冊，確認「鍾馗戲裝」圖樣與冊頁文字；合冊重播，計數仍為一筆。代表畫面保存於 `output/gameplay-preview/lantern-zhongkui-animation-v2.jpg` 及 `lantern-zhongkui-journal-v1.jpg`。未執行測試或建置。

## 小鬼群像修訂

按使用者要求，加入左後吹奏者、左前俯身小鬼、右側持杖者三組完整姿勢圖。鍾馗先起動，三位小鬼以 0.2／0.4／0.65 秒的延遲接上回應，整段 5.6 秒。四人皆可點中播放同一段，仍只收一筆「鍾馗戲裝」。原畫同類人物不因新增動畫重複收藏。

背景修補只套在四位人物的原畫輪廓內；左前小鬼用右側落地腳作定位，保持俯身時支點穩定。繪製順序為左後人物、持杖人物、鍾馗、左前人物，保留群像前後關係。新增姿勢為遊戲演繹，未新增史實或人物對白。

採用 `rear-poses-v2.png`、`front-poses-v2.png`、`staff-poses-v3.png` 及 `background-v2.png`。持杖初稿的長杖位於人物另一側，已修回原畫的右側位置；初稿與修訂提示均留存。正式定位讀取 `src/game/lanternZhongKuiPoseRegistration.ts`，`group-registration-draft.json` 僅為初稿量測紀錄。

實際檢視：在現有預覽點中左前小鬼及持杖小鬼，兩者皆播放四人群像；查看中段與後段姿勢及播放後返回，見聞冊仍維持一筆。代表畫面：`output/gameplay-preview/lantern-zhongkui-ghosts-v3.jpg`。未執行測試或建置。
