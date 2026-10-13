import {useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import {useChapterFocus} from './ChapterDialog.tsx';
import {qingmingFindings,qingmingArt,passageAt} from '../game/qingming.ts';
import type {QingmingSave} from '../game/qingmingState.ts';

export function QingmingJournal({save,onClose,onLook}:{save:QingmingSave;onClose:()=>void;onLook:(actorId:string)=>void}){
 const ref=useRef<HTMLElement>(null);
 const [selected,setSelected]=useState<string|null>(null),[looking,setLooking]=useState(false);
 const close=()=>{if(looking)setLooking(false);else onClose();};
 useChapterFocus(ref,true,close);
 const item=qingmingFindings.find(f=>f.id===selected);
 const source=item?passageAt(item.stageId):undefined;
 const count=Object.keys(save.origins).length;
 const readCount=save.read.length;
 return <section ref={ref} tabIndex={-1} className={`lantern-journal-layer lantern-field-journal ${looking?'is-looking':''}`} style={{'--journal-texture':`url('${qingmingArt('full-scroll.jpg')}')`,pointerEvents:looking?'none':undefined} as CSSProperties} role="dialog" aria-modal={!looking} aria-label="汴京見聞冊">
  <div className="collection-paper" aria-hidden="true"/>
  <div className="collection-reading" inert={looking}>
   <header className="collection-header"><p className="collection-kicker">畫中見聞 · 圖文對讀</p><div className="collection-title-row"><h1>汴京見聞冊</h1><span>已收藏 {count}／{qingmingFindings.length}</span></div><button className="collection-close" onClick={close} aria-label="合上見聞冊">×</button></header>
   <div className="collection-pages">
    {!item?<div className="collection-overview"><p className="collection-introduction">{readCount?`已對讀 ${readCount} 段史料。較長解說在這裏選讀。`:'點看畫中細節，收下見聞；主線會帶你對讀短史料。'}</p><div className="collection-grid">{qingmingFindings.map(f=>{
     const found=Boolean(save.origins[f.id]),read=save.read.includes(f.stageId),available=found||read;
     return <button key={f.id} className={`collection-item ${available?'is-collected':'is-undiscovered'}`} disabled={!available} onClick={()=>setSelected(f.id)} aria-label={available?`翻閱${f.title}`:`未發現：${f.hint}`}><span className={`collection-illustration qingming-journal-art ${available?'':'is-locked'}`}><img src={qingmingArt(f.art)} alt=""/></span><span className="collection-item-name">{available?f.title:'未發現'}</span><span className="collection-item-state">{found?'已收藏':read?'已對讀':f.hint}</span></button>;
    })}</div><p className="collection-body">運輸、商品與各種服務，連成汴京的城市生活。</p></div>:<article className="collection-detail" key={item.id}>
     <button className="collection-back" onClick={()=>setSelected(null)}>← 全部見聞</button><div className="collection-detail-heading"><p>{save.origins[item.id]?'我的首次發現':'主線圖文對讀'}</p><h2>{item.title}</h2></div>
     <figure className="collection-detail-art"><span className="collection-illustration qingming-journal-art"><img src={qingmingArt(item.art)} alt={`原畫裁圖：${item.title}`}/></span><figcaption>原畫局部裁圖<br/>保留原畫，不生成補畫</figcaption></figure>
     <p className="collection-body">{item.note}</p>
     {source&&<><p className="collection-observe">《東京夢華錄》{source.volume}〈{source.title}〉</p><blockquote className="qingming-source-quote">{source.quote}</blockquote><p className="collection-body">{source.gloss}</p><p className="collection-body">{source.context}</p></>}
     <button className="collection-look" onClick={()=>{const origin=save.origins[item.id]??item.actorIds[0];setLooking(true);onLook(origin);}}>看看畫中位置 <span aria-hidden="true">↗</span></button>
     <details className="collection-source"><summary>史料、原畫與解讀範圍</summary><p>《東京夢華錄》由孟元老在南宋追記北宋東京生活；店名、人物與書中地址不逐一等同原畫。角色对白為遊戲虛構。</p>{source&&<a href={source.url} target="_blank" rel="noreferrer">《東京夢華錄》{source.volume}原文</a>}<a href="https://www.dpm.org.cn/collection/paint/228226.html" target="_blank" rel="noreferrer">故宮博物院 · 原畫介紹</a><p>畫中招牌釋讀與局部類別另參考故宮講壇及研究；古籍使用公開轉錄，完整校注仍需對照版本。</p><p>城市化的變化、人口增長及海外貿易，不能單由這幅畫推出。</p></details>
    </article>}
   </div><footer className="collection-footer">收藏按這六處具體見聞去重，保留首次位置；再尋一次仍保留。</footer>
  </div>
  <button className="collection-return" style={{pointerEvents:'auto'}} onClick={onClose}>← 回到長卷</button>
  {looking&&<button className="collection-resume" style={{pointerEvents:'auto'}} onClick={()=>setLooking(false)}>繼續閱讀 →</button>}
 </section>;
}
