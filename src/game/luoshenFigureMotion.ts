/** Shared duration, fade and fixed background; V1 warp helpers retained below.
 * Current runtime motion uses the independent rigid parts in luoshenFigureParts.ts. */
export const luoshenFigureDuration=5400;
export const luoshenFigurePatch={left:675,top:345,width:335,height:390,resolution:1.5};
export const luoshenFigurePlacement={left:672,top:357,width:285,height:350};
export const luoshenFigureCrop={x:0,y:0,width:1162,height:1354};
const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
export const figureOpacity=(time:number)=>ease(time/280)*ease((luoshenFigureDuration-time)/300);
const gaussian=(x:number,y:number,cx:number,cy:number,rx:number,ry:number)=>Math.exp(-(((x-cx)/rx)**2+((y-cy)/ry)**2)*2);
/** Overlapping influence layers keep neck, shoulders and waist continuous. */
function weights(x:number,y:number){
 if(y>=700)return [0,0,0,0,0];
 const planted=1-ease((y-640)/60),body=planted*ease((855-x)/70);
 return [body,gaussian(x,y,765,416,47,60),gaussian(x,y,803,472,65,60)*planted,gaussian(x,y,719,540,35,110)*planted,ease((x-812)/125)*(1-ease((y-660)/45))];
}
export function figurePose(time:number){
 if(time<=0||time>=luoshenFigureDuration)return {body:0,head:0,hand:0,sleeve:0,ribbon:0};
 const e=Math.sin(Math.PI*time/luoshenFigureDuration)**2,t=time/1000;
 return {body:4.8*e*Math.sin(t*1.8),head:.055*e*Math.sin(t*1.8-.35),hand:5.8*e*Math.sin(t*1.8-.65),sleeve:3.5*e*Math.sin(t*1.8-.95),ribbon:11*e*Math.sin(t*2.4-1.3)};
}
function displacement(x:number,y:number,w:number[],p:ReturnType<typeof figurePose>){
 return {x:w[0]*p.body-w[1]*(y-448)*p.head+w[2]*p.hand*.35+w[3]*p.sleeve*.45-w[4]*p.ribbon*.14,
 y:w[0]*p.body*.13+w[1]*(x-767)*p.head-w[2]*p.hand+w[3]*p.sleeve+w[4]*p.ribbon};
}
export const figureDisplacement=(x:number,y:number,time:number)=>displacement(x,y,weights(x,y),figurePose(time));
const silhouette=[[744,362],[782,361],[788,402],[797,418],[847,422],[853,462],[829,485],[851,497],[911,491],[947,502],[949,527],[926,549],[898,561],[950,571],[980,594],[974,613],[921,617],[868,635],[838,662],[831,700],[780,710],[707,706],[703,679],[717,646],[701,611],[698,552],[697,479],[716,443],[742,430]];
function oldFigureMask(x:number,y:number){
 let inside=false,distance=Infinity;
 for(let i=0,j=silhouette.length-1;i<silhouette.length;j=i++){
  const [ax,ay]=silhouette[j],[bx,by]=silhouette[i];
  if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
  const t=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2)));
  distance=Math.min(distance,Math.hypot(x-ax-t*(bx-ax),y-ay-t*(by-ay)));
 }
 return inside?1:1-ease(distance/4);
}
/** Generated fill is restricted to the old figure; the patch border stays byte-exact. */
export function prepareFigureSilk(source:Uint8ClampedArray,plate:Uint8ClampedArray){
 const p=luoshenFigurePatch,w=p.width,h=p.height,out=new Uint8ClampedArray(source),offset=[0,0,0];let samples=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x<6||y<6||x>w-7||y>h-7){const i=(y*w+x)*4;for(let c=0;c<3;c++)offset[c]+=source[i+c]-plate[i+c];samples++;}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const mask=oldFigureMask(x+p.left,y+p.top)*ease(Math.min(x,y,w-1-x,h-1-y)/7);if(!mask)continue;
  const i=(y*w+x)*4;for(let c=0;c<3;c++)out[i+c]=source[i+c]*(1-mask)+(plate[i+c]+offset[c]/samples)*mask;
 }
 return out;
}
export function prepareFigureInk(rgba:Uint8ClampedArray,width:number,height:number){
 const straight=new Uint8ClampedArray(rgba),premultiplied=new Float32Array(rgba.length),influences=new Float32Array(width*height*5),p=luoshenFigurePatch;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4,wi=(y*width+x)*5;
  // Preserve opaque interior; grade colour once, rather than stacking translucent parts.
  straight[i]*=.84;straight[i+1]*=.83;straight[i+2]*=.79;
  const a=straight[i+3]/255;for(let c=0;c<3;c++)premultiplied[i+c]=straight[i+c]*a;premultiplied[i+3]=straight[i+3];
  const v=weights(p.left+x/p.resolution,p.top+y/p.resolution);for(let k=0;k<5;k++)influences[wi+k]=v[k];
 }
 return {straight,premultiplied,influences,width,height};
}
/** Only transparent redrawn ink is sampled; no original painting pixel is warped. */
export function renderFigureInk(ink:ReturnType<typeof prepareFigureInk>,out:Uint8ClampedArray,time:number){
 const {width:w,height:h,influences:v,premultiplied:s}=ink,p=luoshenFigurePatch,pose=figurePose(time);
 if(time<=0||time>=luoshenFigureDuration){out.set(ink.straight);return;}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const n=y*w+x,i=n*4,k=n*5,gx=p.left+x/p.resolution,gy=p.top+y/p.resolution;
  const dx=v[k]*pose.body-v[k+1]*(gy-448)*pose.head+v[k+2]*pose.hand*.35+v[k+3]*pose.sleeve*.45-v[k+4]*pose.ribbon*.14;
  const dy=v[k]*pose.body*.13+v[k+1]*(gx-767)*pose.head-v[k+2]*pose.hand+v[k+3]*pose.sleeve+v[k+4]*pose.ribbon;
  const sx=x-dx*p.resolution,sy=y-dy*p.resolution;
  if(sx<0||sy<0||sx>=w-1||sy>=h-1){out.fill(0,i,i+4);continue;}
  const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy,a=(iy*w+ix)*4,b=a+4,c=a+w*4,d=c+4;
  const wa=(1-fx)*(1-fy),wb=fx*(1-fy),wc=(1-fx)*fy,wd=fx*fy,alpha=s[a+3]*wa+s[b+3]*wb+s[c+3]*wc+s[d+3]*wd;out[i+3]=alpha;
  for(let channel=0;channel<3;channel++)out[i+channel]=alpha?(s[a+channel]*wa+s[b+channel]*wb+s[c+channel]*wc+s[d+channel]*wd)*255/alpha:0;
 }
}
