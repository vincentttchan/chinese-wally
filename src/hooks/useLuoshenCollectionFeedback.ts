import {useEffect,useRef,useState} from 'react';
import type {RefObject} from 'react';
import type {SceneViewport} from '../components/ScrollScene.tsx';
import {luoshenSize} from '../game/luoshen.ts';
import type {Size} from '../game/geometry.ts';
type Discovery={category:string;name:string;x:number;y:number;token:number};
export type CollectionFlight={category:string;x:number;y:number;dx:number;dy:number;token:number};
/** Save discoveries immediately in the game; present each receipt in discovery order. */
export function useLuoshenCollectionFeedback(initialCount:number,viewport:SceneViewport,book:RefObject<HTMLButtonElement|null>,onNotice:(text:string)=>void,artworkSize:Size=luoshenSize){
 const [pending,setPending]=useState<Discovery[]>([]),[flight,setFlight]=useState<CollectionFlight|null>(null);
 const [count,setCount]=useState(initialCount),[receiving,setReceiving]=useState(false);
 const sequence=useRef(0),received=useRef(initialCount),queue=useRef<Discovery[]>([]),receiptNames=useRef<string[]>([]);
 const latest=useRef({viewport,onNotice,artworkSize});latest.current={viewport,onNotice,artworkSize};
 function enqueue(category:string,name:string,x:number,y:number){
  if(!queue.current.length)receiptNames.current=[];
  const item={category,name,x,y,token:++sequence.current};
  queue.current=[...queue.current,item];setPending(queue.current);
 }
 function settle(){
  const items=queue.current;if(!items.length)return;
  received.current+=items.length;queue.current=[];setPending([]);setFlight(null);setCount(received.current);setReceiving(true);
  receiptNames.current.push(...items.map(a=>a.name));latest.current.onNotice(`已收藏：${receiptNames.current.join('、')}`);
 }
 const token=pending[0]?.token;
 useEffect(()=>{
  const item=queue.current[0];if(!item)return;
  const {viewport:v,artworkSize:size}=latest.current,destination=book.current?.getBoundingClientRect();
  const x=v.view.x+item.x*size.width*v.view.scale,y=v.view.y+item.y*size.height*v.view.scale;
  const animate=Boolean(destination)&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&x>=0&&x<=v.frame.width&&y>=0&&y<=v.frame.height;
  if(animate&&destination)setFlight({category:item.category,x,y,dx:destination.left+destination.width/2-x,dy:destination.top+destination.height/2-y,token:item.token});
  const timer=setTimeout(()=>{
   if(queue.current[0]?.token!==item.token)return;
   received.current++;queue.current=queue.current.slice(1);setCount(received.current);setReceiving(true);setFlight(null);
   receiptNames.current.push(item.name);latest.current.onNotice(`已收藏：${receiptNames.current.join('、')}`);setPending(queue.current);
  },animate?1500:0);
  return()=>clearTimeout(timer);
 },[token,book]);
 useEffect(()=>{if(!receiving)return;const timer=setTimeout(()=>setReceiving(false),650);return()=>clearTimeout(timer);},[receiving,count]);
 // Resizing changes the book's destination; acknowledge saved items instead of flying to stale coordinates.
 const settleRef=useRef(settle);settleRef.current=settle;
 useEffect(()=>{const resized=()=>settleRef.current();window.addEventListener('resize',resized);return()=>window.removeEventListener('resize',resized);},[]);
 return {enqueue,settle,flight,count,receiving,pendingCount:pending.length};
}
