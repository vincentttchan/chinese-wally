import {farewellAtlas,farewellPatch,drawFarewellParts,restoreFarewellStatic} from './luoshenFarewellMotion.ts';
import {caoAtlas,caoPatch,prepareCaoPart,drawCaoParts} from './luoshenCaoMotion.ts';
import {scenePatch as p,retinueAtlas,mountAtlas,prepareScenePart,prepareSceneSilk,sceneProtectedPixels,drawSceneGroup} from './luoshenFarewellSceneMotion.ts';
import type {FarewellPart} from './luoshenFarewellMotion.ts';
import type {CaoPart} from './luoshenCaoMotion.ts';
/** Shared by the live scene and offline evidence; source silk is never warped. */
export function prepareFarewellScene(images:readonly CanvasImageSource[],factory:(w:number,h:number)=>HTMLCanvasElement){
 const make=(w:number,h:number)=>{const canvas=factory(w,h),ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Canvas unavailable');return {canvas,ctx};};
 const base=make(p.width,p.height),plate=make(p.width,p.height),ink=make(p.width,p.height);
 base.ctx.drawImage(images[0],p.left,p.top,p.width,p.height,0,0,p.width,p.height);const original=base.ctx.getImageData(0,0,p.width,p.height).data,protectedPixels=sceneProtectedPixels(p.width,p.height);
 plate.ctx.drawImage(images[1],0,0,p.width,p.height);const repaired=base.ctx.getImageData(0,0,p.width,p.height);repaired.data.set(prepareSceneSilk(original,plate.ctx.getImageData(0,0,p.width,p.height).data));base.ctx.putImageData(repaired,0,0);
 const prepare=(image:CanvasImageSource,atlas:Record<string,{x:number;y:number;width:number;height:number}>,kind:'goddess'|'cao'|'retinue'|'mount')=>{const parts:Record<string,HTMLCanvasElement>={};for(const [part,a] of Object.entries(atlas)){const tile=make(a.width,a.height);tile.ctx.drawImage(image,a.x,a.y,a.width,a.height,0,0,a.width,a.height);const d=tile.ctx.getImageData(0,0,a.width,a.height);if(kind==='cao')prepareCaoPart(part as CaoPart,d.data,a.width,a.height);else if(kind==='retinue'||kind==='mount')prepareScenePart(kind,part,d.data,a.width,a.height);for(let i=0;i<d.data.length;i+=4){d.data[i]=d.data[i]*.85+12;d.data[i+1]=d.data[i+1]*.85+9;d.data[i+2]=d.data[i+2]*.83+5;}tile.ctx.putImageData(d,0,0);parts[part]=tile.canvas;}return parts;};
 const goddess=prepare(images[2],farewellAtlas,'goddess') as Record<FarewellPart,HTMLCanvasElement>,cao=prepare(images[3],caoAtlas,'cao') as Record<CaoPart,HTMLCanvasElement>,retinue=prepare(images[4],retinueAtlas,'retinue'),mount=prepare(images[5],mountAtlas,'mount');
 const goddessInk=make(farewellPatch.width*farewellPatch.resolution,farewellPatch.height*farewellPatch.resolution),caoInk=make(caoPatch.width*caoPatch.resolution,caoPatch.height*caoPatch.resolution);
 return {draw:(ctx:CanvasRenderingContext2D,age:number)=>{
  ink.ctx.clearRect(0,0,p.width,p.height);drawSceneGroup(ink.ctx,'retinue',retinue,age);
  drawFarewellParts(goddessInk.ctx,goddess,age);ink.ctx.drawImage(goddessInk.canvas,farewellPatch.left-p.left,farewellPatch.top-p.top,farewellPatch.width,farewellPatch.height);
  drawSceneGroup(ink.ctx,'mount',mount,age);
  drawCaoParts(caoInk.ctx,cao,age);ink.ctx.drawImage(caoInk.canvas,caoPatch.left-p.left,caoPatch.top-p.top,caoPatch.width,caoPatch.height);
  ctx.clearRect(0,0,p.width,p.height);ctx.drawImage(base.canvas,0,0);ctx.globalAlpha=.94;ctx.drawImage(ink.canvas,0,0);ctx.globalAlpha=1;const frame=ctx.getImageData(0,0,p.width,p.height);restoreFarewellStatic(frame.data,original,protectedPixels);ctx.putImageData(frame,0,0);
 }};
}
