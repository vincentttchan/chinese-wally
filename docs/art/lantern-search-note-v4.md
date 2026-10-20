# 尋人小箋 v4

2026-10-08 · 內建 imagegen 模式。

## 已採用

專案：`public/art/ui/lantern-search-note-v4.png`。
生成原檔：`/Users/vincentttchan99/.codex/generated_images/01a109e6-c941-7a61-8db8-b133d39f2378/exec-57dcfbb0-c927-4573-87de-42a33141a556.png`。
參考頭像：`public/art/portraits/xianzong-recognition-v2.png`。

整張圖片已含紙張、頭像、文字與操作標記。取消雙重框線、區隔線及重複底部標籤。改成寬幅小箋，頭像、問題和短句形成單一構圖。頭像為辨認用摹繪，沒有衣服及場景；沒有改寫歷史原畫。

三個透明語義按鈕對齊圖中的關閉、回畫中找找、再給提示。保留焦點限制、Tab / Enter / Escape、焦點圈與替代文字。切換提示階段時重新聚焦對話框。進階提示按庭院顯示原畫局部。

v3的制式框卡未採用；其提示記錄保留於同目錄供追溯。v4才是實際入口使用的整張美術卡。

## 完整提示詞

```
Use case: ui-mockup. Create the production artwork for a beautifully composed, quiet Chinese painting game "尋人小箋", one complete raster note including all typography. The attached image is the identification head; insert that exact face, cap and beard faithfully, do not redesign him.
Art direction: restrained contemporary Chinese museum editorial design on a little piece of warm ivory silk, with extremely fine fibres and natural softly feathered paper edges. Wide intimate note, aspect 2.1:1, nearly full bleed on a truly transparent outside margin of less than 2%. Completely REMOVE all framing rules, double borders, corner brackets, separators, seals, ornaments and boxes. No oversized title, no large bold calligraphy, no heavy paper distress, no decorative flowers. No cast shadow. No webpage, no device mockup.
Composition is ONE balanced visual group rather than a stack of UI blocks:
The head portrait on the LEFT, centered x23%, y50%, from y23% to77%, with no neck, shoulders or robe. Fine natural painted silhouette and beard ends, no hard square or polygon crop; very subtle pale ink wash immediately behind the beard tip blends it into the silk, no oval outline or conspicuous circle. Do not make the portrait huge.
RIGHT column begins x44%. Refined thin dark olive-grey Chinese Kai/regular-script lettering, even weights and careful quiet spacing. Must render exact TRADITIONAL Chinese text. Typography should be typeset-looking scholarly regular script, NOT broad brush calligraphy. Main title equivalent only 20px at 560px display width; body 15px.
Exact text and anchors:
1. At x8%, y13%, a small widely spaced label: "尋人"
2. Main heading right at x44%, y32%: "可曾見過此人？"
3. One smaller line below at x44%, y49%: "認清眉眼，留意鬍鬚。"
4. Main quiet action at x44%, y70%: "回畫中找找" with a very small right arrow immediately after it; fine short underline only below the action label. No filled button.
5. Small discreet portrait caption centered x23%, y87%: "辨認用摹繪"
6. Small secondary action ending x92%, y87%: "再給提示"; no ornament.
7. A small delicate close × centered x93%,y12%, NOT a giant X.
No other text. Plenty of breathing room but no awkward empty centre. Extremely light warm neutral paper (#f1ecde), muted dark olive ink (#46503f). Entire portrait, words and paper rendered as one coherent 2D artwork. Outside silk edges genuinely transparent. Avoid yellow antique parchment, fat black calligraphy, symmetrical generic popup cards, bold framing, giant isolated head, extra icons or interface chrome.
```

執行 `npm run build`；未新增或執行測試。

