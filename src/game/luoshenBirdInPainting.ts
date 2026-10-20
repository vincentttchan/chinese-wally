import {birdShoulder,redrawnBirdDuration} from './luoshenRedrawnBird.ts';
export const inPaintingBirdPatch={left:1108,top:40,width:236,height:124,resolution:2};
export const inPaintingBirds=[{x:1193,y:97,scale:.095,delay:0,tilt:-2},{x:1276,y:123,scale:.09,delay:320,tilt:3}];
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
/** Grade opaque parts first; transparency belongs to the assembled bird, not each layer. */
export function gradeBirdInk(data:Uint8ClampedArray,width?:number,height?:number){
 for(let i=0;i<data.length;i+=4){data[i]*=.63;data[i+1]*=.62;data[i+2]*=.60;}
 if(!width||!height)return;
 // A small premultiplied blur softens contours without dark fringes or moving the silk.
 const radius=3,divisor=radius*2+1,source=new Float32Array(data.length),horizontal=new Float32Array(data.length),blurred=new Float32Array(data.length);
 for(let i=0;i<data.length;i+=4){const a=data[i+3]/255;source[i]=data[i]*a;source[i+1]=data[i+1]*a;source[i+2]=data[i+2]*a;source[i+3]=data[i+3];}
 for(let y=0;y<height;y++)for(let c=0;c<4;c++){
  let sum=0;for(let x=0;x<=radius&&x<width;x++)sum+=source[(y*width+x)*4+c];
  for(let x=0;x<width;x++){
   horizontal[(y*width+x)*4+c]=sum/divisor;
   if(x-radius>=0)sum-=source[(y*width+x-radius)*4+c];
   if(x+radius+1<width)sum+=source[(y*width+x+radius+1)*4+c];
  }
 }
 for(let x=0;x<width;x++)for(let c=0;c<4;c++){
  let sum=0;for(let y=0;y<=radius&&y<height;y++)sum+=horizontal[(y*width+x)*4+c];
  for(let y=0;y<height;y++){
   blurred[(y*width+x)*4+c]=sum/divisor;
   if(y-radius>=0)sum-=horizontal[((y-radius)*width+x)*4+c];
   if(y+radius+1<height)sum+=horizontal[((y+radius+1)*width+x)*4+c];
  }
 }
 for(let i=0;i<data.length;i+=4){const a=blurred[i+3];for(let c=0;c<3;c++)data[i+c]=a?blurred[i+c]*255/a:0;data[i+3]=a;}
}
const oldBirdShapes=[[1162,74,16,12],[1178,88,20,17],[1208,85,29,25],[1169,110,38,16],[1208,107,26,16],[1210,142,24,25],[1240,99,22,15],[1263,112,20,16],[1300,112,29,17],[1256,131,35,18],[1292,127,26,15]];
function oldBirdMask(x:number,y:number){
 let alpha=0;
 for(const [cx,cy,rx,ry] of oldBirdShapes){const q=((x-cx)/rx)**2+((y-cy)/ry)**2;alpha=Math.max(alpha,1-ease((q-.9)/.5));}
 for(const [ax,ay,bx,by] of [[1208,116,1203,142],[1203,142,1191,161],[1294,131,1286,151]]){
  const t=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2)));
  alpha=Math.max(alpha,1-ease((Math.hypot(x-ax-t*(bx-ax),y-ay-t*(by-ay))-2)/3));
 }
 return alpha;
}
/** Align the generated plate to the four surrounding silk samples. Original edge pixels are exact. */
export function prepareBirdSilk(source:Uint8ClampedArray,plate:Uint8ClampedArray){
 const {width:w,height:h}=inPaintingBirdPatch,result=new Uint8ClampedArray(source);
 const corrections=[[0,0],[w-20,0],[0,h-20],[w-20,h-20]].map(([x,y])=>[0,1,2].map(c=>{
  let delta=0;for(let yy=y;yy<y+16;yy++)for(let xx=x;xx<x+16;xx++){const p=(yy*w+xx)*4+c;delta+=source[p]-plate[p];}return delta/256;
 }));
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const alpha=ease(Math.min(x,y,w-1-x,h-1-y)/7)*oldBirdMask(x+inPaintingBirdPatch.left,y+inPaintingBirdPatch.top);if(!alpha)continue;
  const tx=x/(w-1),ty=y/(h-1),i=(y*w+x)*4;
  for(let c=0;c<3;c++){
   const offset=(corrections[0][c]*(1-tx)+corrections[1][c]*tx)*(1-ty)+(corrections[2][c]*(1-tx)+corrections[3][c]*tx)*ty;
   result[i+c]=source[i+c]*(1-alpha)+(plate[i+c]+offset)*alpha;
  }
 }
 return result;
}
/** Same picture-space coordinates as the original birds, never a separate reading page. */
export function drawBirdsInPainting(ctx:CanvasRenderingContext2D,base:CanvasImageSource,bird:HTMLCanvasElement,time:number,drawBird:(time:number,variant:number)=>void){
 const p=inPaintingBirdPatch;
 ctx.clearRect(0,0,p.width*p.resolution,p.height*p.resolution);
 ctx.save();ctx.scale(p.resolution,p.resolution);ctx.drawImage(base,0,0);
 for(const [variant,position] of inPaintingBirds.entries()){
  const t=Math.max(0,Math.min(redrawnBirdDuration,(time-position.delay)*redrawnBirdDuration/(redrawnBirdDuration-position.delay)));
  drawBird(t,variant);
  ctx.save();ctx.translate(position.x-p.left,position.y-p.top);ctx.rotate(position.tilt*Math.PI/180);ctx.scale(position.scale,position.scale);ctx.translate(-birdShoulder.x,-birdShoulder.y);
  ctx.globalAlpha=.56;ctx.drawImage(bird,0,0);ctx.restore();
 }
 ctx.restore();
}
