import {useEffect,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import {useChapterFocus} from './ChapterDialog.tsx';
import {QingmingBookLeaf} from './QingmingSourceReading.tsx';
import {qingmingFindings,qingmingArt,passageAt} from '../game/qingming.ts';
import {bridgeIntroduction,qingmingStories,storyById,storyStepAt} from '../game/qingmingStories.ts';
import {progressAt,completedStories} from '../game/qingmingState.ts';
import type {QingmingSave} from '../game/qingmingState.ts';

type DetailView='painting'|'source'|'reading';
export function QingmingJournal({save,onClose,onLook,onLookingChange,onResume,onReplay,onCity}:{save:QingmingSave;onClose:()=>void;onLook:(actorId:string)=>void;onLookingChange:(looking:boolean)=>void;onResume:(id:string)=>void;onReplay?:(id:string)=>void;onCity:()=>void}){
 const ref=useRef<HTMLElement>(null),pages=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null);
 const [section,setSection]=useState<'stories'|'objects'>('stories');
 const [selected,setSelected]=useState<string|null>(null),[looking,setLooking]=useState(false);
 const [readingBook,setReadingBook]=useState(false);
 const [view,setView]=useState<DetailView>('painting'),[evidenceIndex,setEvidenceIndex]=useState(0);
 const changeLooking=(value:boolean)=>{setLooking(value);onLookingChange(value);};
 const close=()=>{if(readingBook){setReadingBook(false);return;}if(looking)changeLooking(false);else onClose();};
 useChapterFocus(ref,!readingBook,close);
 const item=section==='objects'?qingmingFindings.find(f=>f.id===selected):undefined;
 const story=section==='stories'&&selected?storyById(selected):undefined;
 const progress=story?progressAt(save,story.id):undefined;
 const source=item?passageAt(item.stageId):story?.source;
 const sourceRead=story&&progress?story.id==='story-boat-work'?save.tutorialDone:progress.readSteps.length>0:Boolean(item&&save.origins[item.id]);
 const evidence=story&&progress?story.steps.flatMap((_,index)=>{const s=storyStepAt(story,{...progress,step:index});return s?.kind==='observe'?s.groups.filter(g=>progress.seen[g.key]).map(g=>({key:g.key,id:progress.seen[g.key],label:g.label,text:g.response})):[];}):[];
 const optionalEvidence=story&&progress?(story.optionalGroups??[]).flatMap(g=>progress.seen[g.key]?[{id:progress.seen[g.key],label:g.label,text:g.response}]:[]).filter((e,index,all)=>all.findIndex(other=>other.id===e.id)===index):[];
 const current=evidence[evidenceIndex];
 const count=Object.keys(save.origins).length;
 const look=(id:string)=>{changeLooking(true);onLook(id);};
 const select=(id:string|null)=>{setReadingBook(false);setSelected(id);setView('painting');setEvidenceIndex(0);};
 const selectSection=(value:'stories'|'objects')=>{setSection(value);select(null);};
 useEffect(()=>{if(pages.current)pages.current.scrollTop=0;if(selected)heading.current?.focus({preventScroll:true});},[selected,section]);
 return <section ref={ref} tabIndex={-1} className={`lantern-journal-layer lantern-field-journal qingming-journal ${looking?'is-looking':''} ${story||item?'is-detail':''} ${readingBook?'is-book-open':''}`} style={{'--journal-texture':`url('${qingmingArt('full-scroll.jpg')}')`,pointerEvents:looking?'none':undefined} as CSSProperties} role={readingBook?undefined:"dialog"} aria-modal={!looking&&!readingBook} aria-label="汴京見聞冊">
  <div className="collection-paper" aria-hidden="true"/>
  <div className="collection-reading" inert={looking||readingBook}>
   <header className="collection-header"><p className="collection-kicker">把畫中的發現，留在冊中</p><div className="collection-title-row"><h1>汴京見聞冊</h1><span>見聞 {completedStories(save)}／5 · 收藏 {count}／{qingmingFindings.length}</span></div><button className="collection-close" onClick={close} aria-label="合上見聞冊">×</button></header>
   <nav className="qingming-journal-sections" aria-label="見聞冊內容"><button className="collection-back" aria-pressed={section==='stories'} onClick={()=>selectSection('stories')}>畫中見聞</button><button className="collection-back" aria-pressed={section==='objects'} onClick={()=>selectSection('objects')}>物件收藏</button></nav>
   <div ref={pages} className="collection-pages">
    {section==='stories'&&!story&&<div className="qingming-contents"><p className="collection-introduction">翻開一段見聞，回看你曾留意的細節。</p><ol>{[bridgeIntroduction,...qingmingStories].map((s,index)=>{
     const p=progressAt(save,s.id),available=Object.keys(p.seen).length>0||p.complete||p.readSteps.length>0;
     return <li key={s.id}><button className="qingming-contents-entry" disabled={!available} onClick={()=>select(s.id)}><span className="qingming-entry-number" aria-hidden="true">{String(index).padStart(2,'0')}</span><span className="qingming-entry-title">{s.title}{index===0&&<small>虹橋引導</small>}</span><span className={`qingming-entry-state ${p.complete?'is-complete':''}`}>{p.complete?'已記下':available?'待續':'未留步'}</span><span aria-hidden="true">{available?'↗':'·'}</span></button></li>;
    })}</ol>{completedStories(save)===5&&<button className="collection-look" onClick={onCity}>把五段見聞連起來看 →</button>}</div>}
    {section==='objects'&&!item&&<div className="qingming-contents"><p className="collection-introduction">把看見的細節，收成自己的汴京見聞。</p>{count>0?<div className="collection-grid qingming-collection-grid">{qingmingFindings.filter(f=>save.origins[f.id]).map(f=><button key={f.id} className="collection-item is-collected" onClick={()=>select(f.id)}><span className="collection-illustration qingming-journal-art"><img src={qingmingArt(f.art)} alt=""/></span><span className="collection-item-name">{f.title}</span><span className="collection-item-state">已收下</span></button>)}</div>:<p className="collection-body">在畫中留下發現，這裏會慢慢添上見聞。</p>}{count<qingmingFindings.length&&<p className="qingming-journal-unseen">長卷中，還有 {qingmingFindings.length-count} 類發現等你留意。</p>}</div>}
    {(story||item)&&<article className="collection-detail" key={selected}>
     <button className="collection-back" onClick={()=>select(null)}>← {story?'見聞目錄':'收藏目錄'}</button>
     <div className="collection-detail-heading"><p>{story?(progress?.complete?'已記下見聞':'待續 · 觀察已保存'):'我的首次發現'}</p><h2 ref={heading} tabIndex={-1}>{story?.title??item?.title}</h2>{(item||story?.id===bridgeIntroduction.id)&&<img className="qingming-detail-study" src={qingmingArt(item?.art??'bridge-boat-v55.png')} alt="收藏摹繪，原畫為準"/>}</div>
     <nav className="qingming-detail-sections" aria-label="這段見聞的內容"><button aria-pressed={view==='painting'} onClick={()=>setView('painting')}>原畫細節</button>{source&&sourceRead&&<button aria-pressed={view==='source'} onClick={()=>setView('source')}>書中記載</button>}<button aria-pressed={view==='reading'} onClick={()=>setView('reading')}>延伸閱讀</button></nav>
     {view==='painting'&&<>
      <details className="qingming-evidence-crop"><summary>對照原畫局部</summary><figure className="qingming-journal-scene"><img src={qingmingArt(story?.art??item!.sceneArt)} alt={`${story?.title??item?.title} · 原畫局部`}/><figcaption>張擇端《清明上河圖》局部</figcaption></figure></details>
      {story&&current&&<div className="qingming-evidence" aria-live="polite"><p className="qingming-reading-caption">你看過的細節 · {current.label}</p><p className="collection-body">{current.text}</p><button className="collection-look" onClick={()=>look(current.id)}>回看這處原畫 ↗</button>{evidence.length>1&&<div className="collection-detail-nav"><button aria-label="上一處已看細節" disabled={evidenceIndex===0} onClick={()=>setEvidenceIndex(n=>n-1)}>←</button><span>{evidenceIndex+1}／{evidence.length}</span><button aria-label="下一處已看細節" disabled={evidenceIndex===evidence.length-1} onClick={()=>setEvidenceIndex(n=>n+1)}>→</button></div>}</div>}
      {item&&<p className="collection-body">{item.note}</p>}
      {item&&<button className="collection-look" onClick={()=>look(save.origins[item.id]??item.actorIds[0])}>回到首次發現位置 ↗</button>}
      {story&&!progress?.complete&&<button className="collection-look" onClick={()=>onResume(story.id)}>繼續這段觀察 →</button>}
      {story?.ordered&&progress?.complete&&onReplay&&<button className="collection-look" onClick={()=>onReplay(story.id)}>重看這段觀察 →</button>}
     </>}
     {view==='source'&&source&&sourceRead&&<div className="qingming-journal-source"><h3>東京夢華錄</h3><p className="collection-body">{source.title==='河道'?'物產沿着汴河入京。再翻一翻書中的記載。':'把書中短句與畫中的細節放在一起讀。'}</p><button className="collection-look" onClick={()=>setReadingBook(true)}>翻開這段記載</button><button className="collection-look" onClick={()=>setView('painting')}>回看原畫細節 →</button></div>}
     {view==='reading'&&<div className="qingming-journal-reading">
      {(item||progress?.complete)&&<><h3>把細節連起來</h3><p className="collection-body">{story?.meaning??item?.note}</p></>}
      {story?.extraReading&&<details className="qingming-reading-more"><summary>{story.extraReadingTitle??'街上還有哪些運法？'}</summary><p>{story.extraReading}</p>{optionalEvidence.map(e=><p key={e.id}>{e.text}<button className="collection-look" onClick={()=>look(e.id)}>回看{e.label} ↗</button></p>)}</details>}
      {source&&sourceRead&&<details className="qingming-reading-more"><summary>圖文可以怎樣對讀？</summary><p>{source.context}</p></details>}
      <details className="qingming-reading-more"><summary>證據與解讀範圍</summary>{story&&<p>{story.limits}</p>}<p>《東京夢華錄》由孟元老在南宋追記北宋東京生活；書中地址、店舖與人物不逐一等同原畫。遊戲中的人物對白為虛構。</p></details>
      <details className="qingming-reading-more"><summary>查看來源</summary><p><a href="https://www.dpm.org.cn/collection/paint/228226.html" target="_blank" rel="noreferrer">故宮博物院 · 原畫介紹 ↗</a></p>{source&&<p><a href={source.url} target="_blank" rel="noreferrer">《東京夢華錄》{source.volume}原文 ↗</a></p>}</details>
     </div>}
    </article>}
   </div>
  </div>{readingBook&&source&&<QingmingBookLeaf source={source} review onClose={()=>setReadingBook(false)}/>}<button className="collection-return" style={{pointerEvents:'auto'}} onClick={onClose}>← 回到長卷</button>{looking&&<button className="collection-resume" style={{pointerEvents:'auto'}} onClick={()=>changeLooking(false)}>繼續閱讀 →</button>}
 </section>;
}
