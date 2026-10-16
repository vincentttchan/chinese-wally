# 鼓手擊鼓動畫樣段 — 2026-10-16

## 交付

- 原畫：`public/art/lantern-festival/detail-13.jpg`，左下方藍衣鼓手。原畫檔保持不變。
- 入口：`#drummer-preview`。沿用既有 ScrollScene、LanternPaintingTarget、LanternPaintingNote 及動畫圖層樣式。
- 點人物或「播放試作」播放4秒；兩次抬槌、擊鼓、回彈，淡出後完全移除演繹層，回到原畫。可重播。
- 此版為獨立樣段，尚未加入正式遊戲人物點擊流程。
- 減少動態時呈現第一個靜態姿態；載入失敗仍保留原畫與重試入口。這兩項為程式處理，尚未實際操作確認。
- 未新增鼓聲。

## 素材

使用內置 image_gen（非 CLI）。

- `public/art/animations/lantern-drummer/poses-v1.png`：2172×724 RGBA，四槽543px；依鼓與腳的位置作水平對位，保留原檔透明度。
- `public/art/animations/lantern-drummer/background-v1.png`：1161×1354 RGB；顯示時映回原畫尺寸，僅以羽化輪廓遮罩顯示修補部分。
- 人物層縮放 .444，共用原畫投影矩陣與 painting-grade；不是歷史畫面或演奏方式的精確復原。

## 已檢視與限制

- 已在 Codex 內置瀏覽器開啟1280×720預覽、觸發播放，並確認結束後顯示原畫及「再看一次」。
- 四個生成姿態保持相同腳底高度；人物細節與原畫有摹繪差異，接合與動作幅度仍供使用者審閱。
- 未執行測試套件、建置或手機檢視。

## 生成提示詞：姿態

Use case: precise-object-edit, historical painting animation sprites. Reference image: original Ming court painting. Extract ONLY the lower LEFT navy-blue robed DRUMMER at approximately x45..215 y1140..1420 in the 1286x1500 reference, facing LEFT with pale face in left profile, black Ming cap, white neck shawl, red belt, dark navy robe with tiny pale gold motifs, black boots, TWO thin red drumsticks and shallow circular horizontal red-and-cream waist drum suspended in front to his LEFT. Do not include red musician behind him or green musician. Preserve exact source costume, slender proportions, ink contours, subdued aged silk paint palette, oblique flattened perspective. Create ONE transparent PNG ultra-wide 3:1 sprite strip with FOUR EXACTLY EQUAL slots, one complete drummer plus attached waist drum in EACH slot, fixed identical scale and positions, same feet baseline and same stationary waist drum. Full head and boots visible, ample transparent margin, no scenery, no paper, no text, no ground shadow. Frame 1: original pose, both thin red sticks raised near drum; frame2: right forearm lifts slightly to prepare a beat; frame3: right stick tip lowers to touch drumhead, left hand slightly raised, torso leans at most 2 degrees; frame4: right hand rebounds gently to original. Only small natural arm movements. Drum remains fixed on waist, feet remain fixed, face always faces left. Match source drawing rather than redesigning as cartoon. No additional people, extra limbs, giant drum, sound effects or motion lines. Four identical framing slots with all feet aligned. True transparent alpha.

## 生成提示詞：底圖

Use case: precise-object-edit. Edit target: supplied original historical painting 1286x1500. Create a clean animation background plate preserving EXACT full composition and pixel alignment, original aspect ratio, camera and aged silk color. Remove ONLY the lower LEFT navy-blue robed drummer, his thin red sticks and cream/red shallow waist drum: approximately x43..215 y1140..1420. The drummer faces left in front of the red-robed flute player. Reconstruct only the silk ground behind his silhouette and the tiny occluded portion of the red-robed flute player's lower clothing. KEEP red flute player behind, green flute player at right, left edge cropped figures, all lanterns, bamboo, acrobats, red table, all other painting details perfectly unchanged. No cropping or repositioning. No blur patch, no brighter yellow, no new people, no text. This is a background repair for a temporary animation overlay, match adjacent ochre silk texture precisely.
