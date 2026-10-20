import {luoshenFigureDuration,luoshenFigurePatch} from './luoshenFigureMotion.ts';
export const figureAtlas={
 body:{x:100,y:10,width:680,height:805},
 head:{x:800,y:60,width:340,height:600},
 arm:{x:0,y:815,width:562,height:439},
 ribbons:{x:562,y:860,width:692,height:394},
};
export type FigurePart=keyof typeof figureAtlas;
export const figureFoot={x:768,y:700};
export const figureRig={
 body:{joint:figureFoot,pivot:{x:250,y:790},sx:.30,sy:.34},
 head:{joint:{x:765,y:448.4},pivot:{x:120,y:546},sx:.17,sy:.17},
 arm:{joint:{x:756,y:493},pivot:{x:110,y:285},sx:.22,sy:.22},
 ribbons:{joint:{x:798,y:535},pivot:{x:38,y:200},sx:.24,sy:.24},
};
const rad=Math.PI/180;
export function figurePartsPose(time:number){
 if(time<=0||time>=luoshenFigureDuration)return {body:0,head:0,arm:0,ribbons:0,tip:0};
 const t=time/1000,e=Math.sin(Math.PI*time/luoshenFigureDuration)**2;
 return {body:1.2*e*Math.sin(t*1.8),head:-3.5*e*Math.sin(t*1.8-.3),arm:5.5*e*Math.sin(t*1.8-.7),ribbons:3.8*e*Math.sin(t*2.2-1.2),tip:.018*e*Math.sin(t*2.2-1.5)};
}
/** Rigid head/hand transforms preserve facial proportions and the round held object. */
export function figurePartPoint(part:FigurePart,x:number,y:number,time:number){
 const rig=figureRig[part],pose=figurePartsPose(time),angle=(part==='body'?0:pose[part])*rad;
 const dx=(x-rig.pivot.x)*rig.sx,dy=(y-rig.pivot.y)*rig.sy+(part==='ribbons'?dx*pose.tip:0);
 const px=rig.joint.x-figureFoot.x+dx*Math.cos(angle)-dy*Math.sin(angle),py=rig.joint.y-figureFoot.y+dx*Math.sin(angle)+dy*Math.cos(angle),body=pose.body*rad;
 return {x:figureFoot.x+px*Math.cos(body)-py*Math.sin(body),y:figureFoot.y+px*Math.sin(body)+py*Math.cos(body)};
}
export function drawFigureParts(ctx:CanvasRenderingContext2D,parts:Record<FigurePart,CanvasImageSource>,time:number){
 const patch=luoshenFigurePatch,pose=figurePartsPose(time);
 ctx.clearRect(0,0,patch.width*patch.resolution,patch.height*patch.resolution);
 ctx.save();ctx.scale(patch.resolution,patch.resolution);ctx.translate(figureFoot.x-patch.left,figureFoot.y-patch.top);ctx.rotate(pose.body*rad);
 const draw=(part:FigurePart)=>{
  const rig=figureRig[part];ctx.save();ctx.translate(rig.joint.x-figureFoot.x,rig.joint.y-figureFoot.y);
  if(part!=='body')ctx.rotate(pose[part]*rad);
  if(part==='ribbons')ctx.transform(1,pose.tip,0,1,0,0);
  ctx.scale(rig.sx,rig.sy);ctx.translate(-rig.pivot.x,-rig.pivot.y);ctx.drawImage(parts[part],0,0);ctx.restore();
 };
 // Opaque collar and sleeve overlaps hide attachment ends before one group blend.
 draw('ribbons');draw('head');draw('body');draw('arm');ctx.restore();
}
/** Grade once, then soften the premultiplied contour without light/dark fringes. */
export function gradeFigurePart(data:Uint8ClampedArray,width:number,height:number,part:FigurePart){
 const radius=Math.max(1,Math.round(.35/figureRig[part].sx)),div=radius*2+1;
 const s=new Float32Array(data.length),horizontal=new Float32Array(data.length),out=new Float32Array(data.length);
 for(let i=0;i<data.length;i+=4){const a=data[i+3]/255;s[i]=(data[i]*.70+33)*a;s[i+1]=(data[i+1]*.70+23)*a;s[i+2]=(data[i+2]*.68+16)*a;s[i+3]=data[i+3];}
 for(let y=0;y<height;y++)for(let c=0;c<4;c++){
  let sum=0;for(let x=0;x<=radius&&x<width;x++)sum+=s[(y*width+x)*4+c];
  for(let x=0;x<width;x++){horizontal[(y*width+x)*4+c]=sum/div;if(x-radius>=0)sum-=s[(y*width+x-radius)*4+c];if(x+radius+1<width)sum+=s[(y*width+x+radius+1)*4+c];}
 }
 for(let x=0;x<width;x++)for(let c=0;c<4;c++){
  let sum=0;for(let y=0;y<=radius&&y<height;y++)sum+=horizontal[(y*width+x)*4+c];
  for(let y=0;y<height;y++){out[(y*width+x)*4+c]=sum/div;if(y-radius>=0)sum-=horizontal[((y-radius)*width+x)*4+c];if(y+radius+1<height)sum+=horizontal[((y+radius+1)*width+x)*4+c];}
 }
 for(let i=0;i<data.length;i+=4){const a=out[i+3];data[i+3]=a;for(let c=0;c<3;c++)data[i+c]=a?out[i+c]*255/a:0;}
}
