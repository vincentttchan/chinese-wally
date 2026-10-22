import {useState} from 'react';
import {assetPath} from '../game/assets.ts';

export const hairstyleStudies=[
 {label:'榻前',file:'hair-seat-study-v1.png',frame:'295 209 796 848'},
 {label:'初見',file:'hair-first-study-v1.png',frame:'277 101 724 1049'}
] as const;
function HairstyleArt({index}:{index:0|1}){
 const [failed,setFailed]=useState(false),study=hairstyleStudies[index];
 if(failed)return <span className="luoshen-hair-art-fallback" role="status">圖樣暫未載入</span>;
 return <svg className="luoshen-hair-art" viewBox={study.frame} role="img" aria-label={study.label+'髮式摹繪，原畫為準'}><image href={assetPath('art/luoshen/'+study.file)} width="1254" height="1254" onError={()=>setFailed(true)}/></svg>;
}
export function LuoshenHairStudies({comparison=false}:{comparison?:boolean}){
 return <figure className="luoshen-hair-studies" aria-label={comparison?'兩處髮式摹繪比較':'記下榻前髮式'}>
  <div>{(comparison?[0,1] as const:[0] as const).map(index=><div key={index}><HairstyleArt index={index}/><span>{hairstyleStudies[index].label}<small> · 摹繪</small></span></div>)}</div>
  <figcaption>依原畫製作的去背髮式摹繪，原畫為準。</figcaption>
 </figure>;
}

/** Archived coordinates for previous offline evidence; these are no longer rendered in the game. */
export const hairContours=[
 {label:'榻前',x:11625,y:325,path:'M8 22 C5 14 13 3 21 6 C31 2 38 6 35 14 C33 23 21 26 15 22 M20 22 C19 14 29 6 37 8 C47 13 35 23 26 24',box:'0 0 50 40'},
 {label:'初見',x:16700,y:357,path:'M8 33 C0 24 1 4 8 8 C16 7 22 8 19 17 L14 33 M19 10 C26 3 36 5 37 12 C39 22 30 31 27 34',box:'0 0 50 40'}
] as const;

