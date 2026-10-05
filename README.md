# 畫中有案 · 榜下尋人

一個約兩分鐘的古風尋人網頁遊戲。原創「科舉放榜日」長卷參照《清明上河圖》的城市風俗畫風。

先在畫中點擊抄榜人與茶攤掌櫃，取得兩條證詞；結合線索，再從橋邊的人群中找出走散的考生。

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
- 提示先圈出區域，再圈出人物。
- 線索卡可重讀；點錯可繼續探索；完成後可重玩。

## 專案內容

- `src/game/level.ts`：案件、人物文案與相對座標。
- `src/game/state.ts`：遊戲流程。
- `src/components/ScrollScene.tsx`：畫卷、手勢與點擊。
- `public/art/examination-scroll.png`：使用內建 imagegen 生成的原創長卷。
- `docs/art/examination-scroll-prompt.txt`：最終生成提示。
- `docs/superpowers/specs/2026-10-05-scroll-mystery-design.md`：已確認的設計。

遊戲場景及案件為虛構；真實古畫關卡留作後續設計。
