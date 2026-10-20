import {renderFeatherFrame,featherDisplacement} from './luoshenBirdFeathers.ts';
/** A short interpretation; the source image and the birds' resting positions remain unchanged. */
export const luoshenBirdDuration=4200;
export function luoshenBirdPose(time:number,index:number){
 const t=Math.max(0,Math.min(luoshenBirdDuration,time));
 const envelope=Math.sin(Math.PI*t/luoshenBirdDuration)**2;
 const wave=Math.sin(t*Math.PI*2/1550-index*.55);
 return {wing:wave*6*envelope,lift:-1.3*wave*envelope,tilt:wave*.8*envelope};
}

/** Native source pixels only. The deformation tapers to zero well before the patch edge. */
export const luoshenBirdPatch={left:1108,top:40,width:236,height:124};
const wings=[{root:[1194,100],centre:[1213,76],radius:[38,36]},{root:[1275,126],centre:[1303,110],radius:[40,28]}];
function influence(x:number,y:number,index:number){
 const w=wings[index],q=((x-w.centre[0])/w.radius[0])**2+((y-w.centre[1])/w.radius[1])**2;
 if(q>=1)return {x:0,y:0};
 const weight=(1-q)**3*Math.PI/180;
 return {x:-(y-w.root[1])*weight,y:(x-w.root[0])*weight};
}
export function luoshenBirdDisplacement(x:number,y:number,time:number){
 const a=influence(x,y,0),b=influence(x,y,1),pa=luoshenBirdPose(time,0).wing,pb=luoshenBirdPose(time,1).wing;
 return {x:a.x*pa+b.x*pb,y:a.y*pa+b.y*pb};
}
const {width:pw,height:ph,left:pl,top:pt}=luoshenBirdPatch;
const field=new Float32Array(pw*ph*4);
for(let y=0;y<ph;y++)for(let x=0;x<pw;x++){const a=influence(pl+x,pt+y,0),b=influence(pl+x,pt+y,1),i=(y*pw+x)*4;field.set([a.x,a.y,b.x,b.y],i);}
/** Inverse sampling keeps the silk, ink, wing and root one unbroken surface. */
export function renderLuoshenBirdFrame(source:Uint8ClampedArray,out:Uint8ClampedArray,time:number,tipOnly=false){
 if(tipOnly){renderFeatherFrame(source,out,time);return;}
 const a=luoshenBirdPose(time,0).wing,b=luoshenBirdPose(time,1).wing;
 if(Math.abs(a)+Math.abs(b)<1e-10){out.set(source);return;}
 out.set(source);
 for(let y=0;y<ph;y++)for(let x=0;x<pw;x++){
  const i=(y*pw+x)*4,dx=field[i]*a+field[i+2]*b,dy=field[i+1]*a+field[i+3]*b;
  if(!dx&&!dy)continue;
  const sx=Math.max(0,Math.min(pw-1,x-dx)),sy=Math.max(0,Math.min(ph-1,y-dy)),ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
  const p=(iy*pw+ix)*4,right=(iy*pw+Math.min(pw-1,ix+1))*4,below=(Math.min(ph-1,iy+1)*pw+ix)*4,diagonal=(Math.min(ph-1,iy+1)*pw+Math.min(pw-1,ix+1))*4;
  for(let c=0;c<4;c++)out[i+c]=(source[p+c]*(1-fx)+source[right+c]*fx)*(1-fy)+(source[below+c]*(1-fx)+source[diagonal+c]*fx)*fy;
 }
}

/** Preview feather layers: the surrounding source silk is never warped. */
export const luoshenBirdTipDisplacement=featherDisplacement;
