import {useEffect} from 'react';
import {assetPath} from '../game/assets.ts';
import '../lantern.css';
import '../lantern-observation.css';
import '../kangqu-ensemble.css';

const reference=assetPath('art/animations/kangqu-ensemble-master-v7/original-reference.png');
const master=assetPath('art/animations/kangqu-ensemble-master-v7/group-master.png');
/** Whole-group drawing review, before creating animation from the unified master. */
export function KangquEnsembleMasterReview({onBack}:{onBack:()=>void}){
 useEffect(()=>{const title=document.title;document.title='亭內樂隊 · 整組摹繪稿';return()=>{document.title=title;};},[]);
 return <main className="lantern-game kangqu-ensemble-pose-review kangqu-ensemble-master-review">
  <section className="lantern-paper kangqu-ensemble-pose-paper" aria-labelledby="ensemble-master-title">
   <header className="kangqu-ensemble-pose-heading">
    <div><p className="lantern-observation-eyebrow">在人群中聽樂 · 群像摹繪初稿</p><h1 id="ensemble-master-title">先把三人畫成同一組</h1></div>
    <button className="lantern-text-button" onClick={onBack}>返回動畫樣段</button>
   </header>
   <p className="kangqu-ensemble-pose-intro">三人的衣著、樂器與前後遮擋一起摹繪，動畫以這一組底稿繪製。</p>
   <div className="kangqu-ensemble-pose-grid kangqu-ensemble-master-grid">
    <figure><a href={reference} target="_blank" rel="noreferrer"><img className="kangqu-ensemble-master-image" src={reference} alt="原畫局部：前方鼓手、後方持鈸者與右側敲鑼者"/></a><figcaption><h2>原畫局部</h2><p>以原畫的人物、站位和器物為參考。</p></figcaption></figure>
    <figure><a href={master} target="_blank" rel="noreferrer"><img className="kangqu-ensemble-master-image kangqu-ensemble-master-art" src={master} alt="三人群像透明背景摹繪稿：三位樂手、鼓、鈸、鑼及座凳合為一組"/></a><figcaption><h2>整組摹繪初稿</h2><p>三人、樂器與座凳合為一張透明圖層。<a className="lantern-text-button" href={master} target="_blank" rel="noreferrer">放大看摹繪稿</a></p></figcaption></figure>
   </div>
   <p className="kangqu-ensemble-pose-limit">這是依原畫製作的摹繪，並非原畫證據。可對照三人的比例、筆觸與前後遮擋。</p>
  </section>
 </main>;
}
