import {ChapterDialog} from './ChapterDialog.tsx';
import {ArrowRight} from './ArtIcons.tsx';
const sources=[['中國國家博物館：唐代女服與生活','https://www.chnmuseum.cn/yj/xscg/xslw/201812/t20181224_33161.shtml'],['遼博副館長談《簪花仕女圖》','https://www.neac.gov.cn/seac/xwzx/202606/1191211.shtml'],['河南博物院：戴帷帽騎馬女俑','https://www.chnmus.net/ch/collection/appraise/details.html?id=512157604994293381']];
export function ZanhuaLifeSummary({collected,onSeal}:{collected:number;onSeal:()=>void}){
 return <ChapterDialog label="唐代婦女生活小結" className="zanhua-life-summary" onClose={onSeal}>
  <header className="zanhua-summary-heading"><p className="lantern-eyebrow">一卷讀畢 · 簪花仕女圖</p><h2>盛裝之中，看見怎樣的生活？</h2>
  <p className="zanhua-summary-intro">從逗犬、拈花到執扇的身影，這一卷留下了貴族女子遊賞生活的一個片刻。</p></header>
  <div className="zanhua-summary-sections">
   <section><div className="zanhua-summary-topic"><span>畫中衣飾</span><h3>一身盛裝的層次</h3></div><p>長裙、紗衣與披帛交疊，高髻再配花飾。唐代女服隨時期改變；畫中盛裝呈現了上層女性的審美與身分。</p></section>
   <section><div className="zanhua-summary-topic"><span>文物對照</span><h3>庭園以外的生活</h3></div><p>畫中有人賞花、逗犬，其他唐代文物則留下女子騎馬出行的形象。那是另一類生活線索，並非這卷畫直接畫出的情節。</p></section>
   <section><div className="zanhua-summary-topic"><span>人物與處境</span><h3>同在畫中，各有日常</h3></div><p>有人拈花遊賞，有人雙手執扇侍奉。身分與處境不同，生活也不同；這幾位盛裝女子，不能概括所有唐代婦女。</p></section>
  </div>
  <footer className="zanhua-summary-footer"><p className="zanhua-summary-progress">已尋得三位女子 <span>見聞冊 {collected}／4 類</span></p><p className="zanhua-summary-optional">收藏不必集齊，隨時可以回畫中探索。</p>
  <details><summary>資料依據與演繹說明</summary><p>衣飾摹繪含補繪；人物對白、表情及動作均為遊戲演繹。本幅無作者落款，傳為周昉作，作者與成畫年代仍有討論。</p>{sources.map(([label,url])=><p key={url}><a href={url} target="_blank" rel="noreferrer">{label} ↗</a></p>)}</details>
  <div className="lantern-paper-actions"><button className="lantern-quiet-button" onClick={onSeal}>回畫中，蓋下我的印章<ArrowRight size={17}/></button></div></footer>
 </ChapterDialog>;
}
