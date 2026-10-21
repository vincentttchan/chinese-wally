import { useLayoutEffect, useRef, useState } from 'react';
import { kangquChapterDocument } from '../game/historicalChapters.ts';
import { returnToChapterCover } from '../game/chapterCover.ts';
import '../lantern.css';
import '../historical-paintings.css';

/** Isolate chapter state; the child document uses the site's immersive UI styles. */
export function KangquGame() {
  const localFile=window.location.protocol==='file:';
  const frame=useRef<HTMLIFrameElement>(null);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  const [revision,setRevision]=useState(0);
  useLayoutEffect(()=>{
    if(localFile){window.location.replace(new URL(kangquChapterDocument,window.location.href).href);return;}
    const previousTitle=document.title;
    document.title='在人群中聽樂 · 畫中有案';
    const receive=(event:MessageEvent)=>{
      if(event.source!==frame.current?.contentWindow||event.origin!==window.location.origin)return;
      if(event.data?.type==='kangqu-chapter-ready')setStatus('ready');
      if(event.data?.type==='kangqu-chapter-error')setStatus('error');
    };
    window.addEventListener('message',receive);
    const timer=window.setTimeout(()=>setStatus(value=>value==='ready'?value:'error'),20000);
    const chapterFrame=frame.current;
    return ()=>{chapterFrame?.contentWindow?.postMessage({type:'kangqu-host-stop'},window.location.origin);window.removeEventListener('message',receive);window.clearTimeout(timer);document.title=previousTitle;};
  },[revision,localFile]);
  const retry=()=>{setStatus('loading');setRevision(value=>value+1);};
  if(localFile)return <main className="kangqu-chapter-host lantern-game"><section className="scene-status"><p>在人群中聽樂</p><a className="lantern-text-button" href={kangquChapterDocument}>回到本章封面</a></section></main>;
  return <main className="kangqu-chapter-host lantern-game" aria-label="在人群中聽樂歷史畫作章節">
    <iframe ref={frame} key={revision} src={`${kangquChapterDocument}?v=audience-seven-hit-contour-20261021`} className="kangqu-chapter-frame" title="在人群中聽樂：尋人、原畫觀察與街衢見聞冊" tabIndex={status==='ready'?0:-1} onLoad={()=>frame.current?.contentWindow?.postMessage({type:'kangqu-host-ping'},window.location.origin==='null'?'*':window.location.origin)} onError={()=>setStatus('error')}/>
    {status!=='ready'&&<section className="scene-status" role="status" aria-live="polite">
      <p>{status==='loading'?'正在展開畫卷…':'畫卷仍未展開，可以重新載入。'}</p>
      {status==='error'&&<button className="small-button" onClick={retry}>重新展開</button>}
      <button className="lantern-text-button" onClick={returnToChapterCover}>回到本章封面</button>
    </section>}
  </main>;
}
