/** Isolated ink residuals over stationary source silk. Only the outer feathers bend. */
const width=236,height=124,left=1108,top=40;
type Point=readonly [number,number];
type Feather={root:Point;tip:Point;outline:Point[];sign:number;bird:number};
const feathers:Feather[]=[
 {root:[1194,100],tip:[1229,71],outline:[[1198,90],[1205,82],[1217,76],[1232,69],[1225,81],[1223,89],[1220,95],[1213,100],[1205,101],[1199,97]],sign:-1,bird:0},
 {root:[1194,100],tip:[1141,117],outline:[[1181,101],[1170,102],[1157,109],[1146,114],[1138,117],[1152,118],[1166,117],[1179,114],[1186,108]],sign:1,bird:0},
 {root:[1275,120],tip:[1310,104],outline:[[1284,110],[1294,105],[1307,102],[1313,103],[1310,110],[1305,117],[1296,120],[1285,119]],sign:-1,bird:1},
 {root:[1275,120],tip:[1236,137],outline:[[1261,122],[1251,129],[1241,133],[1230,136],[1235,139],[1246,140],[1259,137],[1270,130]],sign:1,bird:1},
];
const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
function edgesAt(x:number,f:Feather){
 const ys:number[]=[];
 for(let i=0;i<f.outline.length;i++){
  const a=f.outline[i],b=f.outline[(i+1)%f.outline.length];
  if((a[0]<=x&&b[0]>x)||(b[0]<=x&&a[0]>x))ys.push(a[1]+(x-a[0])*(b[1]-a[1])/(b[0]-a[0]));
 }
 return ys.length>=2?[Math.min(...ys),Math.max(...ys)]:null;
}
function pulse(time:number,bird:number){
 const t=(time-250-bird*320)/3000;
 return t<=0||t>=1?0:Math.sin(Math.PI*t)**2;
}
function bend(x:number,y:number,f:Feather){
 const vx=f.tip[0]-f.root[0],vy=f.tip[1]-f.root[1];
 if(Math.hypot(x-f.root[0],y-f.root[1])<20)return 0;
 return smooth(((x-f.root[0])*vx+(y-f.root[1])*vy)/(vx*vx+vy*vy)/.68-.48);
}
export function featherDisplacement(x:number,y:number,time:number){
 for(const f of feathers){
  const edge=edgesAt(x,f);if(!edge||y<edge[0]||y>edge[1])continue;
  const amount=bend(x,y,f)*pulse(time,f.bird);
  return {x:.4*amount,y:f.sign*6.5*amount};
 }
 return {x:0,y:0};
}
type Ink={x:number;y:number;feather:Feather;bend:number;rgb:number[]};
let cachedSource:Uint8ClampedArray|undefined,ink:Ink[]=[];
function prepare(source:Uint8ClampedArray){
 if(source===cachedSource)return;cachedSource=source;ink=[];
 const sample=(x:number,y:number,c:number)=>source[(Math.max(0,Math.min(height-1,Math.round(y-top)))*width+Math.max(0,Math.min(width-1,Math.round(x-left))))*4+c];
 for(const f of feathers)for(let x=left;x<left+width;x++){
  const edge=edgesAt(x+.5,f);if(!edge)continue;
  // Estimate only the ink's darkness from silk just outside the feather silhouette.
  const upper=[0,1,2].map(c=>{let s=0;for(let d=3;d<=7;d++)s+=sample(x,edge[0]-d,c);return s/5;});
  const lower=[0,1,2].map(c=>{let s=0;for(let d=3;d<=7;d++)s+=sample(x,edge[1]+d,c);return s/5;});
  for(let y=Math.ceil(edge[0]);y<=Math.floor(edge[1]);y++){
   const bending=bend(x,y,f);if(!bending)continue;
   const t=(y-edge[0])/(edge[1]-edge[0]);
   const difference=[0,1,2].map(c=>sample(x,y,c)-(upper[c]*(1-t)+lower[c]*t));
   // A dark ink matte, not a cropped silk rectangle. Bright silk marks stay in place.
   const darkness=-difference.reduce((a,b)=>a+b,0)/3;
   const alpha=smooth((darkness-1)/5)*smooth(Math.min(y-edge[0],edge[1]-y));
   if(alpha===0)continue;
   ink.push({x:x-left,y:y-top,feather:f,bend:bending,rgb:difference.map(v=>Math.min(0,v)*alpha)});
  }
 }
}
/** Subtract the resting ink and deposit moved ink; no source coordinates of the silk change. */
export function renderFeatherFrame(source:Uint8ClampedArray,out:Uint8ClampedArray,time:number){
 out.set(source);if(!pulse(time,0)&&!pulse(time,1))return;
 prepare(source);
 const delta=new Float32Array(width*height*3);
 for(const item of ink){
  const amount=item.bend*pulse(time,item.feather.bird);if(amount===0)continue;
  const x=item.x+.4*amount,y=item.y+item.feather.sign*6.5*amount;
  const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
  const original=(item.y*width+item.x)*3;
  for(let c=0;c<3;c++)delta[original+c]-=item.rgb[c];
  for(const [tx,ty,weight] of [[ix,iy,(1-fx)*(1-fy)],[ix+1,iy,fx*(1-fy)],[ix,iy+1,(1-fx)*fy],[ix+1,iy+1,fx*fy]]){
   if(tx<0||ty<0||tx>=width||ty>=height)continue;
   const p=(ty*width+tx)*3;for(let c=0;c<3;c++)delta[p+c]+=item.rgb[c]*weight;
  }
 }
 for(let p=0;p<width*height;p++){
  // Guard the complete shoulder disk, including landing pixels from neighbouring feathers.
  const x=p%width+left,y=Math.floor(p/width)+top;
  if(feathers.some(f=>Math.hypot(x-f.root[0],y-f.root[1])<20))continue;
  for(let c=0;c<3;c++)if(delta[p*3+c])out[p*4+c]=source[p*4+c]+delta[p*3+c];
 }
}
