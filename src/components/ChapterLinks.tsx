import { chapterHref, chapters } from '../game/chapters.ts';
import { historicalChapters, historicalChapterHref } from '../game/historicalChapters.ts';
import { assetPath } from '../game/assets.ts';

/** Every cover exposes the same chapter entries. */
export function ChapterLinks({current}: {current?:string}) {
  return <nav className="chapter-links" aria-label="選擇畫卷">
    {historicalChapters.map(chapter=><a key={chapter.id} href={historicalChapterHref(chapter)} data-preload-src={chapter.id==='lantern-festival'?assetPath('art/lantern-festival/full-scroll.jpg'):chapter.image} aria-current={current===chapter.id?'page':undefined}>
      <span>{chapter.painting.split(' · ')[0]}</span>{chapter.title}
    </a>)}
    {Object.values(chapters).map(chapter=><span key={chapter.id}>
      {chapter.available===false?<span className="chapter-pending" aria-disabled="true"><span>卷一</span>{chapter.scene.title} · 待展</span>:<a href={chapterHref(chapter.id)} aria-current={current===chapter.id?'page':undefined}><span>卷一</span>{chapter.scene.title}</a>}
    </span>)}
  </nav>;
}
