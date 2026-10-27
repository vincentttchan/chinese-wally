import {useLayoutEffect, useRef} from 'react';
import {keepCurrentChapterVisible} from '../chapterNavigation.js';
import { historicalChapters, historicalChapterHref, isHistoricalChapterLocked } from '../game/historicalChapters.ts';
import { assetPath } from '../game/assets.ts';

/** Every cover exposes the same chapter entries. */
export function ChapterLinks({current}: {current?:string}) {
  const navigation = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (navigation.current) return keepCurrentChapterVisible(navigation.current);
  }, [current]);
  return <nav ref={navigation} className="chapter-links" aria-label="選擇畫卷">
    {historicalChapters.map(chapter=>isHistoricalChapterLocked(chapter)?<span key={chapter.id} className="chapter-pending" aria-disabled="true">{chapter.title} · 已上鎖</span>:<a key={chapter.id} href={historicalChapterHref(chapter)} data-preload-src={chapter.id==='lantern-festival'?assetPath('art/lantern-festival/full-scroll.jpg'):chapter.image} aria-current={current===chapter.id?'page':undefined}>
      {chapter.title}
    </a>)}

  </nav>;
}
