import {useRef,useState} from 'react';
import {luoshenBookLayout} from '../game/luoshenBookLayout.ts';
import type {Size} from '../game/geometry.ts';
import {QingmingBookLeaf} from './QingmingSourceReading.tsx';
import {assetPath} from '../game/assets.ts';
import {luoshenReading,luoshenPassage} from '../game/luoshenReading.ts';
/** Same physical book and leaf layout as Qingming; only text, cover and chapter context differ. */
export function LuoshenPoemBook({index,open,read,onOpen,onRead,onClose,frame={width:1280,height:800}}:{index:number;open:boolean;read:readonly number[];onOpen:()=>void;onRead:(phrase:number)=>void;onClose:()=>void;frame?:Size}){
 const [phraseIndex,setPhraseIndex]=useState(0);
 const root=useRef<HTMLElement>(null),page=luoshenReading[index],layout=luoshenBookLayout(frame);
 const readPhrase=(phrase:number)=>{onRead(phrase);requestAnimationFrame(()=>root.current?.querySelector<HTMLElement>('.qingming-book-annotation')?.scrollIntoView?.({block:'nearest',behavior:'auto'}));};
 return <section ref={root} style={{'--poem-width':`${layout.width}px`,'--poem-height':`${layout.maxHeight}px`} as import('react').CSSProperties} className="luoshen-poem-book" aria-label="洛神賦閱讀道具">
  <div inert={open}><button className="qingming-book-object luoshen-book-object" aria-label="翻開洛神賦" aria-expanded={open} onClick={()=>{setPhraseIndex(0);onOpen();}}><svg viewBox="270 85 730 1080" role="img" aria-label="洛神賦手繪薄冊"><image href={assetPath('art/luoshen/book-closed.png')} width="1254" height="1254"/></svg><span>洛神賦 · 翻卷對讀</span></button></div>
  {open&&<QingmingBookLeaf key={`${index}:${phraseIndex}`} source={luoshenPassage(index)} passages={[page.phrases[phraseIndex]]} read={read.includes(phraseIndex)?[0]:[]} onRead={()=>readPhrase(phraseIndex)} onClose={onClose} continuation={{visible:read.includes(phraseIndex),label:phraseIndex<page.phrases.length-1?'接著讀下一句':'合卷，回畫中對照',onContinue:()=>{if(!read.includes(phraseIndex))return;if(phraseIndex<page.phrases.length-1)setPhraseIndex(i=>i+1);else onClose();}}} review book={{title:'洛神賦',author:'曹植',kicker:'賦中一頁',citation:'曹植 · 原文節錄',annotationLabel:'讀畫批注 · 今人解說',instruction:`${phraseIndex+1}／${page.phrases.length} · 點原文，讀頁邊批注。`,reviewStatus:'讀過批注，再合卷對照原畫。',returnLabel:'合卷，回畫中對照'}}/>}
 </section>;
}
