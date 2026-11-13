export const zanhuaMaidDuration=7200;
const smooth=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
const envelope=(time:number,start:number,rise:number,fall:number,end:number)=>smooth((time-start)/rise)*(1-smooth((time-fall)/(end-fall)));
export function zanhuaMaidPerformance(time:number){
 const turn=envelope(time,400,1400,5100,6900),lift=envelope(time,1200,1300,4900,6650),age=(time-2400)/2250;
 const strokes=age>0&&age<1?Math.sin(age*Math.PI*4)*Math.sin(age*Math.PI)**2:0;
 return {turn,lift,head:.07*turn,fan:-.105*lift+.042*strokes,cloth:2.8*strokes+1.8*Math.sin(Math.max(0,time-1200)/1050)*lift};
}
function distanceToHandle(x:number,y:number){
 const ax=90,ay=548,bx=600,by=52,t=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2)));
 return Math.hypot(x-ax-t*(bx-ax),y-ay-t*(by-ay));
}
export function zanhuaMaidWeights(x:number,y:number){
 const fanArea=smooth((x-340)/30)*(1-smooth((y-265)/35)),handle=1-smooth((distanceToHandle(x,y)-25)/45);
 const hands=Math.max(1-smooth((Math.hypot(x-292,y-365)-26)/45),1-smooth((Math.hypot(x-90,y-548)-24)/35));
 return {fan:Math.max(fanArea,handle,hands),head:(1-smooth((y-245)/60))*smooth((x-135)/35)*(1-smooth((x-325)/25)),upper:1-smooth((y-580)/425),skirt:smooth((y-575)/125)*(1-smooth((y-880)/130))};
}
export function zanhuaMaidPoint(x:number,y:number,pose:ReturnType<typeof zanhuaMaidPerformance>,w=zanhuaMaidWeights(x,y)){
 const {turn,lift}=pose,angle=pose.head*w.head,dx=x-275,dy=y-270;
 const hx=w.head?275+(dx*Math.cos(angle)-dy*Math.sin(angle))*(1-.055*turn*w.head):x;
 const hy=w.head?270+dx*Math.sin(angle)+dy*Math.cos(angle):y;
 const body={x:230+(hx-230)*(1-.045*turn*w.upper)-9*turn*w.upper+pose.cloth*w.skirt,y:hy-4*lift*w.upper+pose.cloth*.22*w.skirt};
 const fx=x-90,fy=y-548,c=Math.cos(pose.fan),s=Math.sin(pose.fan);
 const fan={x:230+(90+fx*c-fy*s-230)*(1-.025*turn)-6*turn,y:548+fx*s+fy*c-3*lift};
 return {x:body.x+(fan.x-body.x)*w.fan,y:body.y+(fan.y-body.y)*w.fan};
}

// The new performance has two registered layers. The fan is a rigid plane;
// both hands follow its shaft grips, rather than bending the shaft with a mesh.
export const zanhuaMaidRigDuration=8200;
export const zanhuaMaidGrips={lower:{x:111,y:560},upper:{x:289,y:360}} as const;
type RigPoint={x:number;y:number};
type RigMotion={turn:number;lift:number;stroke:number;angle:number;twist:number};
function rigMotion(time:number):RigMotion{
 const turn=envelope(time,600,1300,5900,7600),lift=envelope(time,1700,1300,5700,7400);
 const age=(time-3000)/2600;
 const stroke=age>0&&age<1?Math.sin(age*Math.PI*4)*Math.sin(age*Math.PI)**2:0;
 return {turn,lift,stroke,angle:-.075*lift+.018*stroke,twist:.66*stroke};
}
function baseBodyPoint(x:number,y:number,pose:RigMotion):RigPoint{
 const torso=1-smooth((y-540)/450),head=1-smooth((y-240)/80);
 const angle=.045*pose.turn*head,dx=x-263,dy=y-278;
 return {x:263+(dx*Math.cos(angle)-dy*Math.sin(angle))*(1-.04*pose.turn*head)-7*pose.turn*torso,
  y:278+dx*Math.sin(angle)+dy*Math.cos(angle)-2*pose.lift*torso};
}
const shaftLength=Math.hypot(178,200),ux=178/shaftLength,uy=-200/shaftLength;
function fanPoint(x:number,y:number,pose:RigMotion,target:RigPoint):RigPoint{
 const dx=x-zanhuaMaidGrips.lower.x,dy=y-zanhuaMaidGrips.lower.y;
 const along=dx*ux+dy*uy,across=(-dx*uy+dy*ux)*Math.cos(pose.twist);
 const px=along*ux-across*uy,py=along*uy+across*ux,c=Math.cos(pose.angle),s=Math.sin(pose.angle);
 return {x:target.x+px*c-py*s,y:target.y+px*s+py*c};
}
export function zanhuaMaidRigPose(time:number){
 const pose=rigMotion(time),rest=baseBodyPoint(zanhuaMaidGrips.lower.x,zanhuaMaidGrips.lower.y,pose);
 const lower={x:rest.x-2*pose.lift,y:rest.y-5*pose.lift};
 const deltas=[zanhuaMaidGrips.lower,zanhuaMaidGrips.upper].map(p=>{
  const a=baseBodyPoint(p.x,p.y,pose),b=fanPoint(p.x,p.y,pose,lower);
  return {x:b.x-a.x,y:b.y-a.y};
 });
 return {...pose,lower,deltas};
}
type RigPose=ReturnType<typeof zanhuaMaidRigPose>;
export function zanhuaMaidFanPoint(x:number,y:number,time:number,pose:RigPose=zanhuaMaidRigPose(time)){
 return fanPoint(x,y,pose,pose.lower);
}
export function zanhuaMaidBodyPoint(x:number,y:number,time:number,pose:RigPose=zanhuaMaidRigPose(time)){
 const point=baseBodyPoint(x,y,pose);
 [zanhuaMaidGrips.lower,zanhuaMaidGrips.upper].forEach((grip,i)=>{
  const weight=1-smooth(Math.hypot(x-grip.x,y-grip.y)/(i===0?115:105));
  point.x+=weight*pose.deltas[i].x;point.y+=weight*pose.deltas[i].y;
 });
 return point;
}
