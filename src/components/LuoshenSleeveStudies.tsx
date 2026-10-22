import {useCallback,useEffect,useRef,useState} from 'react';
import {assetPath} from '../game/assets.ts';
import {LuoshenElementArt} from './LuoshenElementArt.tsx';
import {drawSleeveStudy,sleeveComparisonDelay,sleeveDuration,type SleeveKind} from '../game/luoshenSleeveMotion.ts';
function SleeveStudy({kind,lit,delay=0,startAt,onReady,onDone,animate}:{kind:SleeveKind;lit:boolean;delay?:number;startAt:number|null;onReady:(kind:SleeveKind)=>void;onDone:(kind:SleeveKind)=>void;animate:boolean}){
 const [failed,setFailed]=useState(false),[ready,setReady]=useState(false),canvas=useRef<HTMLCanvasElement>(null),image=useRef<HTMLImageElement|null>(null),label=kind==='cao'?'曹植 · 展袖':'同行者 · 收袖',src=assetPath(`art/luoshen/elements/sleeves-${kind}-v2.png`);
 const fail=useCallback(()=>{setFailed(true);setReady(false);onReady(kind);onDone(kind);},[kind,onReady,onDone]);
 useEffect(()=>{if(!animate){setReady(false);onReady(kind);onDone(kind);return;}let live=true;const ink=new Image(),timer=window.setTimeout(()=>{if(live)fail();},10000);ink.onerror=()=>{clearTimeout(timer);if(live)fail();};ink.onload=()=>{clearTimeout(timer);if(!live)return;image.current=ink;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onReady(kind);onDone(kind);return;}const ctx=canvas.current?.getContext('2d');if(!ctx){fail();return;}try{ctx.save();ctx.scale(.5,.5);drawSleeveStudy(ctx,ink,kind,0);ctx.restore();setReady(true);onReady(kind);}catch{fail();}};ink.src=src;
 return()=>{live=false;clearTimeout(timer);ink.onload=null;ink.onerror=null;image.current=null;};
 },[src,kind,fail,onReady,onDone,animate]);
 useEffect(()=>{if(!animate||!ready||failed||startAt===null)return;let raf=0,last=-Infinity;const ctx=canvas.current?.getContext('2d'),ink=image.current;if(!ctx||!ink)return;
 const tick=(now:number)=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setReady(false);onDone(kind);return;}const age=Math.max(0,Math.min(sleeveDuration,now-startAt-delay));try{if(now-last>=1000/30||age===sleeveDuration){ctx.save();ctx.scale(.5,.5);drawSleeveStudy(ctx,ink,kind,age);ctx.restore();last=now;}}catch{fail();return;}if(age<sleeveDuration)raf=requestAnimationFrame(tick);else onDone(kind);};raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
 },[ready,failed,startAt,delay,kind,fail,onDone,animate]);
 return <figure><div className={`luoshen-sleeve-art ${lit?'is-lit':''}`} data-sleeve={kind}>{failed?<span role="status">小像暫未載入<br/>仍可繼續看原畫</span>:<><span aria-hidden={ready||undefined} style={{visibility:ready?'hidden':undefined}}><LuoshenElementArt src={src} onError={fail} label={`${label}摹繪小像`} /></span><canvas ref={canvas} width={512} height={768} style={{display:ready?'block':'none'}} role="img" aria-label={`${label}分層動作，頭部與軀幹固定`}/></>}</div><figcaption>{label}</figcaption></figure>;
}
export function LuoshenSleeveStudies({comparison=false,onSettled,animate=true}:{comparison?:boolean;onSettled?:()=>void;animate?:boolean}){
 const [finished,setFinished]=useState<SleeveKind[]>([]),done=useRef(onSettled);done.current=onSettled;
 const onDone=useCallback((kind:SleeveKind)=>setFinished(old=>old.includes(kind)?old:[...old,kind]),[]);
 useEffect(()=>{if(finished.length===(comparison?2:1))done.current?.();},[finished,comparison]);
 const [loaded,setLoaded]=useState<SleeveKind[]>([]),[startAt,setStartAt]=useState<number|null>(null),onReady=useCallback((kind:SleeveKind)=>setLoaded(old=>old.includes(kind)?old:[...old,kind]),[]);
 useEffect(()=>{if(startAt===null&&loaded.length===(comparison?2:1))setStartAt(performance.now());},[loaded,comparison,startAt]);
 return <div className="luoshen-sleeve-studies" aria-label="衣袖姿態摹繪對照"><SleeveStudy kind="cao" lit={!comparison} startAt={startAt} onReady={onReady} onDone={onDone} animate={animate}/>{comparison&&<SleeveStudy kind="companion" lit delay={sleeveComparisonDelay} startAt={startAt} onReady={onReady} onDone={onDone} animate={animate}/>}</div>;
}
