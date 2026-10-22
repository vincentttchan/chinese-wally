import {drawSleeveStudy,type SleeveKind} from './luoshenSleeveMotion.ts';
export const openingSleevePatch={left:17620,top:320,width:620,height:560},openingSleeveDuration=3200;
export const openingCaoActor={id:'opening-cao-art',name:'曹植展袖',kind:'observation' as const,x:17840/19950,y:587/943,width:300/19950,height:430/943};
export const openingSleevePairActor={...openingCaoActor,id:'opening-sleeve-pair',name:'曹植與同行者衣袖對照',x:17865/19950,width:360/19950};
const caoOutline=[[209,62],[239,57],[257,70],[254,103],[250,121],[254,155],[248,183],[277,209],[301,231],[327,247],[358,249],[358,282],[344,329],[333,376],[306,435],[306,466],[277,484],[221,480],[194,474],[155,468],[144,442],[140,405],[136,354],[121,325],[112,285],[107,242],[93,228],[100,219],[111,224],[145,218],[176,204],[198,183],[196,153],[200,120],[207,103],[207,78]];
const companionOutline=[[345,101],[369,101],[376,142],[374,156],[379,185],[387,201],[399,234],[398,272],[403,326],[405,395],[416,470],[384,481],[354,476],[337,458],[327,426],[314,395],[314,342],[320,294],[324,253],[324,221],[337,200],[340,181],[334,160],[336,140],[342,135]];
const inside=(outline:number[][],x:number,y:number)=>{let hit=false;for(let i=0,j=outline.length-1;i<outline.length;j=i++){const a=outline[i],b=outline[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
export const openingCompanionActor={...openingCaoActor,id:'opening-companion-art',name:'同行者收袖',x:17975/19950,y:610/943,width:145/19950,height:400/943};
export function openingSleeveFiles(kind:SleeveKind){return ['art/luoshen/detail-8.jpg','art/luoshen/detail-9.jpg',kind==='cao'?'art/animations/luoshen-opening-sleeves/repair-plate-v2.png':'art/animations/luoshen-opening-sleeves/companion-repair-plate-v1.png',`art/luoshen/elements/sleeves-${kind}-v2.png`];}
export const openingSleeveOpacity=(age:number)=>Math.max(0,Math.min(1,age/250,(openingSleeveDuration-age)/280));
/** Reuse the existing complete Cao cutout and its motion. No original head/body is spliced into it. */
export function prepareOpeningSleeve(images:readonly CanvasImageSource[],factory:(w:number,h:number)=>HTMLCanvasElement,kind:SleeveKind='cao'){
 const outline=kind==='cao'?caoOutline:companionOutline;
 const foreground=(x:number,y:number)=>kind==='companion'&&(inside(caoOutline,x,y)||x>=390&&y<=205);
 const p=openingSleevePatch,make=(w=p.width,h=p.height)=>{const canvas=factory(w,h),ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Canvas unavailable');return {canvas,ctx};};
 const original=make(),base=make(),plate=make(),ink=make(1024,1536),motion=make(1024,1536);
 original.ctx.drawImage(images[0],0,0,1995,943,8*1995-p.left,-p.top,1995,943);original.ctx.drawImage(images[1],0,0,1995,943,9*1995-p.left,-p.top,1995,943);base.ctx.drawImage(original.canvas,0,0);plate.ctx.drawImage(images[2],0,0,p.width,p.height);
 const originalPixels=original.ctx.getImageData(0,0,p.width,p.height).data;
 const source=base.ctx.getImageData(0,0,p.width,p.height),repair=plate.ctx.getImageData(0,0,p.width,p.height).data;
 // Match the already-existing plate locally; feather only the old character silhouette.
 const mask=new Uint8Array(p.width*p.height),protectedPixels:number[]=[],offset=[0,0,0];let samples=0;
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){const protectedPixel=foreground(x,y);if(protectedPixel)protectedPixels.push((y*p.width+x)*4);mask[y*p.width+x]=inside(outline,x,y)&&!protectedPixel?1:0;}
 for(let y=5;y<p.height-5;y+=2)for(let x=5;x<p.width-5;x+=2){const i=y*p.width+x;if(mask[i]||![[-4,0],[4,0],[0,-4],[0,4]].some(([dx,dy])=>mask[i+dy*p.width+dx]))continue;for(let c=0;c<3;c++)offset[c]+=source.data[i*4+c]-repair[i*4+c];samples++;}
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){const i=y*p.width+x;if(!mask[i])continue;let edge=1;for(let d=1;d<=3;d++)if(x<d||y<d||x>=p.width-d||y>=p.height-d||!mask[i-d]||!mask[i+d]||!mask[i-d*p.width]||!mask[i+d*p.width]){edge=Math.min(edge,d/4);break;}for(let c=0;c<3;c++)source.data[i*4+c]=source.data[i*4+c]*(1-edge)+(repair[i*4+c]+offset[c]/Math.max(1,samples))*edge;}
 base.ctx.putImageData(source,0,0);
 ink.ctx.drawImage(images[3],0,0,1024,1536);const art=ink.ctx.getImageData(0,0,1024,1536);
 // Preserve the approved figure RGB; reject only the generated transparent fringe.
 for(let i=3;i<art.data.length;i+=4)art.data[i]=Math.max(0,Math.min(255,(art.data[i]-160)*255/95));ink.ctx.putImageData(art,0,0);
 return {draw(ctx:CanvasRenderingContext2D,age:number){ctx.clearRect(0,0,p.width,p.height);ctx.drawImage(base.canvas,0,0);drawSleeveStudy(motion.ctx,ink.canvas,kind,Math.max(0,Math.min(2400,age-300)));if(kind==='cao')ctx.drawImage(motion.canvas,85,58,1024*.28,1536*.28);else{ctx.drawImage(motion.canvas,235,110,1024*.24,1536*.24);ctx.save();ctx.beginPath();ctx.moveTo(235,110);ctx.lineTo(481,110);ctx.lineTo(481,230);ctx.lineTo(235,230);ctx.closePath();ctx.clip();ctx.clearRect(235,110,246,120);ctx.drawImage(base.canvas,0,0);ctx.drawImage(ink.canvas,235,110,1024*.24,1536*.24);ctx.restore();const frame=ctx.getImageData(0,0,p.width,p.height);for(const i of protectedPixels)for(let c=0;c<4;c++)frame.data[i+c]=originalPixels[i+c];ctx.putImageData(frame,0,0);}}};
}
