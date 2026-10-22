import {isCloudCarCloth,drawCloudCarCloth,isCloudCarCart,cloudCarFixedCart} from './luoshenCloudCarCloth.ts';
import {cloudCarPatch as p,cloudCarWeights,cloudCarPhase,cloudCarFixedHeads} from './luoshenCloudCarMotion.ts';
// Original canopy, occupants and seat silhouettes, not a rectangular patch.
const outlines=[[[226,64],[276,61],[311,107],[278,118],[269,148],[354,145],[369,190],[399,229],[341,235],[305,213],[270,222],[201,228],[160,216],[150,180],[157,148],[245,130],[248,115],[228,109]],[[148,246],[181,240],[199,320],[228,341],[243,265],[285,253],[307,333],[323,370],[386,378],[429,442],[376,487],[308,535],[245,566],[140,568],[93,527],[96,442],[42,434],[16,422],[69,372],[102,329]],[[262,0],[282,0],[300,44],[318,23],[423,0],[444,0],[426,32],[314,73],[269,52]]];
function inside(x:number,y:number,poly:number[][]){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
export function prepareCloudCar(images:readonly CanvasImageSource[],factory:(w:number,h:number)=>HTMLCanvasElement){
 const make=()=>{const canvas=factory(p.width,p.height),ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Canvas unavailable');return {canvas,ctx};};
 const base=make(),plate=make(),master=make(),animated=make(),fullInk=make(),clothInk=make(),fixed=make();
 base.ctx.drawImage(images[0],p.left,p.top,p.width,p.height,0,0,p.width,p.height);plate.ctx.drawImage(images[1],0,0,p.width,p.height);
 master.ctx.drawImage(images[2],0,0,500,560);
 const original=base.ctx.getImageData(0,0,p.width,p.height),repair=plate.ctx.getImageData(0,0,p.width,p.height).data,ink=master.ctx.getImageData(0,0,p.width,p.height).data;
 // Upper flag, parasol and pole are retained directly from the original.
 for(let y=0;y<125;y++)for(let x=0;x<p.width;x++)ink[(y*p.width+x)*4+3]=0;
 const mask=new Float32Array(p.width*p.height);
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){const i=y*p.width+x;mask[i]=y>=125&&(outlines.slice(0,2).some(poly=>inside(x,y,poly))||ink[i*4+3]>0)?1:0;}
 // Feather the union only, leaving all untouched silk byte-identical to the source.
 const blurred=new Float32Array(mask.length);for(let y=2;y<p.height-2;y++)for(let x=2;x<p.width-2;x++){let value=0;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++)value+=mask[(y+j)*p.width+x+i];blurred[y*p.width+x]=value/25;}
 for(let i=0;i<mask.length;i++){const a=blurred[i];for(let c=0;c<3;c++)original.data[i*4+c]=original.data[i*4+c]*(1-a)+repair[i*4+c]*a;}
 base.ctx.putImageData(original,0,0);
 // Tone only the generated master to the aged painting; source silk never moves.
 for(let i=0;i<ink.length;i+=4){ink[i]=ink[i]*.82+10;ink[i+1]=ink[i+1]*.82+8;ink[i+2]=ink[i+2]*.8+5;}
 const complete=fullInk.ctx.createImageData(p.width,p.height);complete.data.set(ink);fullInk.ctx.putImageData(complete,0,0);
 fixed.ctx.drawImage(base.canvas,0,0);fixed.ctx.drawImage(fullInk.canvas,0,0);
 const cloth=clothInk.ctx.createImageData(p.width,p.height);cloth.data.set(complete.data);
 for(let y=185;y<495;y++)for(let x=15;x<435;x++){const i=(y*p.width+x)*4+3;if(isCloudCarCart(x,y))cloth.data[i]=0;else if(isCloudCarCloth(x,y))ink[i]=0;}
 clothInk.ctx.putImageData(cloth,0,0);
 const weightsX=new Float32Array(p.width*p.height),weightsY=new Float32Array(p.width*p.height);
 for(let y=0;y<575;y++)for(let x=0;x<510;x++){const w=cloudCarWeights(x,y),i=y*p.width+x;weightsX[i]=w.x;weightsY[i]=w.y;}
 const frame=animated.ctx.createImageData(p.width,p.height);
 return {draw(ctx:CanvasRenderingContext2D,age:number){
  frame.data.fill(0);const phase=cloudCarPhase(age);
  for(let y=0;y<575;y++)for(let x=0;x<510;x++){const i=y*p.width+x,sx=Math.round(x-weightsX[i]*phase.x),sy=Math.round(y-weightsY[i]*phase.y);if(sx<0||sy<0||sx>=p.width||sy>=p.height)continue;const s=(sy*p.width+sx)*4,o=(y*p.width+x)*4;frame.data[o]=ink[s];frame.data[o+1]=ink[s+1];frame.data[o+2]=ink[s+2];frame.data[o+3]=ink[s+3];}
  animated.ctx.putImageData(frame,0,0);ctx.clearRect(0,0,p.width,p.height);ctx.drawImage(base.canvas,0,0);ctx.drawImage(animated.canvas,0,0);drawCloudCarCloth(ctx,clothInk.canvas,age);
  ctx.save();ctx.beginPath();cloudCarFixedCart.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.clip();ctx.drawImage(fixed.canvas,0,0);ctx.restore();
  // Face/hair are composited as rigid art, including where a canopy band crosses behind them.
  for(const b of cloudCarFixedHeads)ctx.drawImage(fixed.canvas,b.left,b.top,b.right-b.left+1,b.bottom-b.top+1,b.left,b.top,b.right-b.left+1,b.bottom-b.top+1);
 }};
}
