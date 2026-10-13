import {assetPath} from '../game/assets.ts';
import {useEffect,useReducer,useRef,useState} from 'react';
import {ChapterLinks} from './ChapterLinks.tsx';
import {returnToChapterCover} from '../game/chapterCover.ts';
import type {CSSProperties} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneViewport,StudyCommand,SceneCommand} from './ScrollScene.tsx';
import {actors,people,objects,categories,tiles,toRegion} from '../game/examinationStreetLife.ts';
import type {CategoryId} from '../game/examinationStreetLife.ts';
import {examinationHit} from '../game/examinationHit.ts';
import {examinationReducer,initialState} from '../game/examinationStreetLifeState.ts';
import type {Origin} from '../game/examinationStreetLifeState.ts';
import {loadExaminationCollection,saveExaminationCollection} from '../game/examinationStreetLifeStorage.ts';
import {ArrowRight,BookOpen,CircleHelp,MoreHorizontal,Maximize,Volume2,VolumeX} from './ArtIcons.tsx';
import {LanternNavigator} from './LanternNavigator.tsx';
import {useAmbience} from '../audio/useAmbience.ts';
import {chapterMusicTracks} from '../audio/chapterMusicTracks.js';
import {ChapterDialog,useChapterFocus} from './ChapterDialog.tsx';
import {LanternNotice} from './LanternNotice.tsx';
import type {ObjectInstance} from '../game/examinationStreetLife.ts';
import '../lantern-spark.css';
import {placeLanternReply} from '../game/lanternReply.ts';
import '../lantern.css';
import '../lantern-journal.css';
import '../lantern-search-hud.css';
import '../lantern-field-journal.css';
import '../lantern-observation.css';
import '../examination-street-life.css';
export function ExaminationStreetLifeGame(){
 const [state,dispatch]=useReducer(examinationReducer,undefined,()=>initialState(loadExaminationCollection()));
 const [scrollWindow,setScrollWindow]=useState({left:0,width:1});
 const [objectNote,setObjectNote]=useState<ObjectInstance|null>(null),[reviewOpen,setReviewOpen]=useState(false);
 const [receiving,setReceiving]=useState(false),[journalCount,setJournalCount]=useState(()=>Object.keys(loadExaminationCollection()).length);
 const [entering,setEntering]=useState(false);
 const [looking,setLooking]=useState(false);
 const [menu,setMenu]=useState(false),[helpOpen,setHelpOpen]=useState(false);
 const [ready,setReady]=useState(false),[intro,setIntro]=useState(0),[focus,setFocus]=useState(true);
 const [speech,setSpeech]=useState<{id:string;text:string}|null>(null),[journal,setJournal]=useState(false),[detail,setDetail]=useState<CategoryId|null>(null);
 const [study,setStudy]=useState<StudyCommand|null>(null),[command,setCommand]=useState<SceneCommand|null>(null),[moving,setMoving]=useState(false);
 const [notice,setNotice]=useState(''),[flight,setFlight]=useState<{art:string;x:number;y:number;dx:number;dy:number}|null>(null);
 const [sceneViewport,setSceneViewport]=useState<SceneViewport|null>(null);
 const viewport=useRef<SceneViewport|null>(null),saved=useRef<{viewport:SceneViewport;focus:boolean}|null>(null),book=useRef<HTMLButtonElement>(null);
 const sound=useAmbience(state.phase==='intro'||journal||helpOpen||menu||moving||Boolean(speech),chapterMusicTracks.examination);
 const soundLabel=sound.state==='on'?'關閉音樂':sound.state==='loading'?'音樂載入中，點擊取消':sound.state==='error'?'重試本章音樂':'開啟本章音樂';
 const fullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{setNotice('全螢幕暫不可用，仍可在這裡探索。');}};
 const collected=useRef(state.collected);collected.current=state.collected;
 const journalLayer=useRef<HTMLElement>(null),speechLayer=useRef<HTMLElement>(null);
 useChapterFocus(journalLayer,journal,()=>{if(looking)setLooking(false);else closeJournal();});
 useChapterFocus(speechLayer,Boolean(speech&&state.phase==='found'),()=>setSpeech(null));
 const panRequest=useRef(0);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),motionTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{if(!entering)return;const id=setTimeout(()=>{dispatch({type:'begin'});setEntering(false);},matchMedia('(prefers-reduced-motion: reduce)').matches?0:950);return()=>clearTimeout(id);},[entering]);
 useEffect(()=>{if(!speech||speech.id==='bridge-person-148'&&state.phase==='found')return;const id=setTimeout(()=>setSpeech(null),3200);return()=>clearTimeout(id);},[speech,state.phase]);
 useEffect(()=>{if(!notice)return;const id=setTimeout(()=>setNotice(''),3000);return()=>clearTimeout(id);},[notice]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);if(motionTimer.current)clearTimeout(motionTimer.current);},[]);
 useEffect(()=>{const resize=()=>setFlight(null);window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 function pan(region:{x:number;y:number},ratio=1.35,screenAnchor={x:.5,y:.5},onSettled?:()=>void){
  const request=++panRequest.current;setMoving(true);
  if(motionTimer.current)clearTimeout(motionTimer.current);
  let completed=false;
  const settled=()=>{if(completed||request!==panRequest.current)return;completed=true;setMoving(false);onSettled?.();};
  motionTimer.current=setTimeout(settled,1800);
  setStudy({region,scaleRatio:ratio,screenAnchor,token:performance.now(),transition:'crossfade',onSettled:settled});
 }
 function showSpeech(id:string,text:string){
  const actor=actors.find(a=>a.id===id),v=viewport.current;
  if(!actor||!v)return;
  const x=v.view.x+actor.x*2172*v.view.scale,y=v.view.y+actor.y*724*v.view.scale;
  if(x<40||x>v.frame.width-40||y<150||y>v.frame.height-100){
   setSpeech(null);
   pan({x:actor.x,y:actor.y},v.view.scale/Math.max(v.frame.width/2172,v.frame.height/724),{x:.5,y:.48},()=>setSpeech({id,text}));
  }else setSpeech({id,text});
 }
 function inspect(id:string,anchor?:{x:number;y:number}){
  if(!ready||moving||journal)return;setObjectNote(null);
  const object=objects.find(o=>o.parts.some((_,i)=>o.id+':'+i===id));
  if(object){
   const subject=actors.find(a=>a.id===id)!,v=viewport.current;
   if(v){const x=v.view.x+subject.x*2172*v.view.scale,y=v.view.y+subject.y*724*v.view.scale;
    if(x<40||x>v.frame.width-40||y<150||y>v.frame.height-100){setSpeech(null);pan({x:subject.x,y:subject.y},v.view.scale/Math.max(v.frame.width/2172,v.frame.height/724),{x:.35,y:.48},()=>{const next=viewport.current!;inspect(id,{x:next.view.x+subject.x*2172*next.view.scale,y:next.view.y+subject.y*724*next.view.scale});});return;}
   }
   setSpeech(null);const p=object.parts[Number(id.split(':')[1])],already=collected.current[object.category];
   const category=categories.find(c=>c.id===object.category)!;
   if(!already){
    const origin:Origin={instanceId:object.id,partId:id,tile:object.tile,x:p.x,y:p.y};const next={...collected.current,[object.category]:origin};collected.current=next;dispatch({type:'collect',category:object.category,origin});const ok=saveExaminationCollection(next);
    const arrival=()=>{setJournalCount(Object.keys(collected.current).length);setReceiving(true);setNotice(`已收藏：${category.name}${ok?'':'（本次已記錄，瀏覽器未能保存）'}`);setFlight(null);timer.current=setTimeout(()=>setReceiving(false),650);};
    if(timer.current)clearTimeout(timer.current);const bounds=book.current?.getBoundingClientRect();
    if(anchor&&bounds&&bounds.width>0&&bounds.height>0&&book.current?.getClientRects().length&&!isObservation&&!matchMedia('(prefers-reduced-motion: reduce)').matches){setFlight({art:category.art,x:anchor.x,y:anchor.y,dx:bounds.left+bounds.width/2-anchor.x,dy:bounds.top+bounds.height/2-anchor.y});timer.current=setTimeout(arrival,1500);}else arrival();
   }else setNotice(`已記在冊中：${category.name} · 首次位置保留`);
   setObjectNote(object);return;
  }
  const p=people.find(p=>p.id===id);if(!p)return;const n=state.visits[id]??0;dispatch({type:'visit',id});showSpeech(id,p.dialogue[n%p.dialogue.length]);
  if(p.role==='target')dispatch({type:'found'});
  if(p.role==='read'||p.role==='write')dispatch({type:'compare',kind:p.role});
 }
 function openJournal(){if(viewport.current)saved.current={viewport:{view:{...viewport.current.view},frame:{...viewport.current.frame}},focus};setSpeech(null);setObjectNote(null);setDetail(null);setLooking(false);setJournalCount(Object.keys(collected.current).length);setJournal(true);}
 function closeJournal(){setJournal(false);setDetail(null);setLooking(false);const s=saved.current;if(s){setFocus(s.focus);const {view:v,frame:f}=s.viewport;pan({x:(f.width/2-v.x)/(2172*v.scale),y:(f.height/2-v.y)/(724*v.scale)},v.scale/Math.max(f.width/2172,f.height/724));}book.current?.focus();}
 function look(o:Origin,reveal=false){
  setLooking(false);
  pan(toRegion(o.tile,o.x,o.y),1.6,window.innerWidth<700?{x:.5,y:.22}:{x:.28,y:.5},()=>{setLooking(reveal);journalLayer.current?.focus({preventScroll:true});});
 }
 const isObservation=['observing','comparison-done','ending'].includes(state.phase)||reviewOpen;
 const actor=speech&&actors.find(a=>a.id===speech.id);const vp=sceneViewport;
 const hint=['先看看他的帽子、側臉與朝向。','他穿灰色衣袍，戴黑帽；手前有一只方箱。','留意橋邊的石欄，再細看附近人物。'][Math.max(0,state.hint-1)];
 return <main className={`examination-life lantern-game ${journal?'is-journal-open':''} ${isObservation?'is-reviewing':''}`} onKeyDown={e=>{if(e.key==='Escape'){if(journal){if(looking)setLooking(false);else closeJournal();}else {setSpeech(null);setObjectNote(null);setMenu(false);setHelpOpen(false);}}}}>
  <ScrollScene image={assetPath('art/examination-dense-scroll-v3.png')} tiles={tiles} actors={actors} active={ready&&state.phase!=='intro'} blocked={moving||journal||menu||helpOpen} resetKey={0} hint={null} hitResolver={examinationHit} onInspect={inspect} onReady={setReady} onViewChange={setScrollWindow} onExplore={()=>{setObjectNote(null);if(state.phase!=='found')setSpeech(null);}} motion={false} requireTiles focusing={journal||isObservation?false:focus} studyCommand={study} command={command} onViewportChange={v=>{viewport.current=v;setSceneViewport(v);}} onMiss={()=>{setSpeech(null);setObjectNote(null);setNotice('可拖動畫卷、放大細看；小物件請近看後點選。');}}/>
  {state.phase!=='intro'&&!journal&&<><header className="lantern-hud" inert={moving||menu||helpOpen}><section className="lantern-target" aria-label="人物提示">{state.phase==='complete'?<span className="lantern-face-reference" aria-hidden="true"><BookOpen size={36}/></span>:<button className="lantern-face-reference" aria-label="查看人物提示" onClick={()=>setHelpOpen(true)}><img className="el-source-head" src={assetPath('art/examination-street-life/target-face-cutout-v1.png')} alt="黑帽、朝右的側臉；樣貌摹繪，畫中人物為準"/></button>}<div><p className="lantern-eyebrow">榜下尋人 · 原創虛構章節</p><h1>{state.phase==='complete'?'放榜日的市井見聞':'尋找這張面孔'}</h1><p className="lantern-progress">{state.phase==='complete'?'觀察已完成，自由探索':state.phase==='exploring'?'先看看他的樣貌':'已尋得同行考生'}</p></div></section><div className="lantern-tools"><button className="lantern-mode" aria-pressed={focus} onClick={()=>setFocus(!focus)}>{focus?'轉回彩色':'凝神觀察'}</button><button className="round-control" aria-label={soundLabel} title={soundLabel} aria-pressed={sound.state==='on'||sound.state==='loading'} onClick={()=>void sound.toggle()}>{sound.state==='on'?<Volume2 size={19}/>:<VolumeX size={19}/>}</button><button className="round-control" aria-label="切換全螢幕" onClick={()=>void fullscreen()}><Maximize size={18}/></button><button className="round-control" aria-label="畫卷操作" onClick={()=>setMenu(true)}><MoreHorizontal size={20}/></button></div></header><footer className="lantern-footer" inert={moving||menu||helpOpen}><button ref={book} className={`lantern-quiet-button lantern-journal-button ${receiving?'is-spark-arriving':''}`} onClick={openJournal}><BookOpen size={18}/>見聞冊 <span>{journalCount}／4</span></button><LanternNavigator window={scrollWindow} image={assetPath('art/examination-dense-scroll-v3.png')} stops={[{x:1/6,label:'榜前'},{x:.5,label:'茶攤'},{x:5/6,label:'橋邊'}]} onNavigate={x=>{setSpeech(null);setObjectNote(null);const v=viewport.current;pan({x,y:.5},v?v.view.scale/Math.max(v.frame.width/2172,v.frame.height/724):1);}}/>{state.phase==='complete'?<button className="lantern-quiet-button" onClick={()=>{setSpeech(null);setObjectNote(null);setReviewOpen(true);pan({x:.795,y:.69},1.35);}}>回看畫中發現</button>:<button className="lantern-quiet-button" onClick={()=>{setHelpOpen(true);dispatch({type:'hint'});}}><CircleHelp size={18}/>給我提示</button>}</footer></>}
  {menu&&<ChapterDialog label="畫卷操作" onClose={()=>setMenu(false)}><h2>畫卷操作</h2><div className="lantern-menu-controls">{(['in','out','overview'] as const).map((type,i)=><button className="small-button" key={type} onClick={()=>{setMenu(false);setCommand({type,token:performance.now()});}}>{['放大','縮小','回到卷首'][i]}</button>)}</div><button className="lantern-text-button" onClick={()=>{setMenu(false);setReviewOpen(false);setSpeech(null);dispatch({type:'restart'});}}>重新尋人</button><button className="lantern-text-button" onClick={returnToChapterCover}>回到本章封面</button><details><summary>章節與素材說明</summary><p className="lantern-source-note">原創虛構章節；人物對白為遊戲創作。全畫人物覆蓋仍在逐段複核。</p><p className="lantern-source-note">配樂：<a href={chapterMusicTracks.examination.source} target="_blank" rel="noreferrer">{chapterMusicTracks.examination.title} · {chapterMusicTracks.examination.author}</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>，低音量循環播放。</p></details></ChapterDialog>}
  {state.phase==='intro'&&<section inert={entering} className={`introduction lantern-introduction ${entering?'is-entering':''}`} aria-label="榜下尋人引言"><div className="intro-brand"><span/>畫中尋人</div><div className="intro-content"><div className="intro-copy"><div className="intro-narrative" aria-live="polite" aria-atomic="true"><div className="intro-lines" key={intro}><p className="intro-chapter">{intro===0?'原創虛構章節 · 放榜日':'尋人，也看街上生活'}</p><p className="intro-story">{intro===0?'放榜了，街上擠滿趕來的人。\n有人看榜，有人抄寫，\n也有人歇腳、搬貨。':'人潮把書童與同行考生沖散了。\n記住他的面孔，在畫中找到他。\n再看看榜前兩人的動作。'}</p></div></div><button className="intro-enter" disabled={entering||(intro===1&&!ready)} onClick={()=>intro===0?setIntro(1):setEntering(true)}><span>{intro===0?'展開這一卷':ready?'入畫尋人':'正在展卷'}</span><ArrowRight size={23}/></button><div className="intro-sequence"><button className="intro-back" style={{visibility:intro?'visible':'hidden'}} onClick={()=>setIntro(0)}>前一幕</button><div className="intro-progress" role="img" aria-label={`引言第${intro+1}幕，共兩幕`}><span className="is-read"/><span className={intro?'is-read':''}/></div></div></div><div className="intro-title"><h1>榜下尋人</h1><span className="intro-seal" aria-hidden="true">尋人</span></div></div><div className="intro-footer"><p>原創虛構章節 · 人物對白為遊戲創作</p><ChapterLinks current="examination"/></div></section>}
  {speech&&actor&&vp&&!journal&&!moving&&state.phase!=='intro'&&(()=>{
   const main=actor.kind==='target'&&state.phase==='found';
   const placement=placeLanternReply(actor,actors,vp.view,vp.frame,speech.text,main?20:0,main?18:16,main?50:0,{width:2172,height:724});
   const onScreen=actor.x*2172*vp.view.scale+vp.view.x>=0&&actor.x*2172*vp.view.scale+vp.view.x<=vp.frame.width&&actor.y*724*vp.view.scale+vp.view.y>=0&&actor.y*724*vp.view.scale+vp.view.y<=vp.frame.height;
   if(!onScreen)return null;
   return main?<section ref={speechLayer} tabIndex={-1} className="lantern-emperor-speech" aria-label="同行考生的遊戲虛構對白" style={{left:placement.left,top:placement.top,width:placement.width}}><div className={`lantern-character-reply has-finding emperor-speech-bubble tail-${placement.tailSide}`} style={{'--reply-tail-x':placement.tailX+'px','--reply-tail-y':placement.tailY+'px'} as CSSProperties}><p>{speech.text}</p><button className="emperor-speech-action" onClick={()=>{dispatch({type:'observe'});setSpeech(null);pan({x:.061,y:.32},1.7);}}>看看榜前 <span aria-hidden="true">→</span></button></div></section>:<aside key={speech.id+speech.text} className={`lantern-character-reply tail-${placement.tailSide}`} aria-label="畫中人物的遊戲虛構對白" style={{left:placement.left,top:placement.top,width:placement.width,height:placement.height,'--reply-tail-x':placement.tailX+'px','--reply-tail-y':placement.tailY+'px'} as CSSProperties}><p>{speech.text}</p></aside>;
  })()}
  {helpOpen&&<ChapterDialog label="人物提示" className="lantern-appearance-help" onClose={()=>setHelpOpen(false)}><p className="lantern-eyebrow">尋人 · 提示 {Math.max(1,state.hint)} / 3</p><div className="lantern-appearance-body"><figure className="lantern-appearance-figure"><img className="el-source-head" src={assetPath('art/examination-street-life/target-face-cutout-v1.png')} alt="同行考生樣貌摹繪"/></figure><div className="lantern-appearance-copy"><h2>再看看這位先生</h2><p>{hint}</p><button className="lantern-return-link" onClick={()=>setHelpOpen(false)}>回畫中尋人 <ArrowRight size={18}/></button></div></div><div className="lantern-appearance-footer"><span>樣貌摹繪，畫中人物為準。</span><button className="lantern-text-button" onClick={()=>{if(state.hint<3)dispatch({type:'hint'});else {setHelpOpen(false);pan({x:.79,y:.68},1.3);}}}>{state.hint<3?'再給提示':'看看橋邊'}</button></div></ChapterDialog>}
  {state.phase==='found'&&!speech&&!journal&&!moving&&<section className="lantern-observation-note el-note-position"><p className="lantern-observation-eyebrow">尋得同行考生</p><h2>一起看看榜前</h2><p className="lantern-note-body">留意看榜與抄寫的人，看看他們的動作。</p><button className="lantern-note-next" onClick={()=>{dispatch({type:'observe'});pan({x:.061,y:.32},1.7);}}>看看榜前<span>→</span></button></section>}
  {!journal&&state.phase==='observing'&&!moving&&<section className="lantern-observation-note el-note-position el-note-at-board" aria-label="榜前觀察"><p className="lantern-observation-eyebrow">放榜日 · 看看人物動作</p><h2>誰在看榜，誰在抄寫？</h2><p className="lantern-note-body">{'輕點榜前抬手的人物，\n再點桌旁對着紙筆的人物。'}</p><p className="lantern-note-caption">已觀察 {state.seen.length}／2 種動作</p></section>}
  {!journal&&state.phase==='comparison-done'&&!moving&&<section className="lantern-observation-note el-note-position el-note-at-board" aria-label="榜前發現"><p className="lantern-observation-eyebrow">榜前的發現</p><h2>同一張榜，不同的動作</h2><p className="lantern-note-body">{'一位朝榜面抬手，\n一位坐在桌前對着紙筆。'}</p><p className="lantern-note-caption">有人看消息，也有人把消息記下來。</p><button className="lantern-note-next" onClick={()=>{dispatch({type:'return-bridge'});setSpeech(null);pan({x:.795,y:.69},1.35);}}>回到橋邊<span aria-hidden="true">→</span></button></section>}
  {!journal&&(state.phase==='ending'||reviewOpen)&&!moving&&<section className="lantern-observation-note el-note-position" aria-label="畫中會合"><p className="lantern-observation-eyebrow">尋得人物，也看見街上生活</p><h2>街上還有許多故事</h2><p className="lantern-note-body">{'看榜的人朝榜面抬手，\n抄寫的人在桌前對着紙筆。\n同一張榜，連着不同的動作。'}</p><p className="lantern-note-caption">書童與考生終於會合。畫中還有歇腳、搬貨的身影。</p><button className="lantern-note-next" onClick={()=>{dispatch({type:'finish'});setReviewOpen(false);}}>留在畫中，自由探索<span aria-hidden="true">→</span></button><button className="lantern-note-secondary" onClick={openJournal}>回看已收藏的見聞</button><details className="lantern-note-sources"><summary>章節與素材說明</summary><p>這是原創虛構的放榜日場景，人物對白與會合情節為遊戲創作。未把畫中其他人物指認為書童。</p><p>樣貌及收藏圖樣為輔助摹繪，辨認與觀察以畫中人物、器物為準。</p></details><button className="lantern-note-secondary" onClick={()=>{dispatch({type:'restart'});setReviewOpen(false);setSpeech(null);}}>再尋一次</button></section>}
  {journal&&<section ref={journalLayer} tabIndex={-1} className={`lantern-journal-layer lantern-field-journal ${detail?'is-detail':'is-overview'} ${moving?'is-moving':''} ${looking?'is-looking':''}`} style={{'--journal-texture':`url("${assetPath('art/ui/reading-paper.png')}")`} as CSSProperties} role="dialog" aria-modal="true" aria-label="市井見聞冊"><div className="collection-paper" aria-hidden="true"/><div className="collection-reading" inert={looking}><header className="collection-header"><p className="collection-kicker">畫中拾趣</p><div className="collection-title-row"><h1>市井見聞冊</h1><span>已收下 {Object.keys(state.collected).length}／4</span></div><button className="collection-close" autoFocus aria-label="合上見聞冊" onClick={closeJournal}>×</button></header><div className="collection-pages" aria-busy={moving}>{moving?<p>回看畫中位置…</p>:detail?<><button className="collection-back" onClick={()=>{setDetail(null);setLooking(false);}}>← 回總覽</button>{categories.filter(c=>c.id===detail).map(c=><article className="collection-detail" key={c.id}><div className="collection-detail-heading"><p>首次發現 · {state.collected[c.id]?.tile==='board'?'榜前':state.collected[c.id]?.tile==='tea'?'茶攤':'橋邊'}</p><h2>{c.name}</h2></div><figure className="collection-detail-art"><img className="el-collection-detail-image" src={assetPath('art/examination-street-life/collectibles/'+c.art)} alt={c.name+'收藏摹繪'}/><figcaption>依畫中細節製作的收藏圖樣</figcaption></figure><p className="collection-observe">{objects.find(o=>o.id===state.collected[c.id]?.instanceId)?.name}</p><p className="collection-body">{c.note}</p><p className="collection-next"><span>再留意一處</span>{c.id==='tea-ware'?'再找找別張桌或托盤上的杯壺。':c.id==='paper-ink'?'留意桌上與人物手中的紙，兩處有甚麼不同？':c.id==='travel-case'?'再看看其他人怎樣帶着方箱。':'留意手提與肩挑的籃子，各在人物哪一側？'}</p><button className="collection-look" disabled={moving} onClick={()=>look(state.collected[c.id]!,true)}>看看畫中位置 <span aria-hidden="true">↗</span></button><details className="collection-source"><summary>章節資料</summary><p>原創虛構場景；收藏圖樣為輔助摹繪。首次位置保存在此瀏覽器，再尋一次仍保留收藏。</p></details></article>)}</>:<div className="collection-grid el-four-collections">{categories.map(c=><button className={`collection-item ${state.collected[c.id]?'is-collected':'is-undiscovered'}`} key={c.id} disabled={!state.collected[c.id]} onClick={()=>{setDetail(c.id);look(state.collected[c.id]!);}}><span className={`collection-illustration el-single-illustration ${state.collected[c.id]?'':'is-locked'}`}><img src={assetPath('art/examination-street-life/collectibles/'+c.art)} alt={c.name+'收藏摹繪'}/></span><span className="collection-item-name">{c.name}</span><span className="collection-item-state">{state.collected[c.id]?'已收下':'尚未發現'}</span></button>)}</div>}</div><footer className="collection-footer">收藏圖樣為摹繪；位置依源圖保存。</footer></div><button className="collection-return" onClick={closeJournal}>← 回到長卷</button>{looking&&<button className="collection-resume" onClick={()=>{setLooking(false);journalLayer.current?.focus({preventScroll:true});}}>繼續閱讀 →</button>}</section>}
  {objectNote&&!journal&&!moving&&<section className="lantern-observation-note el-object-note" aria-label="器物觀察"><p className="lantern-observation-eyebrow">畫中器物 · {collected.current[objectNote.category]?'已記在冊中':'偶遇見聞'}</p><h2>{categories.find(c=>c.id===objectNote.category)!.name}</h2><p className="lantern-note-body">{objectNote.name}</p><p className="lantern-note-caption">{categories.find(c=>c.id===objectNote.category)!.note}</p><button className="lantern-note-next" onClick={()=>setObjectNote(null)}>繼續探索<span>→</span></button></section>}
  {flight&&<div className="lantern-spark-discovery is-new"><div className="lantern-spark-source" style={{left:flight.x,top:flight.y}}><span className="lantern-firelight-token el-single-token" style={{'--token-x':flight.dx+'px','--token-y':flight.dy+'px','--arc-x':flight.dx*.48+'px','--arc-y':flight.dy*.48-85+'px'} as CSSProperties}><img src={assetPath('art/examination-street-life/collectibles/'+flight.art)} alt=""/></span></div></div>}
  {notice&&<LanternNotice key={notice} text={notice} quiet={notice.startsWith('已記在冊中')} duration={3000}/>}
  <footer className="lantern-status" role="status">{notice.startsWith('可拖動')?notice:sound.state==='error'?'音樂未能載入，可點擊重試。':''}</footer>
 </main>;
}
