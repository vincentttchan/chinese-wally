# 畫中尋人：各章配樂與環境聲來源

## 洛神賦圖獨立配樂 · 2026-10-15

- 曲目：《洛水微波》；本地檔案：`luoshen-music.wav`，48秒、24kHz、單聲道PCM。
- 作者及來源：本專案原創程式合成，生成方法保存於 `scripts/generate-luoshen-audio.py`；沒有外部採樣或改編既有曲目，無第三方音源署名義務。
- 現代五聲音階背景配樂，不是魏晉或宋代音樂復原。沿用 `chapterMusic.js` 及手繪音樂開關，由玩家開啟，閱讀時降音量，離開章節停止。

## 2026-10-13：每章獨立配樂

| 章節 | 曲目／作者 | 本地音檔 | 來源 |
|---|---|---|---|
| 宮中鬧元宵 | Chinese Restaurant Background 4／Sascha Ende | `scroll-music.mp3` | [曲目頁](https://ende.app/en/song/12393-chinese-restaurant-background-4) |
| 榜下尋人 | Chinese Restaurant Background 8／Sascha Ende | `examination-music.mp3` | [曲目頁](https://ende.app/en/song/12397-chinese-restaurant-background-8) |
| 在人群中聽樂 | Chinese Restaurant Background 7／Sascha Ende | `kangqu-music.mp3` | [曲目頁](https://ende.app/en/song/12396-chinese-restaurant-background-7) |

原有曲目依下方既有 CC BY 4.0 來源紀錄保留；本次新增兩首曲目頁亦標示 CC BY 4.0。遊戲各章的來源說明保留作者、曲名、曲目頁與授權連結。這些是現代背景配樂，不是畫中歷史演奏曲目的復原。

新增音檔於 2026-10-13 由曲目頁公開音源取得，未修改原音檔；兩首均為雙聲道、48kHz、128kbps MP3，檔案實際時長約 131.16 秒。網站用 Web Audio 低音量播放、閱讀時降低音量、曲末 4 秒交疊；直接開啟本地檔案時使用音訊元素循環，音量漸變。玩家自行開啟，切換到背景時靜音，離開章節釋放播放資源。所有曲目在遊戲內由本地資產播放。

- Chinese Restaurant Background 8 by Sascha Ende — ende.app. License: CC BY 4.0.
  - 公開音源：`https://ende.app/storage/mp3low/67e0a847-ee6f-4254-9461-fab048384fb5.mp3`
  - SHA256：`0fc1757554a51d3359a5e8f483e609b43387cbff014b4a4fe6e590e43c72ebe8`
- Chinese Restaurant Background 7 by Sascha Ende — ende.app. License: CC BY 4.0.
  - 公開音源：`https://ende.app/storage/mp3low/72c3e60f-96e5-4ad1-992c-3b730b653c10.mp3`
  - SHA256：`6482317dfc38cc81cc0ffc96180197b5e065e38bba088442074beedb17ca4292`

## 宮中鬧元宵原有配樂記錄

- 本地檔案：`scroll-music.mp3`。
- 曲目：**Chinese Restaurant Background 4**。
- 作者：**Sascha Ende**。
- [曲目及下載來源](https://ende.app/en/song/12393-chinese-restaurant-background-4)。
- [作者授權頁](https://ende.app/en/standard-license)；[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。
- 原音檔 URL：`https://ende.app/storage/mp3low/19e2e9f0-e19d-4fd5-b621-12188c7c1849.mp3`（曲目頁提供的音源）。
- 於 2026-10-05 取得，MP3、128 kbps，約 2 分 12 秒。慢速撥弦純音樂；音檔內容未修改，遊戲播放時加入低音量、曲末 4 秒交疊淡入淡出及閱讀時降低音量。
- 署名：Chinese Restaurant Background 4 by Sascha Ende — ende.app. License: CC BY 4.0.
- 遊玩指南提供曲目、作者及授權連結。遊戲本地播放，不向音樂供應者發送玩家資訊。

## 原環境聲（目前不播放）


Both recordings below were released into the public domain by their authors via PDSounds, and are served locally. No account or remote audio service is used during play.

| Local file | Recording / author | Source | Treatment |
| --- | --- | --- | --- |
| `crowd.ogg` | Restaurant Ambience / stephan | [Wikimedia Commons source and public-domain notice](https://commons.wikimedia.org/wiki/File:Restaurant_ambience.ogg) | Quiet looping bed, low-pass filtering at 850 Hz to make modern speech indistinct. Used as crowd texture for a fictional setting, not an authentic historical recording. |
| `tea.ogg` | Boiling water being poured into a mug for tea / cori | [Wikimedia Commons source and public-domain notice](https://commons.wikimedia.org/wiki/File:Boiling_water_being_poured_into_a_mug_for_tea.ogg) | Low gain, occasional playback with fades and a slight stereo offset. |

Original downloads:
- https://upload.wikimedia.org/wikipedia/commons/b/b5/Restaurant_ambience.ogg
- https://upload.wikimedia.org/wikipedia/commons/6/69/Boiling_water_being_poured_into_a_mug_for_tea.ogg

The previous implementation generated footsteps using decaying filtered noise and a low-frequency impact tone. That playback code has been replaced by the instrumental music engine.

## 清明上河圖獨立配樂 · 2026-10-13

- 曲目：Chinese Restaurant Background 5；作者：Sascha Ende。
- 本地音檔：`qingming-music.mp3`。
- [曲目與署名](https://ende.app/en/song/12394-chinese-restaurant-background-5)；[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。
- 曲目頁公開音源：`https://ende.app/storage/mp3low/d8019484-8519-4ac5-92cd-ec933fabe8bb.mp3`。
- SHA-256：`f323097c1727128076e95da70212465ee69d9d7a8af9834ecebf4c52be4abd72`。
- 音檔未修改；本章沿用共用音樂引擎與手繪開關，由玩家自行開啟。現代背景配樂，不是北宋曲目復原。
