/** A separate redrawn streamer over a stationary, temporary silk repair. */
export const redrawnRibbonDuration=5400;
export const redrawnRibbonPatch={left:840,top:470,width:154,height:98,resolution:2};
export const ribbonSpriteCrop={x:160,y:186,width:1260,height:530};
export const ribbonSpritePlacement={left:847,top:501,width:88,height:40};
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export function ribbonLayerOpacity(time:number){return ease(time/220)*ease((redrawnRibbonDuration-time)/240);}
export function redrawnRibbonDisplacement(x:number,time:number){
 if(x<=855||time<=0||time>=redrawnRibbonDuration)return {x:0,y:0};
 const u=Math.max(0,Math.min(1,(x-855)/80)),t=Math.min(redrawnRibbonDuration,time);
 const envelope=Math.sin(Math.PI*t/redrawnRibbonDuration)**2;
 const y=8.5*u*u*envelope*(.8*Math.sin(t*Math.PI*2/2300-u*.9)+.2*Math.sin(t*Math.PI*2/3500-u*.6));
 return {x:-.12*y,y};
}
const ribbonStrokes=[[[855,514],[866,509],[882,505],[898,503],[906,502]],[[906,502],[893,510],[880,518],[866,527],[855,533]],[[855,539],[875,537],[896,533],[914,525],[926,514],[928,510]],[[928,510],[915,518],[901,525],[883,534],[862,541]]];
function oldRibbonStrokeMask(x:number,y:number){
 let distance=Infinity;
 for(const path of ribbonStrokes)for(let i=1;i<path.length;i++){
  const [ax,ay]=path[i-1],[bx,by]=path[i],t=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2)));
  distance=Math.min(distance,Math.hypot(x-ax-t*(bx-ax),y-ay-t*(by-ay)));
 }
 return 1-ease((distance-2)/3);
}
export function prepareRibbonSilk(source:Uint8ClampedArray,plate:Uint8ClampedArray){
 const {width:w,height:h,left,top}=redrawnRibbonPatch,out=new Uint8ClampedArray(source);
 const corrections=[[0,0],[w-20,0],[0,h-20],[w-20,h-20]].map(([x,y])=>[0,1,2].map(c=>{
  let sum=0;for(let yy=y;yy<y+16;yy++)for(let xx=x;xx<x+16;xx++){const i=(yy*w+xx)*4+c;sum+=source[i]-plate[i];}return sum/256;
 }));
 const masks=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)masks[y*w+x]=oldRibbonStrokeMask(x+left,y+top);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const gx=x+left,gy=y+top;if(gy>=544)continue;
  const mask=ease((gx-855)/8)*(1-ease((gx-931)/12))*masks[y*w+x]*ease(Math.min(x,y,w-1-x,h-1-y)/6);
  if(!mask)continue;
  const tx=x/(w-1),ty=y/(h-1),i=(y*w+x)*4;
  const local=[0,0,0],paper=[0,0,0];let samples=0;
  // Match the nearby intact cloth ground, instead of importing a broad colour patch.
  for(let yy=Math.max(0,y-14);yy<=Math.min(h-1,y+14);yy+=2)for(let xx=Math.max(0,x-14);xx<=Math.min(w-1,x+14);xx+=2){
   if(masks[yy*w+xx]>.01||xx+left<=855||yy+top>=544)continue;
   const at=(yy*w+xx)*4;for(let c=0;c<3;c++){local[c]+=source[at+c];paper[c]+=plate[at+c];}samples++;
  }
  for(let c=0;c<3;c++){
   const offset=samples?local[c]/samples-paper[c]/samples:(corrections[0][c]*(1-tx)+corrections[1][c]*tx)*(1-ty)+(corrections[2][c]*(1-tx)+corrections[3][c]*tx)*ty;
   out[i+c]=source[i+c]*(1-mask)+(plate[i+c]+offset)*mask;
  }
 }
 return out;
}
export function prepareRibbonInk(rgba:Uint8ClampedArray){
 const {width,resolution,left}=redrawnRibbonPatch,w=width*resolution;
 const straight=new Uint8ClampedArray(rgba),premultiplied=new Float32Array(rgba.length);
 for(let i=0;i<rgba.length;i+=4){
  const gx=left+((i/4)%w)/resolution,a=rgba[i+3]*.72*ease((gx-855)/10);
  straight[i]=rgba[i]*.79;straight[i+1]=rgba[i+1]*.77;straight[i+2]=rgba[i+2]*.73;straight[i+3]=a;
  for(let c=0;c<3;c++)premultiplied[i+c]=straight[i+c]*straight[i+3]/255;
  premultiplied[i+3]=straight[i+3];
 }
 return {straight,premultiplied};
}
export function renderRedrawnRibbonInk(ink:ReturnType<typeof prepareRibbonInk>,out:Uint8ClampedArray,time:number){
 const p=redrawnRibbonPatch,w=p.width*p.resolution,h=p.height*p.resolution;
 out.set(ink.straight);if(time<=0||time>=redrawnRibbonDuration)return;
 for(let x=0;x<w;x++){
  if(p.left+x/p.resolution>ribbonSpritePlacement.left+ribbonSpritePlacement.width+2)continue;
  const d=redrawnRibbonDisplacement(p.left+x/p.resolution,time);if(!d.x&&!d.y)continue;
  const first=Math.max(0,Math.floor((ribbonSpritePlacement.top-p.top-10)*p.resolution)),last=Math.min(h,Math.ceil((ribbonSpritePlacement.top+ribbonSpritePlacement.height-p.top+10)*p.resolution));
  for(let y=first;y<last;y++){
   const i=(y*w+x)*4,sx=x-d.x*p.resolution,sy=y-d.y*p.resolution;
   if(sx<0||sy<0||sx>w-1||sy>h-1){out.fill(0,i,i+4);continue;}
   const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
   const a=(iy*w+ix)*4,b=(iy*w+Math.min(w-1,ix+1))*4,c=(Math.min(h-1,iy+1)*w+ix)*4,dg=(Math.min(h-1,iy+1)*w+Math.min(w-1,ix+1))*4;
   const wa=(1-fx)*(1-fy),wb=fx*(1-fy),wc=(1-fx)*fy,wd=fx*fy,s=ink.premultiplied;
   const alpha=s[a+3]*wa+s[b+3]*wb+s[c+3]*wc+s[dg+3]*wd;out[i+3]=alpha;
   for(let channel=0;channel<3;channel++)out[i+channel]=alpha>1e-5?(s[a+channel]*wa+s[b+channel]*wb+s[c+channel]*wc+s[dg+channel]*wd)*255/alpha:0;
  }
 }
}
