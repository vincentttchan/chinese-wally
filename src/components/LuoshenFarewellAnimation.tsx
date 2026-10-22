import {useEffect,useRef} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import {assetPath} from '../game/assets.ts';
import {luoshenFacePoints} from '../game/luoshenHit.ts';
import {luoshenSize} from '../game/luoshen.ts';
import {farewellAtlas,farewellPatch,farewellDuration,farewellOpacity,prepareFarewellSilk,farewellProtectedPixels,restoreFarewellStatic,drawFarewellParts} from '../game/luoshenFarewellMotion.ts';
import type {FarewellPart} from '../game/luoshenFarewellMotion.ts';
import {caoAtlas,caoPatch,caoDuration,caoOpacity,prepareCaoSilk,caoProtectedPixels,drawCaoParts,prepareCaoPart} from '../game/luoshenCaoMotion.ts';
import type {CaoPart} from '../game/luoshenCaoMotion.ts';
import type {FarewellPairClock,FarewellFigure} from '../game/luoshenFarewellPairClock.ts';
export function LuoshenFarewellAnimation({figure='goddess',clock,viewport,onDone,onError,onOriginal}:{figure?:FarewellFigure;clock?:FarewellPairClock;viewport:SceneViewport;onDone:()=>void;onError:()=>void;onOriginal:()=>void}){
 const isCao=figure==='cao',p=isCao?caoPatch:farewellPatch,name=isCao?'曹植':'神女';
 const canvas=useRef<HTMLCanvasElement>(null),world=useRef<HTMLDivElement>(null),done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
 useEffect(()=>{
  let live=true,raf=0,started:number|null=null,loaded=0,last=-Infinity,timer=0;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){done.current();return;}
  const images=[new Image(),new Image(),new Image()];
  const fail=()=>{if(!live)return;live=false;clearTimeout(timer);cancelAnimationFrame(raf);if(world.current)world.current.style.opacity='0';error.current();};
  const make=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const ready=()=>{
   if(!live||++loaded!==3)return;clearTimeout(timer);
   try{
    const width=Math.round(p.width*p.resolution),height=Math.round(p.height*p.resolution),ctx=canvas.current?.getContext('2d',{willReadFrequently:true}),base=make(p.width,p.height),b=base.getContext('2d',{willReadFrequently:true}),plate=make(p.width,p.height),pc=plate.getContext('2d',{willReadFrequently:true}),original=make(width,height),o=original.getContext('2d',{willReadFrequently:true}),ink=make(width,height),ic=ink.getContext('2d');
    if(!ctx||!b||!pc||!o||!ic){fail();return;}
    b.drawImage(images[0],p.left,p.top,p.width,p.height,0,0,p.width,p.height);o.drawImage(base,0,0,width,height);const originalPixels=o.getImageData(0,0,width,height).data,protectedPixels=(isCao?caoProtectedPixels:farewellProtectedPixels)(width,height);
    pc.drawImage(images[2],0,0,p.width,p.height);const pixels=b.getImageData(0,0,p.width,p.height);pixels.data.set((isCao?prepareCaoSilk:prepareFarewellSilk)(pixels.data,pc.getImageData(0,0,p.width,p.height).data));b.putImageData(pixels,0,0);
    const parts:Record<string,HTMLCanvasElement>={};
    for(const [part,c] of Object.entries(isCao?caoAtlas:farewellAtlas)){const tile=make(c.width,c.height),tc=tile.getContext('2d',{willReadFrequently:true});if(!tc){fail();return;}tc.drawImage(images[1],c.x,c.y,c.width,c.height,0,0,c.width,c.height);const d=tc.getImageData(0,0,c.width,c.height);if(isCao)prepareCaoPart(part as CaoPart,d.data,c.width,c.height);for(let i=0;i<d.data.length;i+=4){d.data[i]=d.data[i]*.85+12;d.data[i+1]=d.data[i+1]*.85+9;d.data[i+2]=d.data[i+2]*.83+5;}tc.putImageData(d,0,0);parts[part]=tile;}
    const draw=(age:number)=>{if(isCao)drawCaoParts(ic,parts as Record<CaoPart,HTMLCanvasElement>,age);else drawFarewellParts(ic,parts as Record<FarewellPart,HTMLCanvasElement>,age);ctx.clearRect(0,0,width,height);ctx.drawImage(base,0,0,width,height);ctx.globalAlpha=.94;ctx.drawImage(ink,0,0);ctx.globalAlpha=1;const frame=ctx.getImageData(0,0,width,height);restoreFarewellStatic(frame.data,originalPixels,protectedPixels);ctx.putImageData(frame,0,0);if(world.current)world.current.style.opacity=String((isCao?caoOpacity:farewellOpacity)(age));};
    draw(0);clock?.ready(figure);const tick=(now:number)=>{if(!live)return;started??=now;const elapsed=clock?clock.elapsed(now):now-started;if(elapsed===null){raf=requestAnimationFrame(tick);return;}const age=Math.min(isCao?caoDuration:farewellDuration,elapsed);try{if(now-last>=1000/30||age>=(isCao?caoDuration:farewellDuration)){draw(age);last=now;}}catch{fail();return;}if(age>=(isCao?caoDuration:farewellDuration)){live=false;done.current();return;}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
   }catch{fail();}
  };
  timer=window.setTimeout(fail,8000);for(const image of images){image.onload=ready;image.onerror=fail;}images[0].src=assetPath('art/luoshen/detail-4.jpg');images[1].src=assetPath(isCao?'art/animations/luoshen-cao/figure-master-v2.png':'art/animations/luoshen-farewell/figure-parts-v1.png');images[2].src=assetPath(isCao?'art/animations/luoshen-cao/silk-plate-v3.png':'art/animations/luoshen-farewell/silk-plate-v1.png');
  return()=>{live=false;clearTimeout(timer);cancelAnimationFrame(raf);for(const image of images){image.onload=null;image.onerror=null;}};
 },[figure,clock]);
 const f=luoshenFacePoints[isCao?'C3':'L8'];
 return <div className="luoshen-farewell-animation" data-figure={figure} role="status" aria-label={`兩岸${name}原位演繹正在播放`}>
  <div ref={world} className="luoshen-farewell-world" style={{width:luoshenSize.width,height:luoshenSize.height,transform:`translate(${viewport.view.x}px,${viewport.view.y}px) scale(${viewport.view.scale})`,opacity:0}}><canvas ref={canvas} width={Math.round(p.width*p.resolution)} height={Math.round(p.height*p.resolution)} style={{left:p.tile*1995+p.left,top:p.top,width:p.width,height:p.height}} aria-hidden="true"/></div>
  <button className="luoshen-farewell-return-hit" style={{left:viewport.view.x+f.x*viewport.view.scale,top:viewport.view.y+f.y*viewport.view.scale}} aria-label={`點${name}，返回原畫`} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onOriginal();}}/>
 </div>;
}

export {LuoshenFarewellSceneAnimation as LuoshenFarewellPairAnimation} from './LuoshenFarewellSceneAnimation.tsx';
