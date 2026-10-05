# 榜下尋人：配樂與環境聲來源

## 目前使用的配樂

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
