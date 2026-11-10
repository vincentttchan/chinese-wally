import {useEffect,useRef,useState} from 'react';
import {ChapterDialog} from './ChapterDialog.tsx';
import {ArrowRight} from './ArtIcons.tsx';
const sources=[['中國國家博物館：唐代女服與生活','https://www.chnmuseum.cn/yj/xscg/xslw/201812/t20181224_33161.shtml'],['遼博副館長談《簪花仕女圖》','https://www.neac.gov.cn/seac/xwzx/202606/1191211.shtml'],['河南博物院：戴帷帽騎馬女俑','https://www.chnmus.net/ch/collection/appraise/details.html?id=512157604994293381']];
const topics=[
 {title:'一身盛裝的層次',body:'從曳地長裙看向薄紗與披帛，再抬頭看看高髻和花飾。這些衣飾疊在一起，呈現了畫中女子遊賞時的盛裝。'},
 {title:'庭園以外的生活',body:'這卷畫留住了賞花和逗犬的一刻。再看看唐代的騎馬女俑，也能見到女子戴着帷帽、騎馬出行的形象。'},
 {title:'同在畫中，各有日常',body:'一位女子伸手拈花，身旁的侍女雙手執扇。同一刻，有人遊賞，有人在旁侍奉。兩人的動作讓我們看見她們各自的處境。'},
];
export function ZanhuaLifeSummary({collected,onSeal,onFinish,onDismiss}:{
 collected:number;onSeal:()=>void;onFinish?:()=>void;onDismiss?:()=>void;
}){
 const [page,setPage]=useState(0);
 const heading=useRef<HTMLHeadingElement>(null);
 const topic=topics[page],last=page===topics.length-1;
 useEffect(()=>{heading.current?.focus({preventScroll:true});},[page]);
 return <ChapterDialog label="唐代婦女生活小結" className="zanhua-life-summary" onClose={onDismiss??onSeal}>
  <header className="zanhua-summary-heading">
   <p className="lantern-eyebrow">簪花仕女圖 · 小結 {page+1}／{topics.length}</p>
   <h2 ref={heading} tabIndex={-1}>{topic.title}</h2>
   <p className="zanhua-summary-intro">{topic.body}</p>
  </header>
  <footer className="zanhua-summary-footer">
   {last&&<>
    <p className="zanhua-summary-progress">已尋得三位女子 <span>見聞冊 {collected}／4 類</span></p>
    <details><summary>資料依據與演繹說明</summary><p>衣飾摹繪含補繪。人物對白、表情及動作均為遊戲演繹。本幅無作者落款，傳為周昉作，作者與成畫年代仍有討論。</p>{sources.map(([label,url])=><p key={url}><a href={url} target="_blank" rel="noreferrer">{label} ↗</a></p>)}</details>
   </>}
   <div className="lantern-paper-actions">
    {page>0&&<button className="lantern-return-link" onClick={()=>setPage(page-1)}>上一頁</button>}
    {!last&&<button className="lantern-note-next" onClick={()=>setPage(page+1)}>下一頁<ArrowRight size={17}/></button>}
    {last&&onFinish&&<button className="lantern-note-next" onClick={onFinish}>讀畢此卷，返回畫坊<ArrowRight size={17}/></button>}
    {last&&<button className="lantern-quiet-button" onClick={onSeal}>{onFinish?'留印紀念':'回畫中，蓋下我的印章'}<ArrowRight size={17}/></button>}
   </div>
  </footer>
 </ChapterDialog>;
}
