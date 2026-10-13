import { useEffect, useState } from 'react';
import { ScrollScene } from './ScrollScene.tsx';
import type { SceneViewport } from './ScrollScene.tsx';
import { LanternDialogue } from './LanternDialogue.tsx';
import type { DialogueLayout } from './LanternDialogue.tsx';
import { lanternActors, lanternFullScroll, lanternSize, lanternTiles } from '../game/lanternFestival.ts';
import '../lantern.css';
import '../lantern-dialogue-preview.css';

const emperor = lanternActors.find(actor => actor.id === 'emperor-second')!;
const sceneCommand = {region: {x: emperor.x, y: emperor.y}, scaleRatio: 1.1, token: 1};
const ignoreInspect = () => {};
export function LanternDialoguePreview() {
  const [layout, setLayout] = useState<DialogueLayout>('adjacent');
  const [ready, setReady] = useState(false);
  const [font, setFont] = useState<'kai' | 'song'>('kai');
  const [fontSize, setFontSize] = useState(20);
  const [following, setFollowing] = useState(false);
  const [viewport, setViewport] = useState<SceneViewport>({view: {x: 0, y: 0, scale: 1}, frame: {width: 1280, height: 800}});
  useEffect(() => {
    const previous = document.title; document.title = '對白版式比較 · 宮中鬧元宵';
    return () => {document.title = previous;};
  }, []);
  const anchor = {x: viewport.view.x + emperor.x * lanternSize.width * viewport.view.scale,
    y: viewport.view.y + emperor.y * lanternSize.height * viewport.view.scale};
  const select = (value: DialogueLayout) => {setLayout(value); setFollowing(false);};
  return <main className="immersive-game lantern-game lantern-dialogue-preview">
    <ScrollScene image={lanternFullScroll} tiles={lanternTiles} artworkSize={lanternSize} requireTiles actors={[]}
      active blocked resetKey={0} hint={null} onInspect={ignoreInspect} onReady={setReady} motion={false} steam={null}
      initialRegion={sceneCommand.region} studyCommand={sceneCommand} onViewportChange={setViewport}
      study={{region: sceneCommand.region, height: emperor.height, monochrome: false}}
      title="憲宗元宵行樂圖" description="原畫第二庭院，用相同視角比較人物旁對白與下方字幕"/>
    <header className="lantern-dialogue-preview-tools">
      <div><h1>對白版式比較</h1><div className="lantern-dialogue-switch" role="group" aria-label="選擇對白版式">
        <button aria-pressed={layout === 'adjacent'} onClick={() => select('adjacent')}><span>A</span>人物旁短對白</button>
        <button aria-pressed={layout === 'subtitle'} onClick={() => select('subtitle')}><span>B</span>畫面下方字幕</button>
      </div>
      <div className="lantern-dialogue-type-controls">
        <div role="group" aria-label="對白字體"><button aria-pressed={font === 'kai'} onClick={() => setFont('kai')}>楷體</button><button aria-pressed={font === 'song'} onClick={() => setFont('song')}>宋體</button></div>
        <label>字級<input type="range" min="20" max="30" step="1" value={fontSize} aria-label="對白文字大小" onChange={event => setFontSize(Number(event.target.value))}/><output>{fontSize}</output></label>
      </div></div>
      <a href="#lantern-festival">回到遊戲</a>
    </header>
    {ready && <LanternDialogue font={font} fontSize={fontSize} layout={layout} viewport={viewport} anchor={anchor}
      speaker={following ? '下一段行蹤' : '明憲宗'} personWidth={emperor.width * lanternSize.width * viewport.view.scale}
      lines={following ? ['循着獻藝的線索，', '再找他的身影。'] : ['買賣看過了，', '再去瞧瞧獻藝的熱鬧。']}
      actionLabel={following ? '再聽一次' : '循線尋人'} onContinue={() => setFollowing(value => !value)}/>}
    <p className="lantern-dialogue-preview-note">版式試作 · 對白為遊戲虛構</p>
  </main>;
}
