export const farewellDuration=3400;
export const farewellPatch={tile:4,left:0,top:510,width:220,height:240,resolution:1.5};
export const farewellAtlas={body:{x:0,y:0,width:750,height:630},head:{x:750,y:0,width:504,height:630},arm:{x:0,y:630,width:560,height:260},sleeve:{x:0,y:870,width:560,height:384}};
export type FarewellPart=keyof typeof farewellAtlas;
export const farewellRig={body:{joint:{x:101,y:147},pivot:{x:400,y:240},sx:.16,sy:.16},head:{joint:{x:101,y:147},pivot:{x:260,y:560},sx:.16,sy:.16},arm:{joint:{x:79,y:147},pivot:{x:440,y:420},sx:.18,sy:.18},sleeve:{joint:{x:43,y:114.6},pivot:{x:240,y:0},sx:.18,sy:.18}};
const smooth=(v:number)=>{const x=Math.min(1,Math.max(0,v));return x*x*(3-2*x);};
const pulse=(t:number,start:number,end:number)=>t<=start||t>=end?0:Math.sin(Math.PI*(t-start)/(end-start))**2;
export const farewellOpacity=(t:number)=>smooth(t/220)*smooth((farewellDuration-t)/260);
export function farewellPose(t:number){if(t<=0||t>=farewellDuration)return {body:0,head:0,arm:0,sleeve:0};return {body:0,head:-2.6*pulse(t,200,3000),arm:-4*pulse(t,400,3100),sleeve:1.8*pulse(t,650,3200)};}
export function farewellPartPoint(part:FarewellPart,x:number,y:number,t:number):{x:number;y:number}{const r=farewellRig[part],pose=farewellPose(t),joint=part==='sleeve'?farewellPartPoint('arm',240,240,t):r.joint,a=(pose[part]+(part==='sleeve'?pose.arm:0))*Math.PI/180,dx=(x-r.pivot.x)*r.sx,dy=(y-r.pivot.y)*r.sy;return {x:joint.x+dx*Math.cos(a)-dy*Math.sin(a),y:joint.y+dx*Math.sin(a)+dy*Math.cos(a)};}
export const oldFigure=[[30,60],[61,55],[65,84],[76,85],[70,65],[75,49],[110,49],[121,68],[121,83],[128,98],[127,125],[138,143],[133,163],[107,180],[91,193],[76,203],[65,218],[45,218],[29,198],[18,172],[11,132],[11,94],[20,74]];
const wing=[[74,132],[108,149],[126,145],[150,179],[145,230],[112,239],[91,208],[77,177]];
function inside(poly:number[][],x:number,y:number){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [ax,ay]=poly[j],[bx,by]=poly[i];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)hit=!hit;}return hit;}
export function farewellForeground(x:number,y:number){return x>=126&&y>=112||inside(wing,x,y)||x>=76&&y>=230;}
/** Static source pixels include the foreground bird and the full patch border. */
export function farewellProtectedPixels(width:number,height:number){const p=farewellPatch,indices:number[]=[];for(let y=0;y<height;y++)for(let x=0;x<width;x++){const gx=x/width*p.width,gy=y/height*p.height;if(gx<8||gy<8||gx>p.width-9||gy>p.height-9||farewellForeground(gx,gy))indices.push((y*width+x)*4);}return indices;}
export function restoreFarewellStatic(target:Uint8ClampedArray,source:Uint8ClampedArray,indices:readonly number[]){for(const i of indices){target[i]=source[i];target[i+1]=source[i+1];target[i+2]=source[i+2];target[i+3]=source[i+3];}}
export function prepareFarewellSilk(source:Uint8ClampedArray,plate:Uint8ClampedArray){
 const p=farewellPatch,out=new Uint8ClampedArray(source),offset=[0,0,0];let count=0;
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++)if(x<6||y<6||x>=p.width-6||y>=p.height-6){const i=(y*p.width+x)*4;for(let k=0;k<3;k++)offset[k]+=source[i+k]-plate[i+k];count++;}
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
  if(!inside(oldFigure,x,y)||farewellForeground(x,y))continue;let d=Infinity;
  for(let i=0,j=oldFigure.length-1;i<oldFigure.length;j=i++){const [ax,ay]=oldFigure[j],[bx,by]=oldFigure[i],t=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2)));d=Math.min(d,Math.hypot(x-ax-t*(bx-ax),y-ay-t*(by-ay)));}
  const a=smooth(d/3),i=(y*p.width+x)*4;for(let k=0;k<3;k++)out[i+k]=source[i+k]*(1-a)+(plate[i+k]+offset[k]/count)*a;
 }
 return out;
}
export function drawFarewellParts(ctx:CanvasRenderingContext2D,parts:Record<FarewellPart,CanvasImageSource>,time:number){
 const p=farewellPatch,pose=farewellPose(time);ctx.clearRect(0,0,p.width*p.resolution,p.height*p.resolution);ctx.save();ctx.scale(p.resolution,p.resolution);
 for(const part of ['sleeve','head','arm','body'] as FarewellPart[]){const r=farewellRig[part],joint=part==='sleeve'?farewellPartPoint('arm',240,240,time):r.joint;ctx.save();ctx.translate(joint.x,joint.y);ctx.rotate((pose[part]+(part==='sleeve'?pose.arm:0))*Math.PI/180);ctx.scale(r.sx,r.sy);ctx.translate(-r.pivot.x,-r.pivot.y);ctx.drawImage(parts[part],0,0);ctx.restore();}ctx.restore();
}
