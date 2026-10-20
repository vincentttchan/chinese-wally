import {useId,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import type {SourcePassage} from '../game/qingming.ts';
import {qingmingArt} from '../game/qingming.ts';
import {readingPhrases,readingComplete,requiredReadingIndices} from '../game/qingmingReading.ts';
import {useChapterFocus} from './ChapterDialog.tsx';

const columns=(text:string)=>(text.match(/[^，。、]+[，。、]?/g)??[text]).flatMap(part=>{
 const characters=Array.from(part);
 if(characters.length<=8)return [part];
 return Array.from({length:Math.ceil(characters.length/6)},(_,index)=>characters.slice(index*6,index*6+6).join(''));
});

/** The same art leaf serves mandatory reading and optional journal rereading. */
export function QingmingBookLeaf({source,read:recorded,onRead,onClose,review=false}:{source:SourcePassage;read?:readonly number[];onRead?:(index:number)=>void;onClose:()=>void;review?:boolean}){
 const ref=useRef<HTMLElement>(null),[selected,setSelected]=useState<number|null>(null),[localRead,setLocalRead]=useState<number[]>([]);
 const explanationId=useId(),phrases=readingPhrases(source),read=recorded??localRead;
 const ready=readingComplete(source,read);
 useChapterFocus(ref,true,onClose);
 const missing=requiredReadingIndices(source).find(index=>!read.includes(index));
 const columnCount=phrases.reduce((sum,p)=>sum+columns(p.text).length,0);
 const maxLength=Math.max(...phrases.flatMap(p=>columns(p.text).map(t=>Array.from(t).length)));
 const choose=(index:number)=>{
  setSelected(value=>value===index?null:index);
  setLocalRead(value=>Array.from(new Set([...value,index])));onRead?.(index);
 };
 return <div className="qingming-book-layer"><article ref={ref} tabIndex={-1} className="qingming-art-leaf" role="dialog" aria-modal="true" aria-label={`東京夢華錄 ${source.volume} ${source.title}`}>
  <img className="qingming-page-art" src={qingmingArt('book-page-blank.png')} alt="手繪翻開書頁"/>
  <header className="qingming-book-heading"><p>書中記載</p><h2>東京夢華錄</h2><p className="qingming-book-citation">孟元老 · {source.volume}〈{source.title}〉{source.title==='馬行街北諸醫鋪'?' · 兩處節錄':''}</p><p className="qingming-book-instruction">點選原文，讀頁邊批注</p></header>
  <button className="qingming-book-close" aria-label="合上東京夢華錄" onClick={onClose}>×</button>
  <blockquote className="qingming-book-original" aria-label="原文，由右至左閱讀" style={{'--quote-size':`${Math.min(6.1,39/maxLength)}cqw`} as CSSProperties}>
   {phrases.map((phrase,index)=><button key={index} type="button" style={{flex:columns(phrase.text).length/columnCount}} aria-label={`${phrase.text}${read.includes(index)?'（已讀）':''}`} aria-pressed={selected===index} aria-controls={explanationId} onClick={()=>choose(index)}>
    {columns(phrase.text).map((text,i)=><span key={i} className="qingming-quote-column" aria-hidden="true">{text}</span>)}
    {read.includes(index)&&<span className="qingming-book-readmark" aria-hidden="true">已讀</span>}
   </button>)}
  </blockquote>
  <aside id={explanationId} className="qingming-book-annotation" aria-live="polite" aria-atomic="true">{selected!==null&&<p>{phrases[selected].meaning}</p>}</aside>
  <p className="qingming-book-status" aria-live="polite">{review?'原畫與記載各留一份線索。':ready?'已讀到相關記載，可回畫中對照。':read.length&&missing!==undefined?`已讀 ${read.length} 段 · 再讀「${phrases[missing].text.replace(/[，。]/g,'')}」。`:source.title==='河道'?'物產沿這條河，往哪裏去？':'點一句原文，和畫中的細節對照。'}</p>
  <button className="qingming-book-return" onClick={onClose}>{review?'合卷，回見聞冊':ready?'合卷，回畫中對照':'合卷，稍後再讀'}</button>
 </article></div>;
}

export function QingmingSourceReading({source,title,read,onRead,onReturn,onOpenChange,onPause}:{source:SourcePassage;title:string;read:readonly number[];onRead:(index:number)=>void;onReturn:()=>void;onOpenChange:(open:boolean)=>void;onPause?:()=>void}){
 const [open,setOpen]=useState(false),[hasOpened,setHasOpened]=useState(false);
 const opener=useRef<HTMLButtonElement>(null);
 const show=()=>{setOpen(true);setHasOpened(true);onOpenChange(true);};
 const close=()=>{setOpen(false);onOpenChange(false);if(readingComplete(source,read))onReturn();else opener.current?.focus({preventScroll:true});};
 return <section className="qingming-source-stage" aria-label="東京夢華錄閱讀道具">
  {!open&&<>
   <section className="lantern-observation-note qingming-source-invitation" aria-label={title}><p className="lantern-observation-eyebrow">書中還有一段記載</p><p className="lantern-note-body">{hasOpened&&read.length?'讀過的段落已留朱記。再翻開，接着看看書中怎樣記載。':`${title} 翻開〈${source.title}〉看看。`}</p>{onPause&&<button className="lantern-text-button" onClick={onPause}>稍後再讀 · 保存觀察</button>}</section>
   <button ref={opener} className="qingming-book-object" aria-label={`翻開東京夢華錄 ${source.title}`} aria-expanded={false} onClick={show}><svg viewBox="270 85 730 1080" role="img" aria-label="東京夢華錄手繪薄冊"><image href={qingmingArt('book-closed.png')} width="1254" height="1254"/></svg><span>翻開〈{source.title}〉</span></button>
  </>}
  {open&&<QingmingBookLeaf source={source} read={read} onRead={onRead} onClose={close}/>}
 </section>;
}

/** Optional rereading uses the same book art, without altering story completion. */
export function QingmingSourceText({source}:{source:SourcePassage}){
 const [open,setOpen]=useState(false);
 return <><p className="qingming-reading-attribution">《東京夢華錄》{source.volume}〈{source.title}〉</p><button className="collection-look" onClick={()=>setOpen(true)}>翻開這段記載</button>{open&&<QingmingBookLeaf source={source} review onClose={()=>setOpen(false)}/>}</>;
}
