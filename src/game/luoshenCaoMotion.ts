export const caoDuration=3400;
export const caoPatch={tile:4,left:420,top:430,width:260,height:440,resolution:1.5};
export const caoAtlas={body:{x:0,y:0,width:1024,height:1536},head:{x:0,y:0,width:1024,height:1536},arm:{x:0,y:0,width:1024,height:1536}};
export type CaoPart=keyof typeof caoAtlas;
const origin={x:18,y:55},scale=.24;
const rig=(x:number,y:number)=>({joint:{x:origin.x+x*scale,y:origin.y+y*scale},pivot:{x,y},sx:scale,sy:scale});
export const caoRig={body:rig(0,0),head:rig(530,350),arm:rig(415,605)};
const smooth=(v:number)=>{const x=Math.min(1,Math.max(0,v));return x*x*(3-2*x);};
const pulse=(t:number,start:number,end:number)=>t<=start||t>=end?0:Math.sin(Math.PI*(t-start)/(end-start))**2;
export const caoOpacity=(t:number)=>smooth(t/220)*smooth((caoDuration-t)/260);
export function caoPose(t:number){if(t<=0||t>=caoDuration)return {body:0,head:0,arm:0};return {body:0,head:-3.4*pulse(t,200,3000),arm:3.2*pulse(t,500,3200)};}
export function caoPartPoint(part:CaoPart,x:number,y:number,t:number){const r=caoRig[part],a=caoPose(t)[part]*Math.PI/180,dx=(x-r.pivot.x)*r.sx,dy=(y-r.pivot.y)*r.sy;return {x:r.joint.x+dx*Math.cos(a)-dy*Math.sin(a),y:r.joint.y+dx*Math.sin(a)+dy*Math.cos(a)};}
function inside(poly:readonly number[][],x:number,y:number){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [ax,ay]=poly[j],[bx,by]=poly[i];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)hit=!hit;}return hit;}
// Only the principal red-robed figure is repairable; every surrounding source pixel stays static.
export const oldCao=[[120,48],[164,46],[178,75],[174,101],[177,130],[187,149],[204,160],[226,181],[231,211],[209,229],[212,256],[203,282],[203,333],[196,359],[209,402],[195,418],[164,415],[153,401],[121,413],[91,409],[85,392],[105,376],[107,345],[77,348],[53,337],[48,319],[58,292],[78,268],[85,225],[91,201],[76,205],[68,197],[74,183],[93,178],[108,164],[118,149],[119,133],[115,115],[120,95]];
// Original visible cap/face footprint; the lower background costume may be occluded by the animated foreground robe.
const attendant=[[196,43],[225,45],[235,93],[242,123],[258,137],[260,440],[207,440],[203,360],[212,308],[219,279],[209,246],[208,220],[218,207],[216,185],[205,174],[195,168],[195,151],[188,135],[187,119],[193,108]];
function edgeDistance(poly:readonly number[][],x:number,y:number){let d=Infinity;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [ax,ay]=poly[j],[bx,by]=poly[i],u=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2)));d=Math.min(d,Math.hypot(x-ax-u*(bx-ax),y-ay-u*(by-ay)));}return d;}
// Original attendants are behind Cao Zhi. Their cap/face stay protected; the new robe may overlap their lower robe naturally.
export function caoStatic(x:number,y:number){return x<8||y<8||x>=238||y>431||y<172&&inside(attendant,x,y)||!inside(oldCao,x,y)&&edgeDistance(oldCao,x,y)>35;}
const headRegion=[[0,0],[1024,0],[1024,340],[645,338],[592,294],[500,400],[492,335],[440,355],[0,355]];
const armRegion=[[0,520],[325,520],[400,550],[432,610],[403,650],[393,820],[380,995],[320,1090],[180,1130],[0,1130]];
/** All layers use the same master and scale. The stationary collar hides the neck joint; shoulder overlap hides the sleeve joint. */
export function caoPartOpacity(part:CaoPart,x:number,y:number){const head=inside(headRegion,x,y),arm=inside(armRegion,x,y);if(part==='head')return head?1:0;if(part==='arm')return arm?1:0;return head&&edgeDistance(headRegion,x,y)>18||arm&&Math.hypot(x-415,y-605)>44?0:1;}
export function prepareCaoPart(part:CaoPart,data:Uint8ClampedArray,width:number,height:number){for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;if(!data[i+3])continue;data[i+3]*=caoPartOpacity(part,x,y);const grey=data[i]*.32+data[i+1]*.54+data[i+2]*.14;data[i]=data[i]*.75+(grey+10)*.25;data[i+1]=data[i+1]*.75+(grey+3)*.25;data[i+2]=data[i+2]*.75+(grey-5)*.25;}}
export function caoProtectedPixels(width:number,height:number){const p=caoPatch,indices:number[]=[];for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(caoStatic(x/width*p.width,y/height*p.height))indices.push((y*width+x)*4);return indices;}
export function prepareCaoSilk(source:Uint8ClampedArray,plate:Uint8ClampedArray){const p=caoPatch,out=new Uint8ClampedArray(source),offset=[0,0,0];let count=0;
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++)if(x<6||y<6||x>=p.width-6||y>=p.height-6){const i=(y*p.width+x)*4;for(let k=0;k<3;k++)offset[k]+=source[i+k]-plate[i+k];count++;}
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){if(!inside(oldCao,x,y)||y<172&&inside(attendant,x,y))continue;let d=Infinity;for(let i=0,j=oldCao.length-1;i<oldCao.length;j=i++){const [ax,ay]=oldCao[j],[bx,by]=oldCao[i],u=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2)));d=Math.min(d,Math.hypot(x-ax-u*(bx-ax),y-ay-u*(by-ay)));}const a=smooth(d/3),i=(y*p.width+x)*4;for(let k=0;k<3;k++)out[i+k]=source[i+k]*(1-a)+(plate[i+k]+offset[k]/count)*a;}
 return out;
}
export function drawCaoParts(ctx:CanvasRenderingContext2D,parts:Record<CaoPart,CanvasImageSource>,time:number){const p=caoPatch,pose=caoPose(time);ctx.clearRect(0,0,p.width*p.resolution,p.height*p.resolution);ctx.save();ctx.scale(p.resolution,p.resolution);for(const part of ['head','arm','body'] as CaoPart[]){const r=caoRig[part];ctx.save();ctx.translate(r.joint.x,r.joint.y);ctx.rotate(pose[part]*Math.PI/180);ctx.scale(r.sx,r.sy);ctx.translate(-r.pivot.x,-r.pivot.y);ctx.drawImage(parts[part],0,0);ctx.restore();}ctx.restore();}
