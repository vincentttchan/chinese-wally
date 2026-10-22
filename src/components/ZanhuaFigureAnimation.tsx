import {useEffect,useId,useRef,useState} from 'react';
import {ZanhuaP1Expression,zanhuaP1ExpressionSources} from './ZanhuaP1Expression.tsx';
import {zanhuaDogPerformance,zanhuaDogPerformanceDuration} from '../game/zanhuaDogPerformance.ts';
import {ZanhuaCourtExpression,zanhuaCourtExpressionSources} from './ZanhuaCourtExpression.tsx';
import {zanhuaCourtPerformance,zanhuaCourtPerformanceDuration} from '../game/zanhuaCourtPerformance.ts';
import {zanhuaImage} from '../game/zanhuaPreview.ts';
import {zanhuaFigureBoundaries} from '../game/zanhuaAnimationBackdrop.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import {ZanhuaDogAnimation} from './ZanhuaDogAnimation.tsx';
import '../lantern-market.css';

export type ZanhuaFigureMotion='P1'|'P4'|'P6';
export const zanhuaMotionLabels=['逗犬','持花舒袖','斜首簪花'];
// Local coordinates in the unchanged original context crops: P4=[2790,0,770,1378], P6=[900,0,800,1378].
const armPath='M59 325 Q46 320 40 338 L41 357 L54 369 L43 384 L62 399 L63 408 Q47 415 49 435 Q62 451 89 453 L125 466 L119 513 L111 650 L114 815 L108 974 L80 1102 L54 1184 L40 1238 Q78 1263 125 1254 L178 1242 L212 1209 L195 1133 L209 1010 L199 825 L213 600 L216 486 L203 455 Q175 443 146 427 L91 409 L76 402 L77 390 L89 372 L83 357 L93 346 L83 328 Z';
// P6 outline is traced in its 450×450 head crop, offset (180,10) within the context.
// Keep the neck stationary: the jaw is the end of the moving silhouette.
const headPath='M150 92 Q178 83 210 92 Q248 98 279 119 Q307 135 314 161 Q325 190 302 221 L260 269 Q252 293 229 323 Q207 349 179 357 Q155 359 135 345 L106 309 Q88 310 75 304 Q68 298 79 288 L88 279 Q70 272 70 251 Q70 217 81 185 Q94 142 112 117 Q127 100 150 92 Z M183 28 Q190 16 205 19 L221 14 L235 19 L245 11 L260 16 L277 13 L293 22 L310 17 L330 27 L346 33 L358 48 L361 65 L354 79 L337 87 L320 90 L302 96 L280 108 L262 109 L227 94 L193 90 L189 65 Z M149 24 L163 22 L177 31 L183 46 L179 60 L170 75 L185 88 L183 99 L165 103 L145 96 L137 83 L140 69 L137 55 L142 42 Z';
const p4HeadPath='M268 80 Q320 70 366 85 L410 113 L436 170 L438 235 L418 295 L369 332 L349 355 L316 365 L288 356 L259 334 L240 308 L234 283 L239 244 L241 218 L221 201 L211 173 L215 127 Z M139 57 L153 31 L179 26 L201 9 L229 16 L252 3 L276 14 L303 26 L316 51 L302 80 L274 105 L248 122 L221 110 L194 114 L163 97 L145 79 Z';
const p1HeadPath='M380 113 Q430 100 489 110 Q548 116 579 156 L605 223 L604 285 L570 344 L595 383 L574 402 L542 409 L496 385 L449 350 L405 316 L371 267 L354 213 L363 158 Z M294 48 L311 29 L331 24 L343 7 L363 13 L386 4 L410 16 L437 9 L462 21 L489 20 L505 38 L506 58 L489 80 L462 99 L425 111 L391 126 L355 123 L332 102 L308 89 Z';
const p1LurePath='M506 576 L510 583 L163 834 L157 830 Z M153 830 L165 836 L145 865 L138 893 L122 906 L113 944 L88 1016 L55 1061 L80 1011 L107 924 L118 886 L132 862 Z';
const config={
 P1:{origin:5150,width:820,path:'',pivot:[500,580],caption:'垂首逗犬',lean:-32,body:'M380 113 Q430 100 489 110 Q548 116 579 156 L605 223 L604 285 L570 344 L605 390 L645 415 L672 475 L706 532 L720 646 L722 863 L731 1040 L717 1178 L685 1220 L630 1244 L518 1253 L430 1241 L303 1227 L182 1246 L98 1232 L22 1202 L14 1169 L52 1126 L117 1090 L174 1077 L226 1078 L302 998 L351 887 L389 749 L430 650 L444 608 L426 574 L421 510 L431 448 L445 393 L429 358 L405 316 L371 267 L354 213 L363 158 Z M294 48 L311 29 L331 24 L343 7 L363 13 L386 4 L410 16 L437 9 L462 21 L489 20 L505 38 L506 58 L489 80 L462 99 L425 111 L391 126 L355 123 L332 102 L308 89 Z M506 576 L510 583 L163 834 L157 830 Z M153 830 L165 836 L145 865 L138 893 L122 906 L113 944 L88 1016 L55 1061 L80 1011 L107 924 L118 886 L132 862 Z'},
 P4:{origin:2790,width:770,path:armPath,pivot:[195,480],caption:'持花舒袖',lean:18,body:'M268 83 Q321 70 363 87 L407 118 L432 171 L441 237 L423 290 L380 350 L421 370 L451 406 L469 455 L484 546 L489 695 L480 850 L504 1040 L529 1165 L554 1165 L586 1214 L656 1254 L720 1275 L754 1291 L762 1325 L742 1348 L682 1360 L601 1349 L502 1322 L399 1334 L304 1316 L232 1320 L169 1306 L138 1264 L72 1267 L32 1245 L48 1185 L81 1104 L108 974 L114 815 L109 644 L120 515 L124 468 L78 456 L46 443 L43 422 L57 401 L41 385 L53 368 L38 351 L39 331 L62 319 L85 326 L95 349 L84 376 L78 404 L99 414 L146 424 L190 445 L224 443 L244 406 L284 369 L312 351 L290 339 L260 313 L244 269 L239 215 L225 178 L221 129 Z M139 57 L153 31 L179 26 L201 9 L229 16 L252 3 L276 14 L303 26 L316 51 L302 80 L274 105 L248 122 L221 110 L194 114 L163 97 L145 79 Z'},
 P6:{origin:900,width:800,path:headPath,pivot:[310,335],caption:'斜首簪花',lean:14,body:'M285 315 L245 336 L191 369 L151 404 L132 399 L112 372 L89 363 L64 369 L72 390 L108 412 L105 432 L89 461 L82 496 L81 562 L69 678 L54 861 L49 1096 L64 1205 L85 1246 L121 1278 L133 1314 L172 1338 L252 1350 L336 1370 L437 1362 L524 1370 L626 1370 L721 1354 L763 1330 L774 1295 L748 1263 L704 1235 L642 1210 L589 1198 L552 1160 L521 1097 L496 973 L472 823 L449 686 L438 582 L419 518 L392 488 L365 438 L345 394 L367 366 L338 351 Z'},
};

/** The same traced silhouette can confirm a successful find on the original. */
export function zanhuaFigureContour(kind:'P1'|'P4'|'P6'){
 const spec=config[kind];
 // This absolute M/Q/L path is traced in the head crop, not the figure crop.
 const contextHead=headPath.replace(/(-?\d+) (-?\d+)/g,(_,x,y)=>`${Number(x)+180} ${Number(y)+10}`);
 const p6Outer=spec.body.replace('M285 315 L245 336','M245 336').replace('L338 351 Z','Q388 359 409 333 Q432 307 440 279 L482 231 Q505 200 494 171 Q487 145 459 129 Q428 108 390 102 Q358 93 330 102 Q307 110 292 127 Q274 152 261 195 Q250 227 250 261 Q250 282 259 298 Q247 314 260 317 L245 336 Z');
 return {path:kind==='P6'?`${p6Outer} ${contextHead.slice(contextHead.indexOf(' Z M')+3)}`:kind==='P1'?spec.body.replace(p1LurePath,''):spec.body,origin:spec.origin};
}

/** Original silhouettes move with explicitly derived expressive eye and mouth patches. */
export function ZanhuaFigureAnimation({kind,viewport,onDone,onError}:{kind:ZanhuaFigureMotion;viewport:SceneViewport;onDone:()=>void;onError:()=>void}){
 const id=`figure-${useId().replace(/:/g,'')}`,[elapsed,setElapsed]=useState(0),[opacity,setOpacity]=useState(0),[middles,setMiddles]=useState<number[]>([]);
 const done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
 const duration=kind==='P1'?zanhuaDogPerformanceDuration:zanhuaCourtPerformanceDuration;
 const spec=config[kind];
 const silkSource=kind==='P1'?5150:kind==='P4'?2700:1570;
 const bodyPath=kind==='P1'?spec.body.replace(p1LurePath,''):spec.body;
 const outlineTransform=kind==='P6'?'translate(180 10)':undefined;
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){done.current();return;}
  let live=true,raf=0,start:number|undefined,loaded=0;
  const fail=()=>{if(!live)return;live=false;clearTimeout(timeout);cancelAnimationFrame(raf);error.current();};
  const timeout=setTimeout(fail,8000);
  const tick=(now:number)=>{
   if(!live)return;start??=now;const time=now-start;
   if(time>=duration){live=false;done.current();return;}
   setElapsed(time);setOpacity(Math.min(1,time/280,(duration-time)/420));raf=requestAnimationFrame(tick);
  };
  const sources=kind==='P1'?[zanhuaImage,...zanhuaP1ExpressionSources]:[zanhuaImage,...zanhuaCourtExpressionSources(kind)];
  const images=sources.map(src=>{const image=new Image();image.onload=()=>{if(live&&++loaded===sources.length){
   try{setMiddles(zanhuaFigureBoundaries(bodyPath,spec.width,kind==='P6'?headPath:undefined));}
   catch{fail();return;}
   clearTimeout(timeout);raf=requestAnimationFrame(tick);
  }};image.onerror=fail;image.src=src;return image;});
  return()=>{live=false;clearTimeout(timeout);cancelAnimationFrame(raf);images.forEach(i=>{i.onload=null;i.onerror=null;});};
 },[kind]);
 const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
 const performance=zanhuaDogPerformance(elapsed);
 const court=kind==='P1'?null:zanhuaCourtPerformance(kind,elapsed);
 const gesture=kind==='P1'?performance.body:court!.body;
 const lureAngle=performance.lureAngle;
 const angle=kind==='P4'?court!.armAngle:court?.headAngle??0;
 const sleeveLag=court?.sleeveLag??0;
 const {view}=viewport;
 const original=<image href={zanhuaImage} x={-spec.origin} y="0" width="6455" height="1378"/>;
 const silhouette=<><path d={bodyPath}/>{kind==='P1'&&<path d={p1HeadPath} filter={`url(#${id}-cut-edge)`}/>} {kind==='P4'&&<path d={p4HeadPath} filter={`url(#${id}-cut-edge)`}/>} {kind==='P6'&&<path d={headPath} transform={outlineTransform} filter={`url(#${id}-cut-edge)`}/>}</>;
 // Continuous horizontal strips keep the feet fixed while the whole figure
 // shifts weight. Adjacent strips have identical transformed boundary points.
 const displacement=(y:number)=>{
  const upper=1-smooth((y-340)/960),hem=smooth((y-650)/220)*(1-smooth((y-1140)/170));
  const lag=Math.sin((elapsed-650)/750-(y-650)/380)*5*gesture*hem;
  return {x:spec.lean*gesture*upper+lag,y:-3*gesture*smooth(y/160)*upper};
 };
 const grip=displacement(580);
 const bands=Array.from({length:46},(_,n)=>{const top=n*30,height=Math.min(30,1378-top),a=displacement(top),b=displacement(top+height),shear=(b.x-a.x)/height,stretch=(b.y-a.y)/height;return {top,height,transform:`matrix(1 0 ${shear} ${1+stretch} ${a.x-shear*top} ${a.y-stretch*top})`};});
 return <div className="zanhua-dog-animation" role="status" aria-label={`${spec.caption}的遊戲演繹正在播放`}>
  <svg width="6455" height="1378" viewBox="0 0 6455 1378" style={{transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`,opacity}} aria-hidden="true">
   <defs>
    <pattern id={`${id}-silk`} patternUnits="userSpaceOnUse" width="80" height="1378"><svg width="80" height="1378" viewBox={`${silkSource} 0 80 1378`} preserveAspectRatio="none"><image href={zanhuaImage} width="6455" height="1378"/></svg></pattern>
    {kind==='P4'&&<mask id={`${id}-p4-head`} maskUnits="userSpaceOnUse" x="110" y="-15" width="360" height="425"><path d={p4HeadPath} fill="white" filter={`url(#${id}-cut-edge)`}/></mask>}
    {kind==='P1'&&<>
     <mask id={`${id}-head`} maskUnits="userSpaceOnUse" x="270" y="-15" width="370" height="450"><path d={p1HeadPath} fill="white" filter={`url(#${id}-cut-edge)`}/></mask>
     <clipPath id={`${id}-lure`}><path d={p1LurePath}/></clipPath>
     <mask id={`${id}-lure-clear`} maskUnits="userSpaceOnUse" x="0" y="550" width="560" height="540"><path d={p1LurePath} fill="white" stroke="white" strokeWidth="7" strokeLinejoin="round"/></mask>
    </>}
    {bands.map((band,n)=><clipPath key={n} id={`${id}-band-${n}`}><rect x="-120" y={band.top} width={spec.width+240} height={band.height+.4}/></clipPath>)}
    {middles.map((middle,n)=><g key={n}>
     <clipPath id={`${id}-left-${n}`}><rect x="-120" y="0" width={middle+120} height="1378"/></clipPath>
     <clipPath id={`${id}-right-${n}`}><rect x={middle} y="0" width={spec.width+120-middle} height="1378"/></clipPath>
    </g>)}
    <clipPath id={`${id}-silhouette`}><path d={spec.path} transform={outlineTransform}/></clipPath>
    <clipPath id={`${id}-upper`}><rect x="0" y="0" width="770" height="560.5"/></clipPath>
    <clipPath id={`${id}-lower`}><rect x="0" y="560" width="770" height="818"/></clipPath>
    <filter id={`${id}-edge`} x="-20%" y="-20%" width="140%" height="140%"><feMorphology operator="dilate" radius="1"/><feGaussianBlur stdDeviation=".7"/></filter>
    <filter id={`${id}-body-edge`} x="-20%" y="-20%" width="140%" height="140%"><feMorphology operator="dilate" radius="1.2"/><feGaussianBlur stdDeviation=".6"/></filter>
    <filter id={`${id}-cut-edge`} x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="dilate" radius="3"/></filter>
    <filter id={`${id}-soft`} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.2"/></filter>
    <mask id={`${id}-background`} maskUnits="userSpaceOnUse" x="-20" y="-20" width={spec.width+40} height="1418"><g fill="white" filter={`url(#${id}-edge)`}>{silhouette}</g></mask>
    <mask id={`${id}-moving`} maskUnits="userSpaceOnUse" x="-20" y="-20" width={spec.width+40} height="1418"><path d={spec.path} transform={outlineTransform} fill="white" filter={`url(#${id}-soft)`}/></mask>
    <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="-30" y="-30" width={spec.width+60} height="1438"><g fill="white" filter={`url(#${id}-body-edge)`}>{silhouette}</g>{kind==='P1'?<path d={p1HeadPath} fill="black" filter={`url(#${id}-cut-edge)`}/>:<path d={spec.path} transform={outlineTransform} fill="black" filter={`url(#${id}-cut-edge)`}/>} {kind==='P4'&&<path d={p4HeadPath} fill="black" filter={`url(#${id}-cut-edge)`}/>}</mask>
    <g id={`${id}-pose`}>
     <g mask={`url(#${id}-body)`}>{original}</g>
     {kind==='P1'&&<g transform={`rotate(${performance.headAngle} 560 405)`}><g mask={`url(#${id}-head)`}>{original}<ZanhuaP1Expression id={id} attention={performance.attention} delight={performance.delight}/></g></g>}
     {kind==='P1'&&<g mask={`url(#${id}-body)`}><g mask={`url(#${id}-lure-clear)`}><image href={zanhuaImage} x={-spec.origin+64} y="0" width="6455" height="1378"/></g></g>}
     {kind==='P4'&&<g transform={`rotate(${court!.headAngle} 350 365)`}><g mask={`url(#${id}-p4-head)`}>{original}<ZanhuaCourtExpression kind="P4" id={id} attention={court!.attention} response={court!.response}/></g></g>}
     {kind!=='P1'&&<g transform={`rotate(${angle} ${spec.pivot[0]} ${spec.pivot[1]})`}>
      {kind==='P4'?<>
       <g clipPath={`url(#${id}-upper)`}><g clipPath={`url(#${id}-silhouette)`}>{original}</g></g>
       <g transform={`translate(0 560) skewX(${sleeveLag}) translate(0 -560)`}><g clipPath={`url(#${id}-lower)`}><g clipPath={`url(#${id}-silhouette)`}>{original}</g></g></g>
      </>:<g mask={`url(#${id}-moving)`}>{original}<ZanhuaCourtExpression kind="P6" id={id} attention={court!.attention} response={court!.response}/></g>}
     </g>}
    </g>
   </defs>
   <g transform={`translate(${spec.origin} 0)`}>
    <g mask={`url(#${id}-background)`}><rect x="-20" y="0" width={spec.width+40} height="480" fill={`url(#${id}-silk)`}/>{bands.slice(16).map((_,i)=>{const n=i+16;return <g key={n} clipPath={`url(#${id}-band-${n})`}>
     <g clipPath={`url(#${id}-left-${n})`}><image href={zanhuaImage} x={-spec.origin+64} y="0" width="6455" height="1378"/></g>
     <g clipPath={`url(#${id}-right-${n})`}><image href={zanhuaImage} x={-spec.origin-64} y="0" width="6455" height="1378"/></g>
    </g>;})}</g>
    {kind==='P1'&&<g mask={`url(#${id}-lure-clear)`}><image href={zanhuaImage} x={-spec.origin+64} y="0" width="6455" height="1378"/></g>}
    {bands.map((band,n)=><g key={n} transform={band.transform}><g clipPath={`url(#${id}-band-${n})`}><use href={`#${id}-pose`}/></g></g>)}
    {kind==='P1'&&<g transform={`translate(${grip.x} ${grip.y}) rotate(${lureAngle} 506 580)`}><g clipPath={`url(#${id}-lure)`}>{original}</g></g>}
   </g>
  </svg>
  {kind==='P1'&&<ZanhuaDogAnimation viewport={viewport} time={elapsed} opacity={opacity}/>}
 </div>;
}
