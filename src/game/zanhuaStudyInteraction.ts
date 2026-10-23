import {zanhuaP4GauzeBounds,zanhuaP4ScarfBounds} from './zanhuaP4OuterwearContours.ts';
import {zanhuaP4SkirtBounds} from './zanhuaP4SkirtContour.ts';
import {zanhuaDressStudies} from './zanhuaDressStudies.ts';
import {zanhuaAnnotations} from './zanhuaAnnotations.ts';
import {zanhuaP6CoiffureContours} from './zanhuaP6CoiffureContours.ts';
import type {SceneViewport} from '../components/ScrollScene.tsx';

export const zanhuaStudyRegistration=[{origin:5150,width:820},{origin:2790,width:770},{origin:900,width:800}];
export type StudyPart={id:string;label:string;body:string;source:number;path:string;hitPath?:string;focusMask?:string;layer?:string;bounds:[number,number,number,number];prompt:string};
const bounds:Record<string,[number,number,number,number]>={
 'dark-gauze':[270,630,690,905],'red-skirt':[12,510,816,1068],'floral-scarf':[510,445,350,310],
 'long-skirt':zanhuaP4SkirtBounds,gauze:zanhuaP4GauzeBounds,scarf:zanhuaP4ScarfBounds,
 'high-hair':[295,110,325,275],'hair-flower':[440,2,240,200],'hair-ornament':[345,20,250,260],
};
const prompts:Record<string,string>={
 'dark-gauze':'點寬大的深色衣袖，看看外衣如何罩在紅裙外。','red-skirt':'點腳邊露出的紅裙，沿着裙色找出內外層。','floral-scarf':'點肩臂間的花紋長帶，分清披帛與衣袖。',
 'long-skirt':'先點胸前的紅色裙腰，看看它如何連到腳邊。',gauze:'再點寬袖紗衣，分清薄衣與手臂的線條。',scarf:'再點臂旁的花紋長帶，看看它是不是衣袖。',
 'high-hair':'先點盤起的高髻，看看頭部盛裝的底層。','hair-flower':'再點髻上的大花，看看花飾的位置。','hair-ornament':'再點髻邊的細小金飾，看看盛裝的點綴。',
};
export type ZanhuaStudyScope='all'|'dress'|'scarf';
export function zanhuaStudyParts(person:number,scope:ZanhuaStudyScope='all'):StudyPart[]{
 const parts=person<2?zanhuaDressStudies[person].parts:zanhuaAnnotations[2][0].map(part=>({...part,...zanhuaP6CoiffureContours[part.id]}));
 const ordered=person===0?[parts.find(p=>p.id==='red-skirt')!,...parts.filter(p=>p.id!=='red-skirt')]:parts;
 return ordered.filter(p=>person!==1||scope==='all'||(scope==='scarf'?p.id==='scarf':p.id!=='scarf')).map(p=>({...p,bounds:bounds[p.id],...(person===2?zanhuaP6CoiffureContours[p.id]:{}),prompt:person===1&&scope==='scarf'?'點臂旁的花紋長帶，看看它是不是衣袖。':prompts[p.id]}));
}
export function zanhuaStudySource(person:number){return person<2?{image:zanhuaDressStudies[person].image,width:zanhuaDressStudies[person].width,height:zanhuaDressStudies[person].height}:{image:'art/zanhua/studies/P6-full-study-v1.png',width:956,height:1646};}

/** Study pixels map directly into the original context crop; the painting camera is never refitted. */
export function zanhuaStudyLayout(person:number,current:SceneViewport,_anchor=current){
 const {frame,view}=current,compact=frame.width<600;
 const paperWidth=compact?frame.width-32:Math.min(310,Math.max(245,frame.width*.32));
 const source=zanhuaStudySource(person),native=zanhuaStudyRegistration[person];
 const pose={x:view.x+native.origin*view.scale,y:view.y,scale:view.scale*1378/source.height};
 const leftRoom=pose.x+35*pose.scale;
 const rightRoom=frame.width-(pose.x+source.width*pose.scale);
 const paperOnLeft=!compact&&rightRoom<paperWidth+32&&leftRoom>=paperWidth+32;
 const paper={left:compact?16:paperOnLeft?24:frame.width-paperWidth-24,top:compact?Math.round(frame.height*.54):Math.max(32,Math.min(100,frame.height*.12)),width:paperWidth,height:compact?frame.height*.46-16:frame.height-Math.max(32,Math.min(100,frame.height*.12))-24};
 const art={left:paper.left+20,top:paper.top+42,width:paper.width-40,height:compact?95:Math.min(160,Math.max(110,paper.height*.28))};
 return {pose,paper,art,compact};
}

export function resolveZanhuaStudyHit(person:number,p:{x:number;y:number},viewport?:SceneViewport,anchor?:SceneViewport,scope:ZanhuaStudyScope='all'):string|null{
 const source=zanhuaStudySource(person),r=zanhuaStudyRegistration[person];
 const pose=viewport?zanhuaStudyLayout(person,viewport,anchor).pose:null;
 const x=pose&&viewport?(viewport.view.x+p.x*viewport.view.scale-pose.x)/pose.scale:(p.x-r.origin)/r.width*source.width;
 const y=pose&&viewport?(viewport.view.y+p.y*viewport.view.scale-pose.y)/pose.scale:p.y/1378*source.height;
 const ctx=document.createElement('canvas').getContext('2d');if(!ctx)return null;
 const all=zanhuaStudyParts(person,scope);
 const parts=person===2?[all.find(p=>p.id==='hair-ornament')!,...all.filter(p=>p.id!=='hair-ornament')]:all;
 return [...parts.filter(p=>p.hitPath),...parts].find(part=>ctx.isPointInPath(new Path2D(part.hitPath??part.path),x,y))?.id??null;
}
