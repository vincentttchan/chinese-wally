import {useEffect,useId,useMemo,useRef,useState} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import {useChapterFocus} from './ChapterDialog.tsx';
import {ArrowRight} from './ArtIcons.tsx';
import {zanhuaPlayerSeal} from '../game/zanhuaSeal.ts';
import {assetPath} from '../game/assets.ts';
import {zanhuaSealCharacters} from '../game/zanhuaSealCharacters.ts';

const sealArt={impression:assetPath('art/zanhua/seal/collector-frame-v3.png'),stone:assetPath('art/zanhua/seal/scholar-stone-v1.png')};
const defaultSealText='觀畫留記';
const sealFontFamily='Zanhua Chong Xi Seal';
let sealFontTask:Promise<void>|null=null;
function loadSealFont(){
 if(!sealFontTask)sealFontTask=new FontFace(sealFontFamily,`url("${assetPath('fonts/chongxi/chongxi_seal.otf')}") format("opentype")`).load().then(font=>{document.fonts.add(font);}).catch(error=>{sealFontTask=null;throw error;});
 return sealFontTask;
}

/** Typeset every inscription in the same actual small-seal font, read down the right column first. */
function SealFace({text}:{text:string}){
 const grain=useId();
 const glyphs=useMemo(()=>{
  const context=document.createElement('canvas').getContext('2d')!;
  context.font=`100px "${sealFontFamily}"`;
  return Array.from(text).map(char=>{
   const m=context.measureText(char);
   return {char,box:`${-m.actualBoundingBoxLeft} ${-m.actualBoundingBoxAscent} ${m.actualBoundingBoxLeft+m.actualBoundingBoxRight} ${m.actualBoundingBoxAscent+m.actualBoundingBoxDescent}`};
  });
 },[text]);
 const cells=glyphs.length===1?[[12,10,76,80]]:glyphs.length===2?[[53,10,37,80],[10,10,37,80]]:glyphs.length===3?[[53,10,37,80],[10,10,37,37],[10,53,37,37]]:[[53,10,37,37],[53,53,37,37],[10,10,37,37],[10,53,37,37]];
 return <svg className="zanhua-seal-face" viewBox="0 0 100 100" aria-hidden="true">
  <defs><filter id={grain} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="3" seed="17" result="noise"/><feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 3 3 0 -3.6" result="wear"/><feComposite in="SourceGraphic" in2="wear" operator="in"/></filter></defs>
  <image href={sealArt.impression} x="-5" y="-5" width="110" height="110"/>
  <g fill="#b34539" filter={`url(#${grain})`}>{glyphs.map((glyph,n)=>{
   const [x,y,width,height]=cells[n];
   return <svg key={n} x={x} y={y} width={width} height={height} viewBox={glyph.box} preserveAspectRatio="none"><text x="0" y="0" fontFamily={sealFontFamily} fontSize="100">{glyph.char}</text></svg>;
  })}</g>
 </svg>;
}

export function ZanhuaPlayerSeal({viewport,text,pressing=false}:{viewport:SceneViewport;text:string;pressing?:boolean}){
 const {view}=viewport,s=zanhuaPlayerSeal,size=s.size*view.scale;
 return <div className={`zanhua-player-seal${pressing?' is-revealing':''}`} style={{left:view.x+s.x*view.scale-size/2,top:view.y+s.y*view.scale-size/2,width:size,height:size}} role="img" aria-label={`我的觀畫紀念印：${text}（遊戲新增）`}><SealFace text={text}/></div>;
}

export function ZanhuaSealRitual({viewport,busy,seal,onStamp,onExplore,onCover}:{viewport:SceneViewport;busy:boolean;seal:string|null;onStamp:(text:string)=>void;onExplore:()=>void;onCover:()=>void}){
 const [draft,setDraft]=useState('觀畫留記'),[pressed,setPressed]=useState<string|null>(null);
 const [artReady,setArtReady]=useState(false),[artFailed,setArtFailed]=useState(false),[artAttempt,setArtAttempt]=useState(0);
 const root=useRef<HTMLDivElement>(null),target=useRef<HTMLButtonElement>(null),next=useRef<HTMLButtonElement>(null);
 const stamp=useRef(onStamp);stamp.current=onStamp;
 const composing=useRef(false);
 const field=useId();
 const done=Boolean(seal),pressing=Boolean(pressed)&&!done;
 const waiting=busy||!artReady;
 const text=Array.from(draft.trim().replace(/\s/gu,'')).slice(0,4).join('')||'觀畫留記';
 const missing=Array.from(text).filter(char=>!zanhuaSealCharacters.has(char));
 const invalid=missing.length>0;
 useChapterFocus(root,true,()=>{if(!pressing&&!busy)onExplore();});
 useEffect(()=>{
  let live=true;setArtReady(false);setArtFailed(false);
  Promise.all([loadSealFont(),...Object.values(sealArt).map(src=>new Promise<void>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve();image.onerror=()=>reject();image.src=src;}))]).then(()=>{if(live)setArtReady(true);},()=>{if(live)setArtFailed(true);});
  return()=>{live=false;};
 },[artAttempt]);
 useEffect(()=>{if(waiting||pressing)root.current?.focus({preventScroll:true});else(done?next:target).current?.focus({preventScroll:true});},[waiting,pressing,done]);
 useEffect(()=>{
  if(!pressed||seal)return;
  const timer=setTimeout(()=>stamp.current(pressed),matchMedia('(prefers-reduced-motion: reduce)').matches?0:1600);
  return()=>clearTimeout(timer);
 },[pressed,seal]);
 const {view}=viewport,s=zanhuaPlayerSeal,size=s.size*view.scale;
 const point={x:view.x+s.x*view.scale,y:view.y+s.y*view.scale};
 return <div ref={root} tabIndex={-1} className="zanhua-seal-ritual" role="dialog" aria-modal="true" aria-label="蓋下我的觀畫紀念印" aria-busy={!artFailed&&(waiting||pressing)}>
  {!done&&!pressing&&!waiting&&<button ref={target} className="zanhua-seal-target" disabled={invalid} style={{left:point.x,top:point.y,width:Math.max(64,size+20),height:Math.max(64,size+20)}} aria-label={`在空白裝裱處蓋下「${text}」印章`} onClick={()=>setPressed(text)}><span style={{width:size,height:size}}><SealFace text={invalid?defaultSealText:text}/></span></button>}
  {pressing&&<>
   <ZanhuaPlayerSeal viewport={viewport} text={pressed!} pressing/>
   <div className="zanhua-stamp-tool" style={{left:point.x,top:point.y,width:size*1.55,height:size*2.1}} aria-hidden="true"><img src={sealArt.stone} alt="" draggable={false}/></div>
  </>}
  <section className="lantern-observation-note zanhua-seal-note" aria-label="觀畫留印">
   <p className="lantern-observation-eyebrow">一卷讀畢 · 觀畫留印</p>
   <h2>{done?'這一卷，留下你的印記':'把這次相遇，留在卷旁'}</h2>
   <p className="lantern-note-body" role="status">{artFailed?'印章素材暫未載入，請再試一次。':waiting?'回到畫卷，備好印章。':pressing?'落印，稍停，再輕輕提起。':done?'從一張面孔開始，讀過盛裝與生活。這方朱印，記下你曾在畫中停留。':'在舊藏印旁的空白處，蓋下屬於你的觀畫紀念印。'}</p>
   {!done&&<label className="zanhua-seal-field" htmlFor={field}>我的印文 <input id={field} value={draft} disabled={waiting||pressing} aria-invalid={invalid} aria-describedby={invalid?`${field}-error`:undefined} onCompositionStart={()=>{composing.current=true;}} onCompositionEnd={event=>{composing.current=false;setDraft(Array.from(event.currentTarget.value).slice(0,4).join(''));}} onChange={event=>setDraft(composing.current?event.target.value:Array.from(event.target.value).slice(0,4).join(''))} onBlur={()=>setDraft(text)} placeholder="觀畫留記" autoComplete="off"/><span>至多四字</span></label>}
   {!done&&!waiting&&!pressing&&<div className="zanhua-seal-proof"><div role="img" aria-label={`篆書印樣：${invalid?defaultSealText:text}`}><SealFace text={invalid?defaultSealText:text}/></div><p>篆書印樣<span>自右向左，從上往下讀</span></p></div>}
   {!done&&invalid&&<p id={`${field}-error`} className="zanhua-seal-error" role="status">「{[...new Set(missing)].join('、')}」暫無此篆體字形，請換一字再落印。</p>}
   <p className="lantern-note-caption">{done?`「${seal}」 · 我的觀畫紀念`:'印位在左方朱印虛影處，輕點即可落印。'}<br/>此印為遊戲紀念，原有鑑藏印仍是畫卷的歷史線索。</p>
   <a className="zanhua-seal-font-credit" href="https://xiaoxue.iis.sinica.edu.tw/chongxi/" target="_blank" rel="noreferrer">篆字：崇羲篆體 · 王心怡等製作</a>
   {artFailed?<button className="lantern-note-next" onClick={()=>setArtAttempt(value=>value+1)}>重新備印<ArrowRight size={18}/></button>:done?<div className="zanhua-seal-actions"><button ref={next} className="lantern-note-next" onClick={onCover}>回到本章封面<ArrowRight size={18}/></button><button className="lantern-return-link" onClick={onExplore}>留在畫中自由探索<ArrowRight size={17}/></button></div>:<button className="lantern-note-next" disabled={waiting||pressing||invalid} onClick={()=>setPressed(text)}>{waiting?'正在備印':pressing?'正在落印':'蓋下我的印章'}<ArrowRight size={18}/></button>}
  </section>
 </div>;
}
