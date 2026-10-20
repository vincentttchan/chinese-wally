/** A newly drawn bird, explicitly separate from the historical painting. */
export const redrawnBirdDuration=6200;
export const redrawnBirdSize={width:1100,height:760};
export const birdShoulder={x:590,y:410};
export const birdAtlas={
 body:{x:0,y:0,width:920,height:440},
 near:{x:930,y:0,width:800,height:435},
 far:{x:0,y:440,width:870,height:469},
};
export type BirdWing='near'|'far';
export function redrawnBirdPose(time:number,variant=0){
 const t=Math.max(0,Math.min(redrawnBirdDuration,time));
 const rest=variant?{near:-7,far:5,tip:0}:{near:0,far:0,tip:0};
 if(t===0||t===redrawnBirdDuration)return rest;
 const envelope=Math.sin(Math.PI*t/redrawnBirdDuration)**.7;
 const wave=Math.sin(t*Math.PI*2/1950);
 const following=Math.sin((t-110)*Math.PI*2/1950);
 return {near:rest.near+wave*16*envelope*(variant?.85:1),far:rest.far-wave*13*envelope*(variant?.85:1),tip:following*3*envelope};
}
const wings={near:{pivot:{x:685,y:113},scale:.85},far:{pivot:{x:220,y:360},scale:.8}};
export function redrawnWingPoint(x:number,y:number,time:number,wing:BirdWing,variant=0){
 const rig=wings[wing],pose=redrawnBirdPose(time,variant);
 const dx=(x-rig.pivot.x)*rig.scale,dy=(y-rig.pivot.y)*rig.scale;
 const angle=pose[wing]*Math.PI/180;
 const lag=pose.tip*Math.PI/180*(wing==='near'?1:-1)*.5;
 const follow=dy+dx*lag;
 return {x:birdShoulder.x+dx*Math.cos(angle)-follow*Math.sin(angle),y:birdShoulder.y+dx*Math.sin(angle)+follow*Math.cos(angle)};
}
/** Whole, transparent layers pivot cleanly; a small delayed shear softens the feather return. */
export function drawRedrawnBird(ctx:CanvasRenderingContext2D,parts:Record<'body'|BirdWing,CanvasImageSource>,time:number,variant=0){
 ctx.clearRect(0,0,redrawnBirdSize.width,redrawnBirdSize.height);
 const pose=redrawnBirdPose(time,variant);
 const drawWing=(wing:BirdWing)=>{
  const rig=wings[wing];
  ctx.save();ctx.translate(birdShoulder.x,birdShoulder.y);ctx.rotate(pose[wing]*Math.PI/180);
  ctx.transform(1,pose.tip*Math.PI/180*(wing==='near'?1:-1)*.5,0,1,0,0);
  ctx.scale(rig.scale,rig.scale);ctx.translate(-rig.pivot.x,-rig.pivot.y);
  ctx.drawImage(parts[wing],0,0);ctx.restore();
 };
 drawWing('far');drawWing('near');
 // The intact torso sits over both rounded shoulder nubs, concealing their attachment.
 ctx.drawImage(parts.body,80,130);
}
