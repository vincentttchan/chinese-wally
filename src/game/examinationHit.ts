import {objects,people,tileIds} from './examinationStreetLife.ts';
import type {LocalShape} from './examinationStreetLife.ts';
import type {SceneHitResolver} from '../components/ScrollScene.tsx';
function contains(s:LocalShape,x:number,y:number):boolean {
 if(s.kind==='circle') return Math.hypot(x-s.x,y-s.y)<=s.r;
 let inside=false;
 for(let i=0,j=s.points.length-1;i<s.points.length;j=i++) {
  const a=s.points[i],b=s.points[j];
  if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x) inside=!inside;
 }
 return inside;
}
export const examinationHit:SceneHitResolver=(world,_scale,size,actors)=>{
 if(world.x<0||world.x>size.width||world.y<0||world.y>size.height)return null;
 const column=Math.min(2,Math.floor(world.x/size.width*3));
 const tile=tileIds[column],x=(world.x/size.width*3-column)*1254,y=world.y/size.height*1254;
 for(const o of objects.filter(o=>o.tile===tile))for(let i=0;i<o.parts.length;i++) {
  if(contains({kind:'circle',...o.parts[i]},x,y))return actors.find(a=>a.id===o.id+':'+i)??null;
 }
 // Dense crowds overlap: an earlier person's robe must not take a later
 // person's face. Resolve a clear head first, then the nearest visible body.
 const local=people.filter(p=>p.tile===tile);
 const head=local.filter(p=>Math.abs(x-p.x)<=16&&Math.abs(y-p.y)<=22&&contains(p.shape,x,y))
  .sort((a,b)=>Math.hypot(x-a.x,y-a.y)-Math.hypot(x-b.x,y-b.y))[0];
 const p=head??local.filter(p=>contains(p.shape,x,y))
  .sort((a,b)=>Math.hypot(x-a.x,y-a.y)-Math.hypot(x-b.x,y-b.y))[0];
 return p?actors.find(a=>a.id===p.id)??null:null;
};
