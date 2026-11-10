import {zanhuaP4GauzeBounds,zanhuaP4ScarfBounds} from './zanhuaP4OuterwearContours.ts';
import {zanhuaP4SkirtBounds} from './zanhuaP4SkirtContour.ts';
import {zanhuaDressStudies} from './zanhuaDressStudies.ts';
import {zanhuaAnnotations} from './zanhuaAnnotations.ts';
import {zanhuaP6CoiffureContours} from './zanhuaP6CoiffureContours.ts';
import {coverView} from './geometry.ts';
import type {Size} from './geometry.ts';
import {zanhuaSize} from './zanhuaPreview.ts';
import type {SceneViewport} from '../components/ScrollScene.tsx';

export const zanhuaStudyRegistration=[{origin:5150,width:820},{origin:2790,width:770},{origin:900,width:800}];
// Align the redrawn faces and hems to their positions in the full scroll.
const studyAlignment=[
 {x:42,y:30,scale:.92},
 {x:0,y:10,scale:1},
 {x:-20,y:4,scale:1},
];
export type StudyPart={id:string;label:string;body:string;source:number;path:string;hitPath?:string;focusMask?:string;layer?:string;bounds:[number,number,number,number];prompt:string};
const bounds:Record<string,[number,number,number,number]>={
 'dark-gauze':[270,390,698,1105],'red-skirt':[10,511,828,1050],'floral-scarf':[515,440,350,305],
 'long-skirt':zanhuaP4SkirtBounds,gauze:zanhuaP4GauzeBounds,scarf:zanhuaP4ScarfBounds,
 'high-hair':[295,110,325,275],'hair-flower':[440,2,240,200],'hair-ornament':[345,20,250,260],
};
const prompts:Record<string,string>={
 'dark-gauze':'從腳邊那抹紅往上看，哪一層深色衣料從手腕垂下，攤開得比手臂還寬？',
 'red-skirt':'看看她腳邊，深色衣料底下露出了哪一抹顏色？點點拖在地上的那一片。',
 'floral-scarf':'沿着長柄找到她的手。哪一段紅底花紋從肩頭繞到了手臂下方？',
 'long-skirt':'順着垂到地面的紅色往上找，哪一道紅邊在胸前收住？',
 gauze:'順着她拈花的手往回看，哪一層衣料底下還看得見手臂的輪廓？',
 scarf:'沿着手臂外側往下看，哪一道花紋一路垂到身前？',
 'high-hair':'她頭上的輪廓，為甚麼高高隆起？','hair-flower':'沿着頭頂往上看，哪一抹顏色從黑髮中露出來？','hair-ornament':'她偏過頭時，花旁還有甚麼在發亮？',
};
export type ZanhuaStudyScope='all'|'dress'|'scarf';
export function zanhuaStudyParts(person:number,scope:ZanhuaStudyScope='all'):StudyPart[]{
 const parts=person<2?zanhuaDressStudies[person].parts:zanhuaAnnotations[2][0].map(part=>({...part,...zanhuaP6CoiffureContours[part.id]}));
 const ordered=person===0?[parts.find(p=>p.id==='red-skirt')!,...parts.filter(p=>p.id!=='red-skirt')]:parts;
 const scarfId=person===0?'floral-scarf':'scarf';
 return ordered.filter(p=>person>1||scope==='all'||(scope==='scarf'?p.id===scarfId:p.id!==scarfId)).map(p=>({...p,bounds:bounds[p.id],...(person===2?zanhuaP6CoiffureContours[p.id]:{}),prompt:prompts[p.id]}));
}
export function zanhuaStudySource(person:number){return person<2?{image:zanhuaDressStudies[person].image,width:zanhuaDressStudies[person].width,height:zanhuaDressStudies[person].height}:{image:'art/zanhua/studies/P6-full-study-v1.png',width:956,height:1646};}

const compactPaperTop=(frame:Size)=>Math.round(frame.height*.54);

/** Keep the first figure's shoulder and hem above the reading paper on narrow screens. */
export function zanhuaCompactDressShot(frame:Size){
 if(frame.width>=600||frame.width<=32||compactPaperTop(frame)<=28)return null;
 const source=zanhuaStudySource(0),{origin}=zanhuaStudyRegistration[0],aligned=studyAlignment[0];
 const figureHeight=zanhuaSize.height*aligned.scale;
 const figureWidth=source.width*figureHeight/source.height;
 const paperTop=compactPaperTop(frame);
 const scale=Math.min((frame.width-32)/figureWidth,(paperTop-28)/figureHeight);
 return {
  region:{x:(origin+aligned.x+figureWidth/2)/zanhuaSize.width,y:(aligned.y+figureHeight/2)/zanhuaSize.height},
  screenAnchor:{x:.5,y:paperTop/(2*frame.height)},
  scaleRatio:scale/coverView(frame,zanhuaSize).scale,
  allowHorizontalMargin:true,allowVerticalMargin:true,
 };
}

/** Study pixels stay registered to the painting as the camera moves. */
export function zanhuaStudyLayout(person:number,current:SceneViewport,_anchor=current){
 const {frame,view}=current,compact=frame.width<600;
 const paperWidth=compact?frame.width-32:Math.min(310,Math.max(245,frame.width*.32));
 const source=zanhuaStudySource(person),native=zanhuaStudyRegistration[person];
 const aligned=studyAlignment[person];
 const pose={x:view.x+(native.origin+aligned.x)*view.scale,y:view.y+aligned.y*view.scale,scale:view.scale*1378/source.height*aligned.scale};
 const leftRoom=pose.x+35*pose.scale;
 const rightRoom=frame.width-(pose.x+source.width*pose.scale);
 const paperOnLeft=!compact&&rightRoom<paperWidth+32&&leftRoom>=paperWidth+32;
 const paper={left:compact?16:paperOnLeft?24:frame.width-paperWidth-24,top:compact?compactPaperTop(frame):Math.max(32,Math.min(100,frame.height*.12)),width:paperWidth,height:compact?frame.height*.46-16:frame.height-Math.max(32,Math.min(100,frame.height*.12))-24};
 const art={left:paper.left+20,top:paper.top+42,width:paper.width-40,height:compact?(person===0?52:95):Math.min(160,Math.max(110,paper.height*.28))};
 return {pose,paper,art,compact};
}

export function resolveZanhuaStudyHit(person:number,p:{x:number;y:number},viewport?:SceneViewport,anchor?:SceneViewport,scope:ZanhuaStudyScope='all'):string|null{
 const source=zanhuaStudySource(person),r=zanhuaStudyRegistration[person];
 const pose=viewport?zanhuaStudyLayout(person,viewport,anchor).pose:null;
 const aligned=studyAlignment[person],nativeScale=1378/source.height*aligned.scale;
 const x=pose&&viewport?(viewport.view.x+p.x*viewport.view.scale-pose.x)/pose.scale:(p.x-r.origin-aligned.x)/nativeScale;
 const y=pose&&viewport?(viewport.view.y+p.y*viewport.view.scale-pose.y)/pose.scale:(p.y-aligned.y)/nativeScale;
 const ctx=document.createElement('canvas').getContext('2d');if(!ctx)return null;
 const all=zanhuaStudyParts(person,scope);
 const parts=person===2?[all.find(p=>p.id==='hair-ornament')!,...all.filter(p=>p.id!=='hair-ornament')]:all;
 const scarf=parts.find(p=>p.id==='floral-scarf'||p.id==='scarf');
 if(scarf&&ctx.isPointInPath(new Path2D(scarf.path),x,y))return scarf.id;
 return [...parts.filter(p=>p.hitPath),...parts].find(part=>ctx.isPointInPath(new Path2D(part.hitPath??part.path),x,y))?.id??null;
}
