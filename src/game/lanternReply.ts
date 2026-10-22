import type { SceneActor } from './level.ts';
import type { Size, View } from './geometry.ts';
import { lanternSize } from './lanternFestival.ts';

type Rect = {left:number;top:number;width:number;height:number};
export type SpeechGeometry={maxWidth?:number;anchor:{x:number;y:number};faces:readonly {x:number;y:number}[];heads?:readonly {x:number;y:number;width:number;height:number}[];measured?:Size;reservedRects?:readonly Rect[];openSpaceCandidates?:boolean};
const overlap = (a:Rect,b:Rect) => Math.max(0,Math.min(a.left+a.width,b.left+b.width)-Math.max(a.left,b.left))
  * Math.max(0,Math.min(a.top+a.height,b.top+b.height)-Math.max(a.top,b.top));

/** Prefer nearby open space, rather than covering the speaker or their neighbours. */
export function placeLanternReply(actor:SceneActor,actors:SceneActor[],view:View,frame:Size,text:string,actionWidth=0,fontSize=16,extraHeight=0,artworkSize:Size=lanternSize,reservedRects:readonly Rect[]=[],speech?:SpeechGeometry) {
  // Chapters with measured portrait anchors must not infer a face from a body box.
  if(speech){
    const x=view.x+speech.anchor.x*artworkSize.width*view.scale,y=view.y+speech.anchor.y*artworkSize.height*view.scale;
    const width=Math.min(speech.maxWidth??410,frame.width-32,Math.max(230,Array.from(text).length*18+32));
    const height=speech.measured?.height??(Math.ceil(Array.from(text).length/Math.floor((width-32)/18))*26+24+extraHeight);
    const faces=speech.heads?speech.heads.map(p=>({left:view.x+p.x*artworkSize.width*view.scale,top:view.y+p.y*artworkSize.height*view.scale,width:p.width*artworkSize.width*view.scale,height:p.height*artworkSize.height*view.scale})):speech.faces.map(p=>({left:view.x+p.x*artworkSize.width*view.scale-68*view.scale,top:view.y+p.y*artworkSize.height*view.scale-125*view.scale,width:136*view.scale,height:155*view.scale}));
    const face=faces[speech.faces.indexOf(speech.anchor)]??{left:x-60,top:y-110,width:120,height:145};
    const candidates=[{left:face.left+face.width+24,top:y-30},{left:face.left-width-24,top:y-30},{left:x-width/2,top:face.top+face.height+28},{left:x-width/2,top:face.top-height-24}];
    const body=speech.reservedRects?.find(r=>x>=r.left&&x<=r.left+r.width&&y>=r.top&&y<=r.top+r.height);
    if(body)candidates.push({left:body.left-width-24,top:y-30},{left:body.left+body.width+24,top:y-30});
    // Opt-in for a long scroll: nearby candidates may all overlap a skirt or fan.
    if(speech.openSpaceCandidates)for(const left of [16,(frame.width-width)/2,frame.width-width-16])for(const top of [24,frame.height-height-86])candidates.push({left,top});
    const rect=candidates.map((p,i)=>{
      const r={left:Math.max(16,Math.min(frame.width-width-16,p.left)),top:Math.max(24,Math.min(frame.height-height-86,p.top)),width,height};
      const distance=Math.hypot(Math.max(r.left-x,0,x-r.left-width),Math.max(r.top-y,0,y-r.top-height));
      return {...r,score:faces.reduce((sum,f)=>sum+overlap(r,f)*30,0)+[...reservedRects,...(speech.reservedRects??[])].reduce((sum,f)=>sum+overlap(r,f)*20,0)+distance*4+i*10};
    }).sort((a,b)=>a.score-b.score)[0];
    const tailSide=x<rect.left?'left':x>rect.left+width?'right':y>rect.top+height?'bottom':'top';
    return {...rect,tailSide,tailX:Math.max(14,Math.min(width-14,x-rect.left)),tailY:Math.max(14,Math.min(height-14,y-rect.top))};
  }
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
