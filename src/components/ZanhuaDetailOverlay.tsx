import {useEffect,useId,useState} from 'react';
import {ZanhuaCoiffureStudy} from './ZanhuaCoiffureStudy.tsx';
import {zanhuaCoiffurePoint} from '../game/zanhuaCoiffureStudy.ts';
import {zanhuaSeal} from '../game/zanhuaSeal.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import type {PaintingRegion} from '../game/lanternStudy.ts';
import type {ZanhuaAnnotation} from '../game/zanhuaAnnotations.ts';
type Rect={left:number;top:number;width:number;height:number};
export type ZanhuaConfirmation={region?:PaintingRegion;path?:string;origin?:number;label:string;token:number};
const overlap=(a:Rect,b:Rect)=>Math.max(0,Math.min(a.left+a.width,b.left+b.width)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.top+a.height,b.top+b.height)-Math.max(a.top,b.top));
/** An educational overlay: the unchanged original stays underneath every outline. */
export function ZanhuaDetailOverlay({viewport,confirmation,annotations=[],selected,onSelect,reserved=[],paper,coiffure=false,studyVisible=true,onToggleStudy}:{viewport:SceneViewport;confirmation:ZanhuaConfirmation|null;annotations?:ZanhuaAnnotation[];selected?:string;onSelect:(item:ZanhuaAnnotation)=>void;reserved?:Rect[];paper?:Rect;coiffure?:boolean;studyVisible?:boolean;onToggleStudy?:()=>void}){
 const id=useId().replace(/:/g,'');const {view,frame}=viewport;
 const [studyReady,setStudyReady]=useState(!coiffure);
 useEffect(()=>{if(!coiffure){setStudyReady(true);return;}setStudyReady(false);const timer=setTimeout(()=>setStudyReady(true),matchMedia('(prefers-reduced-motion: reduce)').matches?0:650);return()=>clearTimeout(timer);},[coiffure]);
 const point=(x:number,y:number)=>({x:view.x+x*view.scale,y:view.y+y*view.scale});
 function sealLeader(r:Rect){
  const centers=zanhuaSeal.centers.map(([x,y])=>point(x,y));
  const leftSide=r.left+r.width/2<centers[0].x;
  const edgeX=leftSide?r.left+r.width:r.left,edgeY=r.top+r.height/2;
  const jointX=centers[0].x+(leftSide?-36:36);
  return <>
   <path className="zanhua-seal-registration" d={zanhuaSeal.path} transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}/>
   <path className="zanhua-annotation-leader" d={`M${edgeX} ${edgeY} L${jointX} ${edgeY} L${jointX} ${centers[0].y} M${jointX} ${centers[0].y} L${jointX} ${centers[1].y}`}/>
   {centers.map((p,n)=><g key={n}><path className="zanhua-annotation-leader" d={`M${jointX} ${p.y} L${p.x} ${p.y}`}/><circle cx={p.x} cy={p.y} r="4" className="zanhua-seal-center"/></g>)}
  </>;
 }
 const placed:Rect[]=[];
 const labels=annotations.map(item=>{
  const p=point(...(item.id==='seal'?zanhuaSeal.labelAt:coiffure&&studyVisible?zanhuaCoiffurePoint(item.id):item.at));if(p.x<12||p.x>frame.width-12||p.y<12||p.y>frame.height-16)return null;
  const isSeal=item.id==='seal'||item.id.startsWith('collector-');
  const width=108,height=isSeal?28:32;
  const positions=[...(item.id.startsWith('collector-')?[{left:p.x-width-70*view.scale,top:p.y-height-24},{left:p.x+70*view.scale,top:p.y-height-24}]:[]),...(isSeal?[{left:p.x-width-24,top:p.y-height+4},{left:p.x-width-20,top:p.y-height-50},{left:p.x+20,top:p.y-height-50},...(paper?[{left:p.x-width-24,top:paper.top-height-16}]:[])]:[]),{left:p.x+52,top:p.y-16},{left:p.x-width-52,top:p.y-16},{left:frame.width-width-20,top:p.y-58},{left:frame.width-width-20,top:p.y+24},{left:20,top:p.y-58},{left:20,top:p.y+50},...(paper?[{left:paper.left,top:paper.top+paper.height+18+placed.length*44},{left:paper.left-width-24,top:paper.top+placed.length*44},{left:paper.left+paper.width+24,top:paper.top+placed.length*44}]:[]),{left:(frame.width-width)/2,top:frame.height-height-96}];
  const candidate=positions.map((candidate,n)=>{const r={left:Math.max(16,Math.min(frame.width-width-16,candidate.left)),top:Math.max(16,Math.min(frame.height-height-80,candidate.top)),width,height};return {...r,score:(paper?overlap(r,paper)*1000:0)+reserved.reduce((s,b)=>s+overlap(r,b)*8,0)+placed.reduce((s,b)=>s+overlap(r,b)*50,0)+Math.hypot(r.left-p.x,r.top-p.y)*.1+n};}).sort((a,b)=>a.score-b.score)[0];
  const column=paper?{left:Math.max(16,Math.min(frame.width-width-16,paper.left-40)),top:paper.top+paper.height+18+placed.length*44,width,height}:null;
  const columnClear=column&&column.top+height<frame.height-80&&!reserved.some(b=>overlap(column,b)>0)&&!placed.some(b=>overlap(column,b)>0);
  const sideColumn=paper?{left:paper.left-width-24,top:paper.top+placed.length*44,width,height}:null;
  const sideClear=sideColumn&&sideColumn.left>=16&&sideColumn.top+height<frame.height-80&&!reserved.some(b=>overlap(sideColumn,b)>0)&&!placed.some(b=>overlap(sideColumn,b)>0);
  const r=isSeal?candidate:sideClear?sideColumn!:columnClear?column!:candidate;placed.push(r);
  return {item,p,r};
 }).filter(Boolean) as {item:ZanhuaAnnotation;p:{x:number;y:number};r:Rect}[];
 return <div className="zanhua-detail-overlay" aria-label="原畫細節標注">
  {coiffure&&studyVisible&&<ZanhuaCoiffureStudy viewport={viewport} selected={selected} items={annotations} onSelect={onSelect}/>}
  <svg className="zanhua-detail-lines" width={frame.width} height={frame.height} aria-hidden="true"><defs><filter id={`detail-glow-${id}`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.2"/></filter></defs>
   {(!coiffure||studyReady)&&labels.filter(({item})=>!selected||selected===item.id).map(({item,p,r})=>{const endX=p.x<r.left?r.left:p.x>r.left+r.width?r.left+r.width:r.left+r.width/2,endY=r.top+r.height/2;const elbow=paper&&p.x>paper.left+paper.width&&endX<paper.left+paper.width?paper.left+paper.width+14:null;const crossPaper=paper&&endX<paper.left&&endY>paper.top-8&&endY<paper.top+paper.height+8;const detourY=paper?(Math.abs(p.y-paper.top)<Math.abs(p.y-paper.top-paper.height)?paper.top-14:paper.top+paper.height+14):0;const belowRoute=paper&&p.y>paper.top+paper.height&&endX<paper.left;const outerRoute=paper&&p.x>frame.width*.7&&p.y<paper.top-160&&endX<p.x;const line=item.id==='seal'||item.id.startsWith('collector-')?`M${p.x} ${p.y} Q${endX} ${p.y} ${endX} ${endY}`:belowRoute?`M${p.x} ${p.y} L${paper!.left-14} ${p.y} L${paper!.left-14} ${endY} L${endX} ${endY}`:outerRoute?`M${p.x} ${p.y} L${frame.width-18} ${p.y} L${frame.width-18} ${paper!.top-14} L${endX} ${paper!.top-14} L${endX} ${endY}`:elbow!==null?(crossPaper?`M${p.x} ${p.y} L${elbow} ${p.y} L${elbow} ${detourY} L${paper!.left-14} ${detourY} L${paper!.left-14} ${endY} L${endX} ${endY}`:`M${p.x} ${p.y} L${elbow} ${p.y} L${elbow} ${endY} L${endX} ${endY}`):`M${p.x} ${p.y} Q${endX} ${p.y} ${endX} ${endY}`;return <g key={item.id} className={selected===item.id?'is-selected':''}>{item.id==='seal'?sealLeader(r):<><path className="zanhua-annotation-leader" d={line}/><circle cx={p.x} cy={p.y} r="3" className="zanhua-annotation-dot"/></>}</g>;})}
  </svg>
  {confirmation&&<span className="sr-only" role="status">已找到：{confirmation.label}</span>}
  {(!coiffure||studyReady)&&labels.map(({item,r})=><button key={item.id} className={`zanhua-annotation-label${item.id==='seal'||item.id.startsWith('collector-')?' is-seal-label':''}`} style={{left:r.left,top:r.top,width:r.width,height:r.height}} aria-label={`細看${item.label}`} aria-pressed={selected===item.id} onClick={()=>onSelect(item)}>{item.label}<span aria-hidden="true"> ＋</span></button>)}
  {coiffure&&studyReady&&onToggleStudy&&<button className="zanhua-annotation-label zanhua-coiffure-toggle" style={{left:labels[0]?.r.left??16,top:Math.min(frame.height-120,Math.max(24,...labels.map(label=>label.r.top+label.r.height))+12),width:108,height:32}} onClick={onToggleStudy}>{studyVisible?'切回原畫':'再看摹繪'}</button>}
 </div>;
}
