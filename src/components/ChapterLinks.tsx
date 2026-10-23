import {useLayoutEffect, useRef} from 'react';
import {keepCurrentChapterVisible} from '../chapterNavigation.js';
import { chapterHref, chapters } from '../game/chapters.ts';
import { historicalChapters, historicalChapterHref } from '../game/historicalChapters.ts';
import { assetPath } from '../game/assets.ts';

/** Every cover exposes the same chapter entries. */
export function ChapterLinks({current}: {current?:string}) {
  const navigation = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (navigation.current) return keepCurrentChapterVisible(navigation.current);
  }, [current]);
  return <nav ref={navigation} className="chapter-links" aria-label="選擇畫卷">
    {historicalChapters.map(chapter=><a key={chapter.id} href={historicalChapterHref(chapter)} data-preload-src={chapter.id==='lantern-festival'?assetPath('art/lantern-festival/full-scroll.jpg'):chapter.image} aria-current={current===chapter.id?'page':undefined}>
      {chapter.title}
    </a>)}
    {Object.values(chapters).map(chapter=><span key={chapter.id}>
      {chapter.available===false?<span className="chapter-pending" aria-disabled="true">{chapter.scene.title} · 待展</span>:<a href={chapterHref(chapter.id)} aria-current={current===chapter.id?'page':undefined}>{chapter.id==='examination'?'榜下尋人':chapter.scene.title}</a>}
    </span>)}
  </nav>;
}
