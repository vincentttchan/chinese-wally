import {gradeFigurePart} from './luoshenFigureParts.ts';
export const dragonDuration=5400;
export const dragonPatch={left:1045,top:165,width:340,height:280,resolution:2};
export const dragonAtlas={
 body:{source:'atlas',x:120,y:50,width:850,height:830,seed:{x:380,y:470}},
 neckLower:{source:'atlas',x:120,y:275,width:420,height:205,seed:{x:100,y:100}},
 neckUpper:{source:'atlas',x:200,y:45,width:320,height:290,seed:{x:220,y:165}},
 head:{source:'atlas',x:870,y:40,width:480,height:400,seed:{x:180,y:170}},
 foreleg:{source:'atlas',x:50,y:800,width:340,height:310,seed:{x:160,y:190}},
 tail:{source:'atlas',x:690,y:850,width:660,height:275,seed:{x:310,y:200}},
 hindleg:{source:'hindleg',x:200,y:80,width:800,height:1030,seed:{x:500,y:420}},
} as const;
export type DragonPart=keyof typeof dragonAtlas;
export type DragonJoint=DragonPart;
export const dragonRoot={x:1250,y:332};
type Rig={parent:DragonPart|null;socket:{x:number;y:number};pivot:{x:number;y:number};sx:number;sy:number;rest:number};
/** Child sockets use the parent's image coordinates; rotations never stretch a skull or claw. */
export const dragonRig:Record<DragonPart,Rig>={
 body:{parent:null,socket:dragonRoot,pivot:{x:635,y:620},sx:.19,sy:.20,rest:0},
 neckLower:{parent:'body',socket:{x:80,y:390},pivot:{x:80,y:165},sx:.17,sy:.18,rest:0},
 neckUpper:{parent:'neckLower',socket:{x:230,y:30},pivot:{x:150,y:260},sx:.17,sy:.16,rest:0},
 head:{parent:'neckUpper',socket:{x:55,y:60},pivot:{x:265,y:345},sx:.15,sy:.15,rest:0},
 foreleg:{parent:'body',socket:{x:50,y:400},pivot:{x:290,y:170},sx:.26,sy:.26,rest:0},
 tail:{parent:'body',socket:{x:810,y:765},pivot:{x:60,y:140},sx:.13,sy:.13,rest:18},
 hindleg:{parent:'body',socket:{x:724.4736842105264,y:715},pivot:{x:70,y:60},sx:.06,sy:.065,rest:0},
};
const rad=Math.PI/180,ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export const dragonOpacity=(time:number)=>ease(time/260)*ease((dragonDuration-time)/300);
export function dragonPose(time:number){
 if(time<=0||time>=dragonDuration)return {body:0,neckLower:0,neckUpper:0,head:0,foreleg:0,tail:0,hindleg:0,tip:0};
 const e=Math.sin(Math.PI*time/dragonDuration)**2,t=time/1000,w=t*1.8;
 return {body:1*e*Math.sin(w-.35),neckLower:2.5*e*Math.sin(w-.1),neckUpper:3.5*e*Math.sin(w+.15),head:2.3*e*Math.sin(w+.4),foreleg:6*e*Math.sin(w-.45),tail:6.8*e*Math.sin(w-1),hindleg:2*e*Math.sin(w-.6),tip:.025*e*Math.sin(w-1.4)};
}
type PartTransform={x:number;y:number;angle:number};
export function dragonTransforms(time:number){
 const pose=dragonPose(time),result={} as Record<DragonPart,PartTransform>;
 for(const key of Object.keys(dragonRig) as DragonPart[]){
  const r=dragonRig[key];
  if(!r.parent){result[key]={x:dragonRoot.x,y:dragonRoot.y,angle:(r.rest+pose[key])*rad};continue;}
  const parent=result[r.parent],pr=dragonRig[r.parent],dx=(r.socket.x-pr.pivot.x)*pr.sx,dy=(r.socket.y-pr.pivot.y)*pr.sy;
  result[key]={x:parent.x+dx*Math.cos(parent.angle)-dy*Math.sin(parent.angle),y:parent.y+dx*Math.sin(parent.angle)+dy*Math.cos(parent.angle),angle:parent.angle+(r.rest+pose[key])*rad};
 }
 return result;
}
export function dragonPoint(key:DragonJoint,x:number,y:number,time:number){
 const r=dragonRig[key],p=dragonPose(time),t=dragonTransforms(time)[key];
 const dx=(x-r.pivot.x)*r.sx,dy=(y-r.pivot.y)*r.sy+(key==='tail'?dx*p.tip:0);
 return {x:t.x+dx*Math.cos(t.angle)-dy*Math.sin(t.angle),y:t.y+dx*Math.sin(t.angle)+dy*Math.cos(t.angle)};
}
/** Transparent overlaps are trimmed into genuine upper/lower neck layers, not a pixel warp. */
export function trimDragonPart(data:Uint8ClampedArray,w:number,h:number,key:DragonPart){
 const crop=dragonAtlas[key];
 if(key!=='body'&&key!=='neckLower'&&key!=='neckUpper')return;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const gx=x+crop.x,gy=y+crop.y;
  const alpha=key==='body'?(gx<510?ease((gy-420)/14):1):key==='neckLower'?ease((gy-285)/12)*(1-ease((gy-447)/12)):(1-ease((gy-309)/12));
  data[(y*w+x)*4+3]*=alpha;
 }
}
/** Rectangles may contain a neighboring atlas fragment. Keep the actual connected cutout. */
export function isolateDragonPart(data:Uint8ClampedArray,w:number,h:number,seed:{x:number;y:number}){
 let start=-1,best=Infinity;
 for(let y=Math.max(0,seed.y-30);y<Math.min(h,seed.y+31);y++)for(let x=Math.max(0,seed.x-30);x<Math.min(w,seed.x+31);x++){
  const d=(x-seed.x)**2+(y-seed.y)**2;if(data[(y*w+x)*4+3]>8&&d<best){best=d;start=y*w+x;}
 }
 if(start<0)throw new Error('Missing dragon sprite part');
 const visited=new Uint8Array(w*h),queue=new Int32Array(w*h);let read=0,end=1;queue[0]=start;visited[start]=1;
 while(read<end){const n=queue[read++],x=n%w,y=Math.floor(n/w);for(let yy=Math.max(0,y-1);yy<=Math.min(h-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(w-1,x+1);xx++){const next=yy*w+xx;if(!visited[next]&&data[next*4+3]>0){visited[next]=1;queue[end++]=next;}}}
 for(let n=0;n<w*h;n++)if(!visited[n])data[n*4+3]=0;
 gradeFigurePart(data,w,h,'head');
}
export function drawDragon(ctx:CanvasRenderingContext2D,parts:Record<DragonPart,CanvasImageSource>,time:number){
 const p=dragonPatch,pose=dragonPose(time),transforms=dragonTransforms(time);ctx.clearRect(0,0,p.width*p.resolution,p.height*p.resolution);
 ctx.save();ctx.scale(p.resolution,p.resolution);ctx.translate(-p.left,-p.top);
 for(const key of ['tail','hindleg','head','neckUpper','neckLower','foreleg','body'] as DragonJoint[]){
  const r=dragonRig[key],t=transforms[key];ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.angle);
  if(key==='tail')ctx.transform(1,pose.tip,0,1,0,0);
  ctx.scale(r.sx,r.sy);ctx.translate(-r.pivot.x,-r.pivot.y);ctx.drawImage(parts[key],0,0);ctx.restore();
 }
 ctx.restore();
}
const paths=[
 {r:12,p:[[1138,198],[1160,209],[1180,230],[1185,244],[1164,252],[1135,244],[1121,258],[1136,280]]},
 {r:17,p:[[1135,280],[1185,298],[1222,318],[1247,336],[1264,350]]},
 {r:6,p:[[1160,198],[1189,209],[1211,216]]},
 {r:6,p:[[1130,274],[1101,296],[1080,276],[1075,250]]},
 {r:6,p:[[1195,279],[1220,270],[1243,287],[1245,306]]},
 {r:7,p:[[1220,329],[1205,347],[1168,351],[1165,336]]},
 {r:6,p:[[1260,347],[1282,379],[1274,406],[1280,415]]},
 {r:5,p:[[1260,348],[1280,368],[1305,384],[1331,387],[1353,372]]},
];
const shapes=[[1144,197,24,18],[1075,246,14,15],[1245,306,13,14],[1230,327,30,21],[1165,337,13,12],[1280,414,15,12],[1350,373,7,15],[1300,350,17,18]];
const oldSilhouettes=[
 [[1124,174],[1197,176],[1223,212],[1211,245],[1252,267],[1273,302],[1256,322],[1225,301],[1190,306],[1142,296],[1110,275],[1110,243],[1127,220]],
 [[1142,270],[1248,298],[1294,348],[1310,371],[1358,349],[1360,380],[1340,401],[1306,405],[1297,430],[1270,429],[1269,397],[1235,367],[1207,359],[1143,358],[1134,335],[1171,319]],
 [[1060,235],[1094,235],[1103,282],[1131,268],[1146,290],[1102,310],[1070,282],[1059,249]],
];
function dragonMask(x:number,y:number){
 let coverage=0;
 for(const polygon of oldSilhouettes){
  let inside=false,nearest=Infinity;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
   const [ax,ay]=polygon[j],[bx,by]=polygon[i];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
   const t=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2)));nearest=Math.min(nearest,Math.hypot(x-ax-t*(bx-ax),y-ay-t*(by-ay)));
  }coverage=Math.max(coverage,inside?1:1-ease(nearest/3));
 }
 for(const [cx,cy,rx,ry] of shapes)coverage=Math.max(coverage,1-ease((Math.hypot((x-cx)/rx,(y-cy)/ry)-.85)/.4));
 for(const {r,p} of paths)for(let i=1;i<p.length;i++){
  const [ax,ay]=p[i-1],[bx,by]=p[i],t=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2)));
  coverage=Math.max(coverage,1-ease((Math.hypot(x-ax-t*(bx-ax),y-ay-t*(by-ay))-r)/3));
 }
 return coverage;
}
export function prepareDragonSilk(source:Uint8ClampedArray,plate:Uint8ClampedArray){
 const p=dragonPatch,w=p.width,h=p.height,result=new Uint8ClampedArray(source),delta=[0,0,0];let count=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x<5||y<5||x>w-6||y>h-6){const i=(y*w+x)*4;for(let c=0;c<3;c++)delta[c]+=source[i+c]-plate[i+c];count++;}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const mask=dragonMask(x+p.left,y+p.top)*ease(Math.min(x,y,w-1-x,h-1-y)/7);if(!mask)continue;
  const i=(y*w+x)*4;for(let c=0;c<3;c++)result[i+c]=source[i+c]*(1-mask)+(plate[i+c]+delta[c]/count)*mask;
 }
 return result;
}
