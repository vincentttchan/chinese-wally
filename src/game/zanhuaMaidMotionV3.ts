/** Articulated in-painting performance. The fan, palms and limb segments are rigid. */
export type MaidPoint={x:number;y:number};
type Matrix={a:number;b:number;c:number;d:number;tx:number;ty:number};
export const maidMotionDuration=8200;
const smooth=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*t*(t*(t*6-15)+10);};
const between=(t:number,a:number,b:number)=>smooth((t-a)/(b-a));
const length=(a:MaidPoint,b:MaidPoint)=>Math.hypot(b.x-a.x,b.y-a.y);
const apply=(m:Matrix,p:MaidPoint):MaidPoint=>({x:m.a*p.x+m.c*p.y+m.tx,y:m.b*p.x+m.d*p.y+m.ty});
function rotate(angle:number,from:MaidPoint,to:MaidPoint):Matrix{
 const a=Math.cos(angle),b=Math.sin(angle),c=-b,d=a;
 return {a,b,c,d,tx:to.x-a*from.x-c*from.y,ty:to.y-b*from.x-d*from.y};
}
function segmentMatrix(a:MaidPoint,b:MaidPoint,c:MaidPoint,d:MaidPoint){
 return rotate(Math.atan2(d.y-c.y,d.x-c.x)-Math.atan2(b.y-a.y,b.x-a.x),a,c);
}
/** A single continuous oscillation: no stops at the intermediate rest angle. */
function fanStroke(time:number){
 const u=Math.max(0,Math.min(1,(time-2850)/3150));
 return Math.sin(4*Math.PI*u)*Math.sin(Math.PI*u)**2*(1-.25*u);
}
function motion(time:number){
 const turn=between(time,300,1450)*(1-between(time,6200,7700));
 const lift=between(time,1250,2850)*(1-between(time,6100,7600));
 const stroke=fanStroke(time);
 const shoulder=between(time,480,1660)*(1-between(time,6330,7750));
 const torso=rotate(.008*shoulder+.002*stroke,{x:250,y:800},{x:250-2.2*shoulder,y:800-1.4*lift});
 const head=rotate(-.035*turn+.008*stroke,{x:263,y:278},{x:263-2*turn,y:278+1.5*turn});
 return {turn,lift,stroke,torso,head,angle:.026*lift+.032*stroke};
}
type Motion=ReturnType<typeof motion>;
function bodyBase(p:MaidPoint,m:Motion){
 const strength=1-smooth((p.y-600)/390),q=apply(m.torso,p);
 return {x:p.x+(q.x-p.x)*strength,y:p.y+(q.y-p.y)*strength};
}
export const maidRestArms=[
 {shoulder:{x:230,y:332},elbow:{x:173,y:462},wrist:{x:104,y:535},grip:{x:111,y:560}},
 {shoulder:{x:338,y:315},elbow:{x:368,y:410},wrist:{x:302,y:398},grip:{x:289,y:360}}
] as const;
/** The raised forearm drives the palm and fan as one rigid grip.
 * Previously the fan drove an IK wrist, bending the palm up to 34 degrees away
 * from the forearm. Forward kinematics preserves the drawn wrist articulation.
 */
function raisedArm(m:Motion){
 const rest=maidRestArms[1],shoulder=bodyBase(rest.shoulder,m);
 const upper=rotate(-.025*m.lift+.004*m.stroke,rest.shoulder,shoulder);
 const elbow=apply(upper,rest.elbow),fore=rotate(m.angle,rest.elbow,elbow);
 const wrist=apply(fore,rest.wrist);
 return {shoulder,elbow,wrist,upper,fore};
}
function fanTransform(m:Motion){return raisedArm(m).fore;}
/** Two-bone inverse kinematics: keep limb length and the original bend side. */
function elbowAt(shoulder:MaidPoint,wrist:MaidPoint,rest:typeof maidRestArms[number]){
 const upper=length(rest.shoulder,rest.elbow),fore=length(rest.elbow,rest.wrist),distance=length(shoulder,wrist);
 const d=Math.min(upper+fore-1e-6,Math.max(Math.abs(upper-fore)+1e-6,distance));
 const ux=(wrist.x-shoulder.x)/distance,uy=(wrist.y-shoulder.y)/distance;
 const along=(upper*upper-fore*fore+d*d)/(2*d),height=Math.sqrt(Math.max(0,upper*upper-along*along));
 const cross=(rest.elbow.x-rest.shoulder.x)*(rest.wrist.y-rest.shoulder.y)-(rest.elbow.y-rest.shoulder.y)*(rest.wrist.x-rest.shoulder.x);
 const sign=cross>0?-1:1;
 return {x:shoulder.x+ux*along-uy*height*sign,y:shoulder.y+uy*along+ux*height*sign};
}
export function maidMotionPose(time:number){
 const m=motion(time),fan=fanTransform(m);
 const arms=maidRestArms.map((rest,i)=>{
  if(i===1)return raisedArm(m);
  const shoulder=bodyBase(rest.shoulder,m),wrist=apply(fan,rest.wrist),elbow=elbowAt(shoulder,wrist,rest);
  return {shoulder,elbow,wrist,upper:segmentMatrix(rest.shoulder,rest.elbow,shoulder,elbow),fore:segmentMatrix(rest.elbow,rest.wrist,elbow,wrist)};
 });
 // Fabric follows the wrist a little later, while the palm and shaft stay locked.
 const delayed=motion(Math.max(0,time-110)),clothFan=fanTransform(delayed);
 const cloth=maidRestArms.map(rest=>{const q=apply(clothFan,rest.wrist),base=bodyBase(rest.wrist,m);return {x:q.x-base.x,y:q.y-base.y};});
 return {...m,fan,arms,cloth};
}
export type MaidMotionPose=ReturnType<typeof maidMotionPose>;
function segmentDistance(x:number,y:number,a:MaidPoint,b:MaidPoint){
 const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)));
 return Math.hypot(x-a.x-t*dx,y-a.y-t*dy);
}
const influence=(distance:number,width:number)=>1-smooth((distance-14)/(width-14));
/** Bind once when building the mesh; no per-frame proximity searches. */
export function maidSkinWeights(x:number,y:number){
 const arms=maidRestArms.map((arm,i)=>{
  const upper=influence(segmentDistance(x,y,arm.shoulder,arm.elbow),i?65:58);
  const fore=influence(segmentDistance(x,y,arm.elbow,arm.wrist),i?45:52);
  const hand=influence(segmentDistance(x,y,arm.wrist,arm.grip),i?34:39);
  return {upper,fore,hand,strength:Math.max(upper,fore,hand)};
 });
 const skirt=1-smooth((y-800)/190);
 const left=(1-smooth((x-145)/70))*smooth((y-535)/70)*skirt;
 const right=smooth((x-275)/55)*(1-smooth((x-400)/35))*smooth((y-440)/70)*skirt;
 return {arms,head:1-smooth((y-240)/80),cloth:[left,right]};
}
export type MaidSkinWeights=ReturnType<typeof maidSkinWeights>;
export function maidFanPoint(x:number,y:number,pose:MaidMotionPose){return apply(pose.fan,{x,y});}
export function maidBodyPoint(x:number,y:number,pose:MaidMotionPose,w:MaidSkinWeights=maidSkinWeights(x,y)){
 const p={x,y},base=bodyBase(p,pose),head=apply(pose.head,p);
 base.x+=(head.x-x)*w.head;base.y+=(head.y-y)*w.head;
 w.cloth.forEach((weight,i)=>{base.x+=pose.cloth[i].x*.6*weight;base.y+=pose.cloth[i].y*.6*weight;});
 const total=w.arms.reduce((sum,arm)=>sum+arm.strength,0),normal=Math.max(1,total);
 let px=base.x*(1-Math.min(1,total)),py=base.y*(1-Math.min(1,total));
 w.arms.forEach((weights,i)=>{
  if(!weights.strength)return;
  const arm=pose.arms[i],a=apply(arm.upper,p),b=apply(arm.fore,p),hand=apply(pose.fan,p),sum=weights.upper+weights.fore;
  const q=sum?{x:(a.x*weights.upper+b.x*weights.fore)/sum,y:(a.y*weights.upper+b.y*weights.fore)/sum}:base;
  q.x+=(hand.x-q.x)*weights.hand;q.y+=(hand.y-q.y)*weights.hand;
  px+=q.x*weights.strength/normal;py+=q.y*weights.strength/normal;
 });
 return {x:px,y:py};
}
/** Constant mesh bindings for GPU skinning, so animation does not rebuild 7,000 vertices each frame. */
export function maidSkinChannels(x:number,y:number){
 const w=maidSkinWeights(x,y),total=w.arms.reduce((sum,arm)=>sum+arm.strength,0),normal=Math.max(1,total);
 let base=1-Math.min(1,total);
 const bones:number[]=[];let hand=0;
 w.arms.forEach(arm=>{const sum=arm.upper+arm.fore,influence=arm.strength/normal;
  bones.push(sum?influence*(1-arm.hand)*arm.upper/sum:0,sum?influence*(1-arm.hand)*arm.fore/sum:0);
  hand+=influence*arm.hand;
  if(!sum)base+=influence*(1-arm.hand);
 });
 return {torso:[base,base*(1-smooth((y-600)/390)),base*w.head,hand],cloth:w.cloth.map(n=>n*base*.6),bones};
}
