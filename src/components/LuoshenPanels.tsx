import {useEffect,useLayoutEffect,useRef} from 'react';
import type {CSSProperties,ReactNode,Dispatch,SetStateAction} from 'react';
import type {SceneActor} from '../game/level.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import {luoshenCollectionStops,luoshenStoryStops} from '../game/luoshenJournal.ts';
import type {LuoshenLookStop} from '../game/luoshenJournal.ts';
import {luoshenFacePoints} from '../game/luoshenHit.ts';
import {samePanelRect} from '../game/luoshenLayout.ts';
import type {LuoshenPanelRect} from '../game/luoshenLayout.ts';
import {placeLanternReply} from '../game/lanternReply.ts';
import {luoshenSize,luoshenPeople,luoshenImage,luoshenSteps,luoshenFindings,luoshenCollectibles,person} from '../game/luoshen.ts';
import {useChapterFocus} from './ChapterDialog.tsx';
import {ArtCrop} from './ArtCrop.tsx';
import {assetPath} from '../game/assets.ts';
import type {LuoshenState} from '../game/luoshenState.ts';
/** Fit the visible head, excluding transparent padding, without changing the PNG pixels. */
const portraitFrames:Record<string,number[]>={"C2": [1216, 1293, 355, 130, 616, 1019], "L8": [1148, 1370, 238, 143, 669, 1105], "L9": [977, 1610, 180, 21, 629, 1553], "L1": [1230, 1278, 391, 100, 489, 1065], "C4": [1001, 1572, 219, 81, 700, 1289], "C1": [1145, 1374, 348, 52, 547, 1225]};
export function LuoshenPortrait({id,label}:{id:string;label:string}){
 const [w,h,x,y,cw,ch]=portraitFrames[id];
 return <svg className="lantern-face-illustration luoshen-portrait" viewBox={`${x} ${y} ${cw} ${ch}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet"><image href={assetPath(`art/luoshen/head-${id}-cutout.png`)} width={w} height={h}/></svg>;
}
export const luoshenNoteWidth=(width:number)=>Math.min(400,Math.max(300,width*.36),width-32);
export function LuoshenNote({viewport,anchor,label,title,children,primaryAction,reading=false,compact=false,folded,onFold,busy,onBounds}:{viewport:SceneViewport;anchor?:Pick<SceneActor,'x'|'y'>;label:string;title:string;children:ReactNode;primaryAction?:ReactNode;reading?:boolean;compact?:boolean;folded:boolean;onFold:()=>void;busy:boolean;onBounds?:Dispatch<SetStateAction<LuoshenPanelRect|null>>}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{if(!folded&&!busy)ref.current?.focus({preventScroll:true});},[title,label,folded,busy,Boolean(primaryAction)]);
 useLayoutEffect(()=>{
  if(!onBounds)return;const node=ref.current;if(!node||folded||busy){onBounds(null);return;}
  const measure=()=>{const r=node.getBoundingClientRect();const next={left:r.left,top:r.top,width:r.width,height:r.height};onBounds(old=>samePanelRect(old,next)?old:next);};
  measure();const observer=new ResizeObserver(measure);observer.observe(node);return()=>observer.disconnect();
 },[onBounds,folded,busy,label,viewport]);
 if(folded)return <button className="lantern-quiet-button luoshen-note-reopen" onClick={onFold} aria-expanded={false}>展開觀察題箋</button>;
 const width=compact?Math.min(288,viewport.frame.width-32):luoshenNoteWidth(viewport.frame.width);
 const anchorX=anchor?viewport.view.x+anchor.x*luoshenSize.width*viewport.view.scale:0;
 const anchorY=anchor?viewport.view.y+anchor.y*luoshenSize.height*viewport.view.scale:0;
 const aboveDetail=viewport.frame.width<700&&anchorY>viewport.frame.height*.55;
 const left=!reading&&anchorX>viewport.frame.width*.5&&anchorX<viewport.frame.width?24:Math.max(16,viewport.frame.width-width-24);
 return <section ref={ref} tabIndex={-1} className={`lantern-observation-note ${compact?'luoshen-note-compact':''} ${aboveDetail?'is-above-detail':''} ${primaryAction?'has-primary-action':''} ${busy?'is-changing':''}`} style={{'--note-x':`${left}px`,'--note-y':'135px','--note-width':`${width}px`} as CSSProperties} aria-label={title} aria-busy={busy} inert={busy}>
 <div className="luoshen-note-content"><div className="luoshen-note-heading"><button className="lantern-text-button" onClick={onFold} aria-expanded>{compact?'收起':'收起題箋，先看原畫'}</button><p className="lantern-observation-eyebrow">{label}</p></div><h2>{title}</h2>{children}</div>{primaryAction&&<div className="luoshen-note-primary">{primaryAction}</div>}</section>;
}
export function LuoshenSpeech({actor,viewport,text,action,onAction,reserved=[]}:{actor:SceneActor;viewport:SceneViewport;text:string;action?:string;onAction?:()=>void;reserved?:LuoshenPanelRect[]}){
 const ref=useRef<HTMLElement>(null);useEffect(()=>{if(action)ref.current?.focus({preventScroll:true});},[text,action]);
 const faceRects=Object.values(luoshenFacePoints).map(point=>({left:viewport.view.x+point.x*viewport.view.scale-22,top:viewport.view.y+point.y*viewport.view.scale-26,width:44,height:52})).filter(r=>r.left+r.width>0&&r.left<viewport.frame.width&&r.top+r.height>0&&r.top<viewport.frame.height);
 const p=placeLanternReply(actor,luoshenPeople,viewport.view,viewport.frame,text,14,18,action?50:0,luoshenSize,[...reserved,...faceRects]);
 const x=viewport.view.x+actor.x*luoshenSize.width*viewport.view.scale,y=viewport.view.y+actor.y*luoshenSize.height*viewport.view.scale;
 if(!action&&(x<0||x>viewport.frame.width||y<0||y>viewport.frame.height))return null;
 return <section ref={ref} tabIndex={-1} className="lantern-emperor-speech" aria-label={`${actor.name} · 遊戲虛構對白`} style={{left:p.left,top:p.top,width:p.width}}><div className={`lantern-character-reply ${action?'has-finding emperor-speech-bubble':''} tail-${p.tailSide}`} style={{'--reply-tail-x':`${p.tailX}px`,'--reply-tail-y':`${p.tailY}px`} as CSSProperties}><p role="status">{text}</p>{action&&<button className="emperor-speech-action" onClick={onAction}>{action} →</button>}</div></section>;
}
export function LuoshenCrop({actor,label}:{actor:SceneActor;label:string}){
 return <ArtCrop label={label} crop={{image:luoshenImage,sourceWidth:11970,rect:[Math.max(0,(actor.x-actor.width*.7))*11970,Math.max(0,(actor.y-actor.height*.7))*566,actor.width*1.4*11970,actor.height*1.4*566]}}/>;
}
/** Shared Lantern illustration slot; only this chapter's transparent artwork differs. */
export function LuoshenCollectionIllustration({id,name,locked=false}:{id:string;name:string;locked?:boolean}){
 return <span className={`collection-illustration luoshen-collection-illustration ${locked?'is-locked':''}`} role="img" aria-label={locked?`尚未收下的${name}收藏輪廓`:`${name} · 依原畫創作的收藏插畫`}><img src={assetPath(`art/luoshen/collection-${id}-cutout.png`)} alt="" draggable={false}/></span>;
}
export type LuoshenJournalView={page:'collection'|'story';selected:string|null;story?:string;scrollTop?:number};
export function LuoshenJournal({state,view,onView,onClose,onLook}:{state:LuoshenState;view:LuoshenJournalView;onView:(view:LuoshenJournalView)=>void;onClose:()=>void;onLook:(id:string,stops?:LuoshenLookStop[])=>void}){
 const ref=useRef<HTMLElement>(null),pages=useRef<HTMLDivElement>(null);
 const {page,selected}=view;
 const setSelected=(selected:string|null)=>onView({...view,selected,scrollTop:0});
 const scrollContainer=()=>pages.current&&pages.current.scrollHeight>pages.current.clientHeight?pages.current:ref.current;
 const keepPosition=()=>onView({...view,scrollTop:scrollContainer()?.scrollTop??0});
 const closeBook=()=>{keepPosition();onClose();};
 const look=(id:string,stops?:LuoshenLookStop[])=>{keepPosition();onLook(id,stops);};
 useChapterFocus(ref,true,closeBook);
 useLayoutEffect(()=>{scrollContainer()?.scrollTo({top:view.scrollTop??0});},[page,selected,view.story]);
 const finding=luoshenFindings.find(item=>item.id===selected);
 const origin=finding&&luoshenCollectibles.find(a=>a.id===state.origins[finding.id]);
 const completed=luoshenSteps.slice(0,Math.min(state.index,6));
 const ashore=state.index===6&&(state.ending>=1||state.ending===0&&state.endingSeen);
 const homeward=state.index===6&&(state.ending>=3||state.ending===2&&state.endingSeen);
 const storyChapters=[
  {id:'encounter',label:'相遇',ordinal:'壹',unlocked:state.index>=1,title:'洛水初見',scene:state.index>=2?'9695 0 1736 566':'10600 100 750 466',imageLabel:state.index>=2?'洛神在水邊，曹植與同行者在岸上':'岸上曹植與同行者',text:state.index>=2?'他在岸上停步，她在水邊現身。畫卷把這一刻的相逢，留在兩處身影之間。':'曹植在岸上停步。同行者收袖，他卻展開衣袖，姿態格外不同。',people:[{id:'C1',portrait:'C1',name:'曹植',caption:'岸上停步'},...(state.index>=2?[{id:'L1',portrait:'L1',name:'洛神',caption:'水邊現身'}]:[])],notes:['衣袖一展一收，曹植在同行者之間格外顯眼。',...(state.index>=2?['「翩若驚鴻，婉若游龍」：如鳥輕盈，如龍婉轉。原畫中的鳥與龍，也能和賦文對讀。']:[]),'人物心情不能只憑姿態判定。']},
  {id:'lingering',label:'流連',ordinal:'貳',unlocked:state.index>=3,title:'再見一處身影',scene:'6850 120 900 440',imageLabel:'坐榻上的曹植與面前的神女',text:'相遇沒有停在初見。他坐了下來，她又在榻前出現；相似的髮式與不同的姿態，連起另一個時刻。',people:[{id:'C2',portrait:'C2',name:'曹植',caption:'坐榻凝望'},{id:'L7',portrait:'L1',name:'洛神',caption:'榻前回身'}],notes:['把初見的神女和榻前身影並看，髮式相似，姿態卻有變化。','人物重現串連不同時刻；這些身分依本卷冠髮、衣飾與場景比對，不能只靠髮式判定。']},
  {id:'farewell',label:'離別',ordinal:'參',unlocked:state.index>=4,title:state.index>=5?'雲車漸遠':'兩岸相對',scene:state.index>=5?'3050 70 1400 490':'4760 200 900 360',imageLabel:state.index>=5?'神女乘雲車，龍形在前牽引':'低身神女與岸上送別的曹植',text:state.index>=5?'雲車帶她遠去，他仍留在岸上。先前相對的身影，成了遠行與送別。':'她低身，他在岸上相對。故事走到人與神終須分別的一刻。',people:[{id:'C3',portrait:'C1',name:'曹植',caption:'岸上送別'},{id:state.index>=5?'L9':'L8',portrait:state.index>=5?'L9':'L8',name:'洛神',caption:state.index>=5?'乘車離去':'低身相對'}],notes:['「恨人神之道殊」的人神分離，來自《洛神賦》，不單靠表情判讀。',...(state.index>=5?['雲車前龍形交疊，重點是牽引車駕的關係，毋須逐條數清。']:[])]},
  {id:'longing',label:'追懷',ordinal:'肆',unlocked:state.index>=6,title:homeward?'足往心留':'乘舟尋望',scene:homeward?'75 140 950 420':'2070 75 1040 490',imageLabel:homeward?'曹植乘車回望，隊伍踏上歸途':'樓船上層的曹植與下層操船人',text:homeward?'舟上尋望、岸邊坐候，最後乘車回望。同一人的反覆出現，把不同時刻連成一段追懷。':ashore?'乘舟尋望之後，他又在岸邊坐候。地方變了，冠髮與鬚貌仍讓我們認出他。':'她已遠去，他仍乘舟尋望。上層的乘舟者與下層的舟人，共同延續這段旅程。',people:[{id:'C4',portrait:'C4',name:'曹植',caption:'舟上尋望'},...(ashore?[{id:'C5',portrait:'C2',name:'曹植',caption:'岸邊坐候'}]:[]),...(homeward?[{id:'C6',portrait:'C4',name:'曹植',caption:'車中回望'}]:[])],notes:['「御輕舟而上溯」寫乘舟尋望；畫中樓船的上下兩層，分出乘舟者與操船者。',...(homeward?['反覆出現的身影連起不同時刻，不是同一場面裡有許多位曹植。']:[]),'文本的「輕舟」不等同畫中樓船的精確船型。']}
 ];
 const collectionComparisons=finding&&origin?luoshenCollectionStops(finding.id,origin.id):[];
 const story=storyChapters.find(chapter=>chapter.id===view.story&&chapter.unlocked)??storyChapters[0];
 const storyComparisons=luoshenStoryStops(story.id,state);
 return <section ref={ref} tabIndex={-1} className="lantern-journal-layer lantern-field-journal luoshen-journal" role="dialog" aria-modal="true" aria-label="洛水見聞冊" style={{'--journal-texture':`url('${assetPath('art/ui/reading-paper.png')}')`} as CSSProperties}>
 <div className="collection-paper" aria-hidden="true"/>
 <div className="collection-reading">
  <header className="collection-header"><p className="collection-kicker">畫中拾趣</p><div className="collection-title-row"><h1>洛水見聞冊</h1><span>已收下 {Object.keys(state.origins).length}／{luoshenFindings.length}</span></div><button className="collection-close" onClick={closeBook} aria-label="合上見聞冊">×</button></header>
  <nav className="luoshen-journal-tabs" aria-label="見聞冊篇目"><button aria-pressed={page==='collection'} onClick={()=>{onView({...view,page:'collection',selected:null,scrollTop:0});}}>畫中收藏</button><button aria-pressed={page==='story'} onClick={()=>{onView({...view,page:'story',selected:null,scrollTop:0});}}>故事回看 · {completed.length}／6</button></nav>
  <div ref={pages} className="collection-pages">
   {page==='collection'&&!finding&&<div className="collection-overview"><p className="collection-introduction">從鳥形、衣帶到舟船，收藏一件，也多讀懂一點原畫。</p><div className="collection-grid">{luoshenFindings.map(item=>{
    const found=Boolean(state.origins[item.id]);
    return <button className={`collection-item ${found?'is-collected':'is-undiscovered'}`} key={item.id} disabled={!found} aria-label={found?`翻閱${item.name}`:`未發現：${item.name}`} onClick={()=>setSelected(item.id)}><LuoshenCollectionIllustration id={item.id} name={item.name} locked={!found}/><span className="collection-item-name">{item.name}</span><span className="collection-item-state">{found?'已收下':'未發現'}</span></button>;
   })}</div><p className="collection-footer">在原畫中點看這些細節，便會記入冊中。收藏不影響主線完成。</p></div>}
   {page==='collection'&&finding&&origin&&<article className="collection-detail"><button className="collection-back" onClick={()=>setSelected(null)}>← 全部收藏</button><div className="collection-detail-heading"><p>畫中見聞 · 首次發現的一處</p><h2>{finding.name}</h2></div><figure className="collection-detail-art"><LuoshenCollectionIllustration id={finding.id} name={finding.name}/><figcaption>依原畫創作的收藏圖樣</figcaption></figure><p className="collection-body">{finding.text}</p><div className="luoshen-original-links"><p className="collection-kicker">對照原畫</p>{collectionComparisons.map(stop=><button key={stop.id} className="collection-look" onClick={()=>look(stop.id,collectionComparisons)}>{stop.label}{stop.id===origin.id&&<small> · 首次發現</small>} <span aria-hidden>↗</span></button>)}</div><details className="collection-source luoshen-source-comparison"><summary>原畫對照與資料</summary><figure className="luoshen-journal-detail-art"><LuoshenCrop actor={origin} label={finding.name+'首次發現位置的原畫局部'}/><figcaption>首次發現位置的原畫局部</figcaption></figure><p>北京故宮博物院藏《洛神賦圖》宋摹本。收藏圖樣依本卷創作，原畫局部保留作對照；同類只計一次。</p><a href="https://www.dpm.org.cn/collection/paint/234597.html" target="_blank" rel="noreferrer">故宮博物院 · 藏品介紹</a></details></article>}
   {page==='story'&&<div className="luoshen-story-pages">
    <nav className="luoshen-story-chapters" aria-label="故事篇章">{storyChapters.map(chapter=><button key={chapter.id} disabled={!chapter.unlocked} aria-pressed={chapter.id===story.id} onClick={()=>onView({...view,story:chapter.id,scrollTop:0})}>{chapter.label}{!chapter.unlocked&&<small>待回看</small>}</button>)}</nav>
    {!completed.length?<p className="collection-body">完成第一段觀察後，再來回看這場相遇。</p>:<article className="collection-detail luoshen-encounter-page">
     <div className="collection-detail-heading"><p>{story.ordinal} · {story.label}</p><h2>{story.title}</h2></div>
     <figure className="luoshen-story-scene"><svg viewBox={story.scene} role="img" aria-label={'原畫局部：'+story.imageLabel}><image href={luoshenImage} width="11970" height="566"/></svg><figcaption>北京故宮藏宋摹本 · 原畫局部</figcaption></figure>
     <p className="collection-body">{story.text}</p>
     <div className="luoshen-story-people" aria-label={'回看'+story.label+'人物'}>{story.people.map(actor=><button key={actor.id} className="luoshen-story-person" onClick={()=>look(actor.id,storyComparisons)}><LuoshenPortrait id={actor.portrait} label={actor.name+'去背樣貌摹繪'}/><span><strong>{actor.name}</strong><small>{actor.caption} <span aria-hidden>↗</span></small></span></button>)}</div>
     <p className="luoshen-story-art-note">人物樣貌摹繪 · 點人物可回到原畫</p><div className="luoshen-original-links"><p className="collection-kicker">對照原畫</p>{storyComparisons.map(stop=><button key={stop.id} className="collection-look" onClick={()=>look(stop.id,storyComparisons)}>{stop.label} <span aria-hidden>↗</span></button>)}</div>
     <details key={story.id} className="collection-source luoshen-encounter-notes"><summary>回想畫中發現</summary>{story.notes.map(note=><p key={note}>{note}</p>)}</details>
    </article>}
    <p className="collection-footer">故事依《洛神賦》與本卷畫面串連；人物對白為遊戲虛構。</p>
   </div>}

  </div>
 </div></section>;
}
