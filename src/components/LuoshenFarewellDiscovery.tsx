import {useState} from 'react';
import {assetPath} from '../game/assets.ts';
export const farewellStudies=[
 {label:'神女',file:'farewell-goddess-study-v1.png',frame:'112 95 1034 1148'},
 {label:'曹植',file:'farewell-cao-study-v1.png',frame:'187 23 904 1262'}
] as const;
function FarewellArt({index}:{index:0|1}){
 const [failed,setFailed]=useState(false),art=farewellStudies[index];
 if(failed)return <span className="luoshen-farewell-art-fallback" role="status">圖樣暫未載入</span>;
 return <svg className="luoshen-farewell-art" viewBox={art.frame} role="img" aria-label={art.label+'半身姿態摹繪，原畫為準'}><image href={assetPath('art/luoshen/'+art.file)} width="1210" height="1300" onError={()=>setFailed(true)}/></svg>;
}
export function LuoshenFarewellDiscovery({comparison}:{comparison:boolean}){
 return <figure className="luoshen-farewell-studies" aria-label={comparison?'兩人姿態小記':'記下神女的姿態'}><div>{(comparison?[0,1] as const:[0] as const).map(index=><div key={index}><FarewellArt index={index}/><span>{farewellStudies[index].label}<small> · 摹繪</small></span></div>)}</div><figcaption>依原畫可見半身姿態製作的摹繪；兩人位置仍以原畫為準。</figcaption></figure>;
}
