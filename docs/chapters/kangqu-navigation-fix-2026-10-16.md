# 「在人群中聽樂」封面導航補齊

原因：主程式 ChapterLinks 已使用 historicalChapters.ts 的現行章節清單，但獨立康衢章節的 shell 保留舊版三入口，缺少洛水之間與清明上河圖。

修正 v1.2/build-artifacts.py，產生獨立頁時讀取同一份 historicalChapters.ts，保留既有榜下尋人入口及目前章節標示，跨章節連結使用頂層頁面。重新執行 package-kangqu-chapter.py --runtime-only 更新本機封裝頁與來源記錄，未重新處理畫作素材。

實際檢視：本機 #kangqu-listening 顯示五個入口；從內嵌章節點清明上河圖可到頂層清明引言，再點在人群中聽樂返回封面，未留在內嵌框中。畫面：output/gameplay-preview/kangqu-chapter-navigation-v2.jpg。未執行測試或應用程式建置，尚未推送 GitHub。

後續使用者表示目前 `/index.html#kangqu-listening` 仍看不清更新。實讀該頁已有五入口，但繼承的 11px／9px 導航字體在原畫背景上過小。將該封面導航調為 16px／12px，保留共用字體、底線及換行樣式；內嵌頁 URL 加入章節導航版本參數，避免沿用舊文件。重新載入使用者正在看的原分頁確認五入口。此處仍為本機更新。

使用者再指出排列或位置有問題：放大後單行導航延伸到原畫深色部分。改為左下方兩欄、三行，寬度最多 380px，依原章節順序從左至右閱讀，不再橫跨畫面。沿用字體與目前章節底線；窄螢幕字級為 14px／11px。更新內嵌文件版本參數並重新封裝，實際在使用者目前分頁檢視。


## 依參考截圖修正字級

使用者指出放大的導航字級不符參考。移除章節專用字級、行高、連結內距及間距覆寫，回用共用導航設定：章節 11px、朝代 9px、項目間距 18px；保留單行排列及目前章節底線。此版本取代前述兩欄及放大字級方案。

已重新封裝 runtime 並更新目前本機分頁，透過瀏覽器確認實際計算字級為 11px / 9px、nowrap，保存畫面於 `output/gameplay-preview/kangqu-chapter-navigation-v5.jpg`。未新增或執行測試。
