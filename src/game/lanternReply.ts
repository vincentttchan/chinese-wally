import type { SceneActor } from './level.ts';
import type { Size, View } from './geometry.ts';
import { lanternSize } from './lanternFestival.ts';

type Rect = {left:number;top:number;width:number;height:number};
const overlap = (a:Rect,b:Rect) => Math.max(0,Math.min(a.left+a.width,b.left+b.width)-Math.max(a.left,b.left))
  * Math.max(0,Math.min(a.top+a.height,b.top+b.height)-Math.max(a.top,b.top));

/** Prefer nearby open space, rather than covering the speaker or their neighbours. */
export function placeLanternReply(actor:SceneActor,actors:SceneActor[],view:View,frame:Size,text:string,actionWidth=0,fontSize=16,extraHeight=0,artworkSize:Size=lanternSize,reservedRects:readonly Rect[]=[]) {
  const project=(person:SceneActor):Rect=>({
    left:view.x+(person.x-person.width/2)*artworkSize.width*view.scale,
    top:view.y+(person.y-person.height/2)*artworkSize.height*view.scale,
    width:person.width*artworkSize.width*view.scale,height:person.height*artworkSize.height*view.scale,
  });
  const subject=project(actor);
  const width=Math.min(Array.from(text).length*fontSize+26+actionWidth,frame.width-32);
  const height=Math.max(40,Math.ceil(Array.from(text).length/Math.max(1,Math.floor((width-26-actionWidth)/fontSize)))*26+16)+extraHeight;
  const center=subject.left+subject.width/2;
  const headY=subject.top+subject.height*.12;
  const candidates=[
    {left:subject.left+subject.width+12,top:headY-height/2},
    {left:subject.left-width-12,top:headY-height/2},
    {left:center-width/2,top:subject.top-height-12},
  ];
  // A reading note may occupy the space above a nearby figure. The existing
  // chapter has no reserved rectangles and keeps its original three choices.
  if(reservedRects.length)candidates.push({left:center-width/2,top:subject.top+subject.height+12});
  const people=actors.map(project).filter(rect=>rect.left+rect.width>0&&rect.left<frame.width&&rect.top+rect.height>0&&rect.top<frame.height);
  const hud:Rect[]=[{left:0,top:0,width:355,height:145},{left:frame.width-310,top:0,width:310,height:90}];
  const placement=candidates.map((point,index)=>{
    const rect={left:Math.max(16,Math.min(frame.width-width-16,point.left)),
      top:Math.max(fontSize===18?58:16,Math.min(frame.height-height-(fontSize===18?140:80),point.top)),width,height};
    const score=overlap(rect,subject)*5+people.reduce((sum,person)=>sum+overlap(rect,person),0)
      +hud.reduce((sum,area)=>sum+overlap(rect,area)*3,0)
      +reservedRects.reduce((sum,area)=>sum+overlap(rect,area)*20,0)+index*80;
    return {...rect,score};
  }).sort((a,b)=>a.score-b.score)[0];
  // Keep the small tail aligned with the speaker even after viewport clamping.
  const tailSide=center<placement.left?'left':center>placement.left+width?'right':headY>placement.top+height?'bottom':'top';
  return {...placement,tailSide,
    tailX:Math.max(12,Math.min(width-12,center-placement.left)),
    tailY:Math.max(10,Math.min(height-10,headY-placement.top))};
}
