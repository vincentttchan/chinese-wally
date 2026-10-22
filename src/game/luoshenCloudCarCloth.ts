type Point={x:number;y:number};
export type CloudCarCloth={id:string;amplitude:number;vertices:Point[]};
const points=(pairs:readonly (readonly [number,number,number,number])[])=>pairs.flatMap(([x,y,a,b])=>[{x,y},{x:a,y:b}]);
/** Cross-sections follow actual painted cloth, not rectangular patches. Both attached ends are fixed. */
export const cloudCarClothParts:CloudCarCloth[]=[
 {id:'sleeve',amplitude:5.5,vertices:points([[98,338,119,345],[79,372,139,375],[51,399,137,408],[24,414,115,439],[57,441,94,449],[80,447,96,451]])},
 {id:'canopy-band',amplitude:6,vertices:points([[285,187,300,187],[297,231,317,231],[321,269,339,269],[348,310,367,310],[372,351,391,351],[389,386,411,386],[402,403,427,403]])},
 {id:'lower-sleeve',amplitude:3.5,vertices:points([[279,417,294,420],[270,447,283,452],[257,470,270,479],[238,478,250,488],[221,477,226,486]])},
];
export function cloudCarClothPose(part:CloudCarCloth,age:number):Point[]{
 const t=Math.min(1,Math.max(0,age/3800));if(t===0||t===1)return part.vertices.map(p=>({...p}));
 const count=part.vertices.length/2,envelope=Math.sin(Math.PI*t)**2;
 return part.vertices.map((p,i)=>{
  const section=Math.floor(i/2),u=section/(count-1);if(section===0||section===count-1)return {...p};
  const before=(section-1)*2,after=(section+1)*2,a=part.vertices[before],b=part.vertices[before+1],c=part.vertices[after],d=part.vertices[after+1];
  const dx=(c.x+d.x-a.x-b.x)/2,dy=(c.y+d.y-a.y-b.y)/2,length=Math.hypot(dx,dy)||1;
  const sway=part.amplitude*Math.sin(Math.PI*u)*Math.sin(t*Math.PI*2-u*.8)*envelope;
  return {x:p.x-dy/length*sway,y:p.y+dx/length*sway};
 });
}
export function cloudCarClothTriangles(part:CloudCarCloth){const indices:number[][]=[];for(let i=0;i<part.vertices.length-2;i+=2)indices.push([i,i+1,i+2],[i+1,i+3,i+2]);return indices;}
function inTriangle(x:number,y:number,a:Point,b:Point,c:Point){const edge=(p:Point,q:Point)=>(x-q.x)*(p.y-q.y)-(p.x-q.x)*(y-q.y),d=[edge(a,b),edge(b,c),edge(c,a)];return !(d.some(v=>v<0)&&d.some(v=>v>0));}
export function isCloudCarCloth(x:number,y:number){return cloudCarClothParts.some(part=>cloudCarClothTriangles(part).some(([a,b,c])=>inTriangle(x,y,part.vertices[a],part.vertices[b],part.vertices[c])));}
function triangle(ctx:CanvasRenderingContext2D,image:CanvasImageSource,s:Point[],d:Point[]){
 const [a,b,c]=s,[p,q,r]=d,det=(b.x-a.x)*(c.y-a.y)-(c.x-a.x)*(b.y-a.y);if(Math.abs(det)<.00001)return;
 const m=(u:number,v:number,w:number)=>[( (v-u)*(c.y-a.y)-(w-u)*(b.y-a.y))/det,((w-u)*(b.x-a.x)-(v-u)*(c.x-a.x))/det];
 const [xx,xy]=m(p.x,q.x,r.x),[yx,yy]=m(p.y,q.y,r.y);
 const center={x:(p.x+q.x+r.x)/3,y:(p.y+q.y+r.y)/3},expanded=d.map(v=>{const dx=v.x-center.x,dy=v.y-center.y,l=Math.hypot(dx,dy)||1;return {x:v.x+dx/l*.55,y:v.y+dy/l*.55};});
 ctx.save();ctx.beginPath();ctx.moveTo(expanded[0].x,expanded[0].y);ctx.lineTo(expanded[1].x,expanded[1].y);ctx.lineTo(expanded[2].x,expanded[2].y);ctx.closePath();ctx.clip();ctx.transform(xx,yx,xy,yy,p.x-xx*a.x-xy*a.y,p.y-yx*a.x-yy*a.y);ctx.drawImage(image,0,0);ctx.restore();
}
export function drawCloudCarCloth(ctx:CanvasRenderingContext2D,image:CanvasImageSource,age:number){for(const part of cloudCarClothParts){const pose=cloudCarClothPose(part,age);for(const ids of cloudCarClothTriangles(part))triangle(ctx,image,ids.map(i=>part.vertices[i]),ids.map(i=>pose[i]));}}

export const cloudCarFixedCart=[{x:98,y:416},{x:190,y:479},{x:267,y:478},{x:268,y:523},{x:236,y:541},{x:170,y:541},{x:94,y:472}];
export function isCloudCarCart(x:number,y:number){let hit=false;const poly=cloudCarFixedCart;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)hit=!hit;}return hit;}
