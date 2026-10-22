import {useEffect} from 'react';
import {assetPath} from '../game/assets.ts';
import '../lantern.css';
import '../lantern-observation.css';
import '../kangqu-ensemble.css';

const reference=assetPath('art/animations/kangqu-flags-v1/original-reference.png');
const master=assetPath('art/animations/kangqu-flags-v1/group-master.png');
/** Whole-group drawing review, before creating animation from the unified master. */
export function KangquFlagsMasterReview({onBack}:{onBack:()=>void}){
 useEffect(()=>{const title=document.title;document.title='持旗群像 · 整組摹繪稿';return()=>{document.title=title;};},[]);
 return <main className="lantern-game kangqu-ensemble-pose-review kangqu-ensemble-master-review kangqu-flags-master-review">
  <section className="lantern-paper kangqu-ensemble-pose-paper" aria-labelledby="ensemble-master-title">
   <header className="kangqu-ensemble-pose-heading">
    <div><p className="lantern-observation-eyebrow">在人群中聽樂 · 群像摹繪初稿</p><h1 id="ensemble-master-title">人物與旗面，一起摹繪</h1></div>
    <button className="lantern-text-button" onClick={onBack}>返回動畫樣段</button>
   </header>
   <p className="kangqu-ensemble-pose-intro">兩位持旗者、兩位隨員和兩面黑旗一起摹繪，動畫以這一組底稿繪製。</p>
   <div className="kangqu-ensemble-pose-grid kangqu-ensemble-master-grid">
    <figure><a href={reference} target="_blank" rel="noreferrer"><img className="kangqu-ensemble-master-image" src={reference} alt="原畫局部：兩位紅袍持旗者、身旁隨員與兩面黑旗"/></a><figcaption><h2>原畫局部</h2><p>以原畫的人物、站位和器物為參考。</p></figcaption></figure>
    <figure><a href={master} target="_blank" rel="noreferrer"><img className="kangqu-ensemble-master-image kangqu-ensemble-master-art" src={master} alt="持旗群像透明背景摹繪稿：四位紅袍人物與兩面黑旗合為一組"/></a><figcaption><h2>整組摹繪初稿</h2><p>人物、旗桿與旗面合為一張透明圖層。<a className="lantern-text-button" href={master} target="_blank" rel="noreferrer">放大看摹繪稿</a></p></figcaption></figure>
   </div>
   <p className="kangqu-ensemble-pose-limit">這是依原畫製作的摹繪，並非原畫證據。可對照人物與旗面的比例、筆觸與前後遮擋。</p>
  </section>
 </main>;
}
