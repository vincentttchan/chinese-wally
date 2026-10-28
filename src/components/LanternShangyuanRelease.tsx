import {useEffect} from 'react';
import {assetPath} from '../game/assets.ts';
export function LanternShangyuanRelease(){
 const documentPath=assetPath('chapters/lantern-shangyuan-v2-0.1.8-live/index.html');
 useEffect(()=>{const title=document.title;document.title='宮中鬧元宵 · 上元隨記';if(window.location.protocol==='file:')window.location.replace(new URL(documentPath,window.location.href).href);return()=>{document.title=title;};},[documentPath]);
 return <main data-chapter-preview="lantern-shangyuan" aria-label="宮中鬧元宵歷史畫作章節"><iframe title="宮中鬧元宵 · 上元隨記" src={`${documentPath}?v=0.1.8-20261028`} style={{position:'fixed',inset:0,width:'100%',height:'100%',border:0,display:'block'}} allow="fullscreen"/></main>;
}
