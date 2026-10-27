import { useEffect } from 'react';
import { historicalChapters, historicalChapterHref, isHistoricalChapterLocked } from '../game/historicalChapters.ts';
import '../historical-paintings.css';
import { ArrowRight } from './ArtIcons.tsx';

export function HistoricalPaintings() {
  useEffect(()=>{const previous=document.title;document.title='歷史畫作 · 畫中有案';return()=>{document.title=previous;};},[]);
  return <main className="historical-paintings" aria-labelledby="historical-paintings-title">
    <header className="historical-paintings-heading"><span className="historical-kicker">畫中尋人</span><h1 id="historical-paintings-title">展開一幅歷史畫作</h1><p>先記住樣貌，再走進原畫。尋人之後，留步看看人物與身旁的細節。</p></header>
    <section className="historical-paintings-list" aria-label="選擇歷史畫作">
      {historicalChapters.map(chapter=><article key={chapter.id} className={`historical-painting-entry historical-painting-${chapter.id}`}>
        {isHistoricalChapterLocked(chapter) ? <div className="historical-painting-preview" aria-disabled="true"><img src={chapter.image} alt={chapter.imageAlt} decoding="async"/><span className="historical-preview-note">已上鎖</span></div> : <a className="historical-painting-preview" href={historicalChapterHref(chapter)} aria-label={`入畫尋人：${chapter.title}`}>
          <img src={chapter.image} alt={chapter.imageAlt} decoding="async"/>
          <span className="historical-preview-note">原畫局部</span>
        </a>}
        <div className="historical-painting-heading"><span className="historical-kicker">{chapter.painting}</span><span className="historical-painting-status">{chapter.status}</span></div>
        <h2>{chapter.title}</h2><p>{chapter.description}</p>
        {isHistoricalChapterLocked(chapter) ? <span className="historical-enter chapter-pending" aria-disabled="true">已上鎖</span> : <a className="historical-enter" href={historicalChapterHref(chapter)}>入畫尋人 <ArrowRight size={22}/></a>}
      </article>)}
    </section>
  </main>;
}
