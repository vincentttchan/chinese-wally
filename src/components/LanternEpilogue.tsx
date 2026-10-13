import {useEffect,useRef,useState} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import {lanternPersonRegion} from '../game/lanternStudy.ts';
import {LanternPaintingNote} from './LanternPaintingNote.tsx';
import {LanternPaintingTarget} from './LanternPaintingTarget.tsx';
import {LanternAcrobatAnimation,lanternAcrobatRegion} from './LanternAcrobatAnimation.tsx';
import {LanternMarketAnimation,lanternMarketRegion} from './LanternMarketAnimation.tsx';
import '../lantern-observation.css';

type Stage='arrival'|'story'|'question'|'story-reveal'|'history'|'history-reveal'|'summary';
export type ReviewDetail='scene'|'market'|'performance';
type Props={completed:boolean;initialScene:number;viewport:SceneViewport;collected:number;onJournal:()=>void;onComplete:()=>void;onClose:()=>void;onRestart:()=>void;
  onLook:(index:number,detail:ReviewDetail,transition:'pan'|'crossfade',settled:()=>void)=>void};
const scenes=[{label:'爆竹',caption:'坐在黃幔下，觀看庭前爆竹。'},{label:'街市',caption:'站在石台旁，觀看宮中街市。'},{label:'表演',caption:'再次坐於帳幔下，觀看庭院表演。'}];
const history=[{label:'宮中街市',scene:1,detail:'market' as const,id:'market',text:'宮苑裡仿設街市，貨郎擔吸引童子圍看。民間節俗，也成為宮廷安排的元宵活動。'},
  {label:'庭院獻藝',scene:2,detail:'performance' as const,id:'acrobat',text:'童子與藝人配合獻藝，畫家仔細描繪他們的姿勢。爆竹、街市與表演，一起構成畫中的宮廷元宵。'}];
export function LanternEpilogue({completed,initialScene,viewport,collected,onJournal,onComplete,onClose,onRestart,onLook}:Props){
  const [stage,setStage]=useState<Stage>(completed?'summary':'arrival');
  const [viewed,setViewed]=useState(initialScene),[visited,setVisited]=useState<number[]>([]);
  const [answer,setAnswer]=useState<number|null>(null);
  const [historyIndex,setHistoryIndex]=useState(0),[historySeen,setHistorySeen]=useState<number[]>([]);
  const [busy,setBusy]=useState(true);
  const [playing,setPlaying]=useState<'market'|'acrobat'|null>(null),[animationIssue,setAnimationIssue]=useState(false);
  const note=useRef<HTMLElement>(null),live=useRef(true),running=useRef(true),animation=useRef<Animation|null>(null);
  const lookRef=useRef(onLook);lookRef.current=onLook;
  const composition=useRef<{index:number;detail:ReviewDetail}>({index:initialScene,detail:'scene'});
  const compact=viewport.frame.width<700;
  const reveal=()=>{if(!live.current)return;running.current=false;setBusy(false);note.current?.focus({preventScroll:true});};
  useEffect(()=>{live.current=true;running.current=true;setBusy(true);lookRef.current(composition.current.index,composition.current.detail,'pan',reveal);
    return()=>{live.current=false;animation.current?.cancel();};},[compact]);
  const change=async(next:Stage,view?:{index:number;detail:ReviewDetail},update?:()=>void)=>{
    if(running.current)return;running.current=true;setBusy(true);
    if(note.current&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      animation.current=note.current.animate([{opacity:1},{opacity:0}],{duration:160,easing:'ease-in'});
      try{await animation.current.finished;}catch{return;}
    }
    if(!live.current)return;
    update?.();setStage(next);
    if(view){composition.current=view;setViewed(view.index);lookRef.current(view.index,view.detail,'pan',reveal);}else reveal();
  };
  const finishHistoryAnimation=()=>{setPlaying(null);running.current=false;setBusy(false);setHistorySeen(previous=>[...new Set([...previous,historyIndex])]);void change('history-reveal');};
  const playHistoryAnimation=async()=>{
    if(running.current||playing)return;
    running.current=true;setBusy(true);setAnimationIssue(false);
    if(note.current&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      animation.current=note.current.animate([{opacity:1},{opacity:0}],{duration:180,easing:'ease-in'});
      try{await animation.current.finished;}catch{return;}
    }
    if(live.current)setPlaying(historyIndex===0?'market':'acrobat');
  };
  const next=(label:string,action:()=>void)=><button className="lantern-note-next" onClick={action}>{label}<span aria-hidden="true">→</span></button>;
  const stageLabel=stage==='arrival'?'尋得三次身影':stage==='summary'?'長卷的發現':stage.startsWith('story')||stage==='question'?'回看長卷 · 1 / 2':'宮廷元宵 · 2 / 2';
  const title=stage==='arrival'?'同一位皇帝，為甚麼畫三次？':stage==='question'?'三次身影，怎樣連起故事？':stage==='story'?'回到他的身影旁':stage==='story-reveal'?'一卷裡，時間也在前進':stage==='history'?'皇宮裡，也有這些熱鬧':stage==='history-reveal'?history[historyIndex].label:'尋得人物，也讀懂長卷';
  return <div className="lantern-inpainting-review" aria-label="長卷中的最後探索" aria-busy={busy}>
    {!busy&&stage==='story'&&<LanternPaintingTarget region={lanternPersonRegion(viewed)} viewport={viewport} label={`觀察${scenes[viewed].label}庭院的皇帝身影`} hint="輕點他的身影" onClick={()=>setVisited(previous=>[...new Set([...previous,viewed])])}/>}
    {!busy&&stage==='history'&&<LanternPaintingTarget region={historyIndex===1?lanternAcrobatRegion:lanternMarketRegion} viewport={viewport} label={`觀察${history[historyIndex].label}`} hint={`輕點${historyIndex===0?'貨郎或童子':'表演人物'}`} onClick={()=>void playHistoryAnimation()}/>}
    {playing==='acrobat'&&<LanternAcrobatAnimation viewport={viewport} onDone={finishHistoryAnimation} onError={()=>{setAnimationIssue(true);finishHistoryAnimation();}}/>}
    {playing==='market'&&<LanternMarketAnimation viewport={viewport} onDone={finishHistoryAnimation} onError={()=>{setAnimationIssue(true);finishHistoryAnimation();}}/>}
    <LanternPaintingNote index={viewed} viewport={viewport} label={stageLabel} title={title} busy={busy} noteRef={note}>
      {stage==='arrival'&&<><p className="lantern-note-body">你已找到三次身影。回到原畫，比較他的姿勢與周圍活動。</p>{next('回看他的身影',()=>void change('story',{index:0,detail:'scene'}))}</>}
      {stage==='story'&&<>
        <nav className="lantern-note-tabs" aria-label="回看三處身影">{scenes.map((scene,index)=><button key={scene.label} aria-pressed={viewed===index} onClick={()=>void change('story',{index,detail:'scene'})}>{scene.label}{visited.includes(index)&&<span className="lantern-note-seen" aria-label="已觀察"> ✓</span>}</button>)}</nav>
        <p className="lantern-note-body" aria-live="polite">{visited.includes(viewed)?scenes[viewed].caption:'輕點畫中的皇帝，留意他的姿勢與眼前活動。'}</p>
        <p className="lantern-note-caption">已觀察 {visited.length}／3 處</p>
        {visited.length===3?next('說說你的發現',()=>void change('question')):visited.includes(viewed)&&next('看下一處身影',()=>{const index=[0,1,2].find(i=>!visited.includes(i))!;void change('story',{index,detail:'scene'});})}
      </>}
      {stage==='question'&&<><p className="lantern-note-body">{'面孔相同，衣着與活動卻不同。\n三次身影，有甚麼關係？'}</p>
        <div className="lantern-note-choices" role="group" aria-label="三次身影的關係">{['同一瞬間','同一人，經歷不同活動','三位不同皇帝'].map((text,index)=><button key={text} aria-pressed={answer===index} onClick={()=>setAnswer(index)}>{text}</button>)}</div>
        {answer!==null&&answer!==1&&<p className="lantern-note-caption" role="status">再想想：面孔相同，眼前的活動卻改變了。</p>}{answer===1&&next('看看長卷怎樣說故事',()=>void change('story-reveal'))}</>}
      {stage==='story-reveal'&&<><p className="lantern-note-body">同一位皇帝反覆出現，把不同時空的活動連在一卷裡。</p><p className="lantern-note-body">國博稱之為「連環畫式構圖」。隨着展卷，我們也跟着人物走進下一段故事。</p>{next('看看宮中怎樣過元宵',()=>void change('history',{index:1,detail:'market'},()=>setHistoryIndex(0)))}</>}
      {stage==='history'&&<><p className="lantern-note-body">{historyIndex===0?'輕點貨郎或童子，看看小物怎樣吸引他們。這樣的街市景象，為甚麼出現在皇宮？':'輕點輪上的童子，看看輪上與輪下，兩人怎樣配合。'}</p><p className="lantern-note-caption">回到畫中，找找節慶生活的證據。</p></>}
      {stage==='history-reveal'&&<>
        {historyIndex===1?<><p className="lantern-note-body">{'下方藝人用腳托輪，\n上方童子站在輪上吹奏。'}</p><p className="lantern-note-caption">輪上與輪下，兩人怎樣配合保持平衡？</p>
          </>:<><p className="lantern-note-body">{history[historyIndex].text}</p><p className="lantern-note-caption">留意小物與圍看的童子：宮廷如何把街市的熱鬧帶進宮苑？</p></>}
        <button className="lantern-note-secondary" onClick={()=>void playHistoryAnimation()}>再看一次演繹</button>
        {animationIssue&&<p className="lantern-note-caption" role="status">動畫暫未載入，仍可觀察原畫；點擊可重試。</p>}

        {historySeen.length<2?next('再看庭院獻藝',()=>void change('history',{index:2,detail:'performance'},()=>setHistoryIndex(1))):<><p className="lantern-note-caption">畫卷呈現的是宮廷安排的節慶；了解百姓生活，仍需結合其他史料。</p>{next('收下這一卷的發現',()=>void change('summary',undefined,onComplete))}</>}</>}
      {stage==='summary'&&<><p className="lantern-note-body">三次身影，連起不同時空；爆竹、街市與表演，留下宮廷元宵的見聞。</p><p className="lantern-note-caption">觀察已完成，畫中仍有更多見聞。</p>{next('留在畫中，自由探索',onClose)}
        {collected>0&&<button className="lantern-note-secondary" onClick={onJournal}>回看已收藏的 {collected} 則見聞</button>}
        <details className="lantern-note-sources"><summary>畫作資料與來源</summary><p>明代 · 佚名 · 絹本設色<br/>中國國家博物館藏</p><a href="https://www.chnmuseum.cn/zl/zlhg/201812/t20181220_32517.shtml" target="_blank" rel="noreferrer">構圖介紹 · 國博</a><a href="https://www.chnmuseum.cn/portals/0/web/zt/202102yuaxiao/" target="_blank" rel="noreferrer">畫作與節俗 · 國博</a></details><button className="lantern-note-secondary" onClick={onRestart}>再尋一次</button></>}
    </LanternPaintingNote>
  </div>;
}
