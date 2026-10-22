/** Continuous, local deformation of original pixels. No replacement drawings. */
export const ensemblePhraseDuration=2800;
const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
function envelope(t:number,keys:readonly (readonly [number,number])[]){
 for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){
  const [a,av]=keys[i-1],[b,bv]=keys[i];return av+(bv-av)*ease((t-a)/(b-a));
 }
 return keys[keys.length-1][1];
}
export function ensembleMotion(time:number){
 return {
  // One preparation and strike, followed only by a small rebound.
  lead:envelope(time,[[0,0],[250,0],[850,1],[1060,-.12],[1260,.16],[1670,0],[2800,0]]),
  follow:envelope(time,[[0,0],[440,0],[900,1],[1170,-.1],[1360,.12],[1720,0],[2800,0]]),
  cymbals:envelope(time,[[0,0],[870,0],[1290,1],[1460,.88],[2280,0],[2800,0]]),
 };
}
type Pin=readonly [number,number];
const faces:readonly (readonly Pin[])[]=[[[65,30],[91,26],[102,42],[100,66],[90,75],[73,72],[64,57]],[[60,91],[85,83],[98,95],[98,122],[86,135],[71,134],[62,120]]];
function faceGuard(x:number,y:number){
 let nearest=Infinity;
 for(const polygon of faces){
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
   const [ax,ay]=polygon[j],[bx,by]=polygon[i];
   if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
   const length=(bx-ax)**2+(by-ay)**2;
   const p=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(y-ay)*(by-ay))/length));
   nearest=Math.min(nearest,Math.hypot(x-ax-p*(bx-ax),y-ay-p*(by-ay)));
  }
  if(inside)return 0;
 }
 return ease(nearest/4);
}
function influence(x:number,y:number,cx:number,cy:number,rx:number,ry:number){
 const r=((x-cx)/rx)**2+((y-cy)/ry)**2;
 return r<1?(1-r)**2:0;
}
export function createEnsembleRenderer(context:CanvasRenderingContext2D,image:HTMLImageElement,width:number,height:number){
 context.drawImage(image,0,0,width,height);
 const original=context.getImageData(0,0,width,height),output=context.createImageData(width,height);
 const fields=new Float32Array(width*height*6),active:number[]=[];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const p=y*width+x,k=p*6,guard=faceGuard(x,y);
  // Forearms and sticks share soft fields, attached continuously to the sleeves.
  const a=influence(x,y,96,160,37,27)*guard*ease((175-y)/9);
  const b=influence(x,y,122,157,31,27)*guard*ease((174-y)/9);
  const upper=influence(x,y,47,79,30,27)*guard;
  const lower=influence(x,y,65,94,30,26)*guard;
  fields[k]=-1.4*a;fields[k+1]=-7*a;
  fields[k+2]=.6*b;fields[k+3]=-5*b;
  fields[k+4]=3*upper-2.3*lower;fields[k+5]=2.3*upper-2.2*lower;
  if(a||b||upper||lower)active.push(p);
 }
 const source=original.data,pixels=output.data;
 return (time:number)=>{
  const {lead,follow,cymbals}=ensembleMotion(time);
  pixels.set(source);
  for(const p of active){
   const k=p*6,x=p%width,y=Math.floor(p/width);
   const sx=Math.max(0,Math.min(width-1.001,x-fields[k]*lead-fields[k+2]*follow-fields[k+4]*cymbals));
   const sy=Math.max(0,Math.min(height-1.001,y-fields[k+1]*lead-fields[k+3]*follow-fields[k+5]*cymbals));
   const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
   const q=(iy*width+ix)*4;
   for(let c=0;c<3;c++)pixels[p*4+c]=
    (source[q+c]*(1-fx)+source[q+4+c]*fx)*(1-fy)+
    (source[q+width*4+c]*(1-fx)+source[q+(width+1)*4+c]*fx)*fy;
  }
  context.putImageData(output,0,0);
 };
}
