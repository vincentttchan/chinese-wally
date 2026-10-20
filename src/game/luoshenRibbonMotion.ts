/** A short interpretation using only the native painting pixels. */
export const luoshenRibbonDuration=4600;
export const luoshenRibbonPatch={left:840,top:470,width:154,height:98};
export const luoshenRibbonAnchor={x:846,y:539};
function influence(x:number,y:number){
 if(x<=855||x>=980||y<=474||y>=564)return {weight:0,phase:0};
 const u=Math.min(1,(x-855)/95),centre=544-.48*(x-855),distance=Math.abs(y-centre)/18;
 if(distance>=1)return {weight:0,phase:0};
 const fade=(x-958)/22,tipFade=x>958?1-fade*fade*(3-2*fade):1;
 const edge=Math.min(1,(y-474)/10,(564-y)/10),edgeWeight=edge*edge*(3-2*edge);
 return {weight:u*u*(1-distance*distance)**2*tipFade*edgeWeight,phase:u*.7};
}
function coefficients(time:number){
 const t=Math.max(0,Math.min(luoshenRibbonDuration,time)),envelope=Math.sin(Math.PI*t/luoshenRibbonDuration)**2;
 return {a:3.2*envelope*(.7*Math.sin(t*Math.PI*2/2100)+.3*Math.sin(t*Math.PI*2/3100)),b:3.2*envelope*(.7*Math.cos(t*Math.PI*2/2100)+.3*Math.cos(t*Math.PI*2/3100))};
}
export function luoshenRibbonDisplacement(x:number,y:number,time:number){
 const {weight,phase}=influence(x,y);if(!weight||time<=0||time>=luoshenRibbonDuration)return {x:0,y:0};
 const {a,b}=coefficients(time),dy=weight*(a*Math.cos(phase)-b*Math.sin(phase));
 return {x:-.2*dy,y:dy};
}
const {width:pw,height:ph,left:pl,top:pt}=luoshenRibbonPatch;
const field=new Float32Array(pw*ph*2);
for(let y=0;y<ph;y++)for(let x=0;x<pw;x++){const {weight,phase}=influence(pl+x,pt+y),i=(y*pw+x)*2;field[i]=weight*Math.cos(phase);field[i+1]=weight*Math.sin(phase);}
/** Continuous inverse sampling: the connection, sleeve and original patch edge stay still. */
export function renderLuoshenRibbonFrame(source:Uint8ClampedArray,out:Uint8ClampedArray,time:number){
 out.set(source);if(time<=0||time>=luoshenRibbonDuration)return;
 const {a,b}=coefficients(time);
 for(let y=0;y<ph;y++)for(let x=0;x<pw;x++){
  const f=(y*pw+x)*2,dy=field[f]*a-field[f+1]*b;if(!dy)continue;const dx=-.2*dy,i=(y*pw+x)*4;
  const sx=Math.max(0,Math.min(pw-1,x-dx)),sy=Math.max(0,Math.min(ph-1,y-dy)),ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
  const p=(iy*pw+ix)*4,right=(iy*pw+Math.min(pw-1,ix+1))*4,below=(Math.min(ph-1,iy+1)*pw+ix)*4,diagonal=(Math.min(ph-1,iy+1)*pw+Math.min(pw-1,ix+1))*4;
  for(let c=0;c<4;c++)out[i+c]=(source[p+c]*(1-fx)+source[right+c]*fx)*(1-fy)+(source[below+c]*(1-fx)+source[diagonal+c]*fx)*fy;
 }
}
