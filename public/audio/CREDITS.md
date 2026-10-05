# 榜下尋人：環境聲

Both recordings below were released into the public domain by their authors via PDSounds, and are served locally. No account or remote audio service is used during play.

| Local file | Recording / author | Source | Treatment |
| --- | --- | --- | --- |
| `crowd.ogg` | Restaurant Ambience / stephan | [Wikimedia Commons source and public-domain notice](https://commons.wikimedia.org/wiki/File:Restaurant_ambience.ogg) | Quiet looping bed, low-pass filtering at 850 Hz to make modern speech indistinct. Used as crowd texture for a fictional setting, not an authentic historical recording. |
| `tea.ogg` | Boiling water being poured into a mug for tea / cori | [Wikimedia Commons source and public-domain notice](https://commons.wikimedia.org/wiki/File:Boiling_water_being_poured_into_a_mug_for_tea.ogg) | Low gain, occasional playback with fades and a slight stereo offset. |

Original downloads:
- https://upload.wikimedia.org/wikipedia/commons/b/b5/Restaurant_ambience.ogg
- https://upload.wikimedia.org/wikipedia/commons/6/69/Boiling_water_being_poured_into_a_mug_for_tea.ogg

The soft footstep sounds are generated in `src/audio/useAmbience.ts` using decaying filtered noise and a low-frequency impact tone. They do not use third-party samples.
