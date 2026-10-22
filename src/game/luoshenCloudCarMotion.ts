export const cloudCarDuration=3800;
export const cloudCarPatch={tile:3,left:60,top:100,width:650,height:700};
export function cloudCarOpacity(age:number){return Math.min(1,Math.max(0,age/260),Math.max(0,(cloudCarDuration-age)/340));}
const bell=(v:number,a:number,b:number)=>v<=a||v>=b?0:Math.sin(Math.PI*(v-a)/(b-a))**2;
export const cloudCarFixedHeads=[{left:135,right:200,top:220,bottom:335},{left:235,right:300,top:235,bottom:340}] as const;
/** Only the generated ink moves. All offsets vanish at each attachment and outside its part. */
export function cloudCarWeights(x:number,y:number){
 // Protect whole heads, including hair next to the fringe, from every motion field.
 if(cloudCarFixedHeads.some(b=>x>=b.left&&x<=b.right&&y>=b.top&&y<=b.bottom))return {x:0,y:0};
 const fringe=bell(x,145,395)*bell(y,182,242);
 return {x:4.2*fringe,y:1.2*fringe};
}

export function cloudCarPhase(age:number){const t=Math.min(1,Math.max(0,age/cloudCarDuration)),envelope=Math.sin(Math.PI*t)**2;return {x:Math.sin(t*Math.PI*3+.4)*envelope,y:Math.sin(t*Math.PI*2)*envelope};}
export function cloudCarOffset(x:number,y:number,age:number){const w=cloudCarWeights(x,y),p=cloudCarPhase(age);return {x:0+w.x*p.x,y:0+w.y*p.y};}
