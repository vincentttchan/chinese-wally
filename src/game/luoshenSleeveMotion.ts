export type SleeveKind='cao'|'companion';
export const sleeveDuration=2400,sleeveComparisonDelay=2700;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
/** Head, collar, torso centre and hem stay pinned. Only sleeve fields move. */
export function sleevePoint(kind:SleeveKind,x:number,y:number,age:number){
 const t=clamp(age/sleeveDuration);if(t===0||t===1)return {x,y};
 const action=Math.sin(Math.PI*t)**2;
 if(kind==='cao'){
  const side=x<390?-1:x>570?1:0,root=side<0?390:570,reach=clamp(Math.abs(x-root)/300),vertical=Math.sin(Math.PI*clamp((y-390)/970))**2;
  const strength=reach*reach*vertical;
  return {x:x+side*68*action*strength,y:y-38*action*strength+14*Math.sin(Math.PI*t*2)*action*strength};
 }
 const band=Math.sin(Math.PI*clamp((y-510)/750))**2,edge=Math.sin(Math.PI*clamp((x-260)/490))**2;
 return {x:x+(460-x)*.13*band*edge*action,y:y-24*band*edge*action};
}
type Point={x:number;y:number};
function triangle(ctx:CanvasRenderingContext2D,image:CanvasImageSource,s:Point[],d:Point[]){
 const [a,b,c]=s,[p,q,r]=d,det=(b.x-a.x)*(c.y-a.y)-(c.x-a.x)*(b.y-a.y);
 const coefficient=(u:number,v:number,w:number)=>[((v-u)*(c.y-a.y)-(w-u)*(b.y-a.y))/det,((w-u)*(b.x-a.x)-(v-u)*(c.x-a.x))/det];
 const [xx,xy]=coefficient(p.x,q.x,r.x),[yx,yy]=coefficient(p.y,q.y,r.y),cx=(p.x+q.x+r.x)/3,cy=(p.y+q.y+r.y)/3;
 ctx.save();ctx.beginPath();d.forEach((v,i)=>{const dx=v.x-cx,dy=v.y-cy,l=Math.hypot(dx,dy)||1;const x=v.x+dx/l*.45,y=v.y+dy/l*.45;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.closePath();ctx.clip();ctx.transform(xx,yx,xy,yy,p.x-xx*a.x-xy*a.y,p.y-yx*a.x-yy*a.y);ctx.drawImage(image,0,0,1024,1536);ctx.restore();
}
/** Continuous shared-edge cloth mesh prevents cuts between moving sleeves and fixed torso. */
export function drawSleeveStudy(ctx:CanvasRenderingContext2D,image:CanvasImageSource,kind:SleeveKind,age:number){
 ctx.clearRect(0,0,1024,1536);if(age<=0||age>=sleeveDuration){ctx.drawImage(image,0,0,1024,1536);return;}
 ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(1024,0);ctx.lineTo(1024,360);ctx.lineTo(0,360);ctx.closePath();ctx.clip();ctx.drawImage(image,0,0,1024,1536);ctx.restore();
 for(let row=0;row<18;row++)for(let col=0;col<12;col++){
  const a={x:col*1024/12,y:360+row*1176/18},b={x:(col+1)*1024/12,y:a.y},c={x:a.x,y:360+(row+1)*1176/18},d={x:b.x,y:c.y};
  for(const points of [[a,b,c],[b,d,c]])triangle(ctx,image,points,points.map(p=>sleevePoint(kind,p.x,p.y,age)));
 }
}
