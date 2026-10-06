# 畫中有案 · 榜下尋人

一個約兩分鐘的古風尋人網頁遊戲。原創「科舉放榜日」長卷參照《清明上河圖》的城市風俗畫風。

先由滿版引言頁入畫：直排題字，手動推進放榜日、走散與委託三幕，可返回或略過。進入畫卷後，小型任務控制保留尋人委託，點擊可展開說明。

自行探索畫中人物，收錄抄榜人、茶攤掌櫃與左上榜前圍觀者的三條證詞。把衣衫、方形書箱與石欄等候之約合起來，辨認走散的考生。三位證人可按任意順序訪問。

## 線上遊玩與部署

- 網站：https://vincentttchan.github.io/chinese-wally/
- 儲存庫：https://github.com/vincentttchan/chinese-wally
- 推送至 `main` 後，GitHub Actions 會自動建置並部署至 GitHub Pages。
- 第二卷維持「待展」狀態，待美術及人物位置完成後再開放。

## 啟動

需要 Node.js 22.18 或更新版本。

```sh
npm install
npm run dev -- --port 5188
```

瀏覽器開啟 <http://127.0.0.1:5188/>。

```sh
npm test
npm run build
npm run preview -- --port 5189
```

## 操作

- 拖曳移動畫卷；滾輪、雙指或按鈕縮放。
- 點擊畫中人物，聽取證詞並取得線索。
- 尋人錦囊分三層：思路、區域方向、移動畫卷；選擇「帶我看區域」才會移動鏡頭，不標記答案人物。未收錄的線索簿項目隱藏人物小像與身份。
- 左下角線索簿可展開重讀，保持場景可見；點錯顯示短暫文字；完成後可重玩。
- 畫作開啟即填滿網站視窗；右上角可額外進入瀏覽器全螢幕。
- 右上角可自行開啟輕柔古風撥弦純音樂；曲末交疊淡出淡入，離開頁面時靜音，閱讀證詞時降低音量。
- 茶壺蒸汽有少量微動，可獨立關閉；系統設定減少動態效果時預設停用。
- 「⋯」內可縮放、回到卷首、查看指南或自行打開科舉小知識。畫作開啟即鋪滿網站視窗，左右拖曳探索各段人物。
- 可自行打開科舉小知識，先單獨閱讀資料與史料來源，按「讀完了，答一題」才切換至三選一題；可返回資料重讀；答錯可重選，答對顯示解說並完成閱讀。同一局保留完成狀態，重玩則重置。
- 任務控制預設收起，點擊可展開；底部操作提示在入畫後顯示，探索後消失。
- 放大以滑鼠或雙指中點為中心，最多 175%；鍵盤 ＋／－縮放，Home 回到卷首；縮小下限維持滿版。

## 專案內容

- `src/game/level.ts`：案件、人物文案與相對座標。
- `src/game/state.ts`：遊戲流程。
- `src/components/ScrollScene.tsx`：畫卷、手勢與點擊。
- `public/art/examination-dense-scroll-v3.png`：目前使用的原創 3:1 密集尋人長卷，從確認的第二版樣稿向右延伸至橋頭。
- `public/art/hd/`：三段 1254 × 1254 的細節重製素材，在同一畫卷內拼接顯示，有效畫面 3762 × 1254；原主圖留作載入底圖。
- `public/art/hd/bridge-v2.png`：目前橋頭段，書生已分散並融入人群；全卷以共用淡彩色彩呈現降低飽和度及硬對比。
- `docs/art/examination-dense-scroll-v3-final-prompt.txt`：目前長卷的最終生成提示。
- `public/art/ui/`：手繪圖示與紙箋美術；介面已移除 Lucide SVG 圖示。
- `output/art-direction/examination-crowd-study-v2.png`：已確認的局部美術樣稿，為目前長卷的延伸素材。
- `docs/superpowers/specs/2026-10-05-scroll-mystery-design.md`：已確認的設計。
- `docs/introduction-and-hd-art.md`：引言頁、高清分段、生成提示及對位記錄。

遊戲場景及案件為虛構；真實古畫關卡留作後續設計。

## 第二卷：廟會尋蹤・微服出巡（製作中）

獨立的城鎮廟會案件，以人物證詞、補扇物件、看客目光三類線索辨認微服的皇帝。已加入獨立引言、線索資料、分層提示、結局與廟會閱讀題；兩名看客的觀察合併為同一條線索，換卷重新建立一局。

使用者已提供廟會原圖，並完成線索與比例修圖；高清局部與視覺驗收記錄見 `docs/art/temple-fair-visual-review.md`。第二卷目前在引言顯示「待展」。人物座標仍是設計估算，需要依最終美術定位。美術完成後，接入全景與高清段、確認人物細節與熱區，再將 `src/game/chapters.ts` 的 `available` 設為 true，便可從 `#temple-fair` 或選卷入口開啟。

設計與文案見 `docs/temple-fair-design.md`、`docs/temple-fair-copy.md`；三次內建生成提示及介面規格見 `docs/art/temple-fair-*.txt` 與 `docs/art/temple-fair-ui-spec.md`。第一卷原美術、人物與科舉閱讀保留。

## 聲音來源

目前配樂為 Sascha Ende 的 Chinese Restaurant Background 4（CC BY 4.0），音檔本地提供。來源、署名、授權與處理方式見 `public/audio/CREDITS.md`，遊玩指南亦附署名連結。原環境聲素材保留作歷程參考，目前不播放。
