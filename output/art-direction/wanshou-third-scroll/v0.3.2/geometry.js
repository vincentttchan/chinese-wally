'use strict';
// Pure native-coordinate rules. No browser access, DOM, file URLs or UI rendering.
const KangquGeometry=(()=>{
 const inside=(p,b)=>p[0]>=b[0]&&p[0]<=b[2]&&p[1]>=b[1]&&p[1]<=b[3];
 const midpoint=b=>[(b[0]+b[2])/2,(b[1]+b[3])/2];
 function inPolygon(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
 const contains=(p,shape)=>shape.polygon?inPolygon(p,shape.polygon):inside(p,shape.box);
 const headDistance=(p,person)=>{const h=midpoint(person.head);return Math.hypot(p[0]-h[0],p[1]-h[1]);};
 function resolveExplore(p,people,objects){
  const heads=people.filter(person=>inside(p,person.head)).sort((a,b)=>headDistance(p,a)-headDistance(p,b));
  if(heads.length)return {kind:'person',id:heads[0].id};
  const front=objects.find(o=>!o.backdrop&&contains(p,o));if(front)return {kind:'object',id:front.id};
  const bodies=people.filter(person=>contains(p,person)).sort((a,b)=>headDistance(p,a)-headDistance(p,b));
  if(bodies.length)return {kind:'person',id:bodies[0].id};
  const back=objects.find(o=>o.backdrop&&contains(p,o));return back?{kind:'object',id:back.id}:null;
 }
 function observationContains(p,point){return contains(p,point)&&!(point.exclusions||[]).some(box=>inside(p,box));}
 const centerOfView=(view,size)=>[(size[0]/2-view.x)/view.scale,(size[1]/2-view.y)/view.scale];
 function restoreView(view,oldSize,newSize){const p=centerOfView(view,oldSize);return {scale:view.scale,x:newSize[0]/2-p[0]*view.scale,y:newSize[1]/2-p[1]*view.scale};}
 function overlaps(a,b){return a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];}
 function speechSafe(rect,people){return !people.some(p=>overlaps(rect,p.head));}
 function speechPlacement({anchor,safeBottom,view,viewport,frame,protectedBoxes}){
  const project=p=>[p[0]*view.scale+view.x,p[1]*view.scale+view.y],a=project(anchor),[width,height]=frame,[vw,vh]=viewport;
  if(a[0]<12||a[0]>vw-12||a[1]<12||a[1]>vh-12)return null;
  const bands=[{bottom:project([anchor[0],safeBottom])[1],pointer:'down'},... [60,90].map(offset=>({bottom:project([anchor[0],anchor[1]+offset])[1]+height,pointer:'up'}))];
  for(const band of bands)for(const fraction of [.4,.9,.1,-.25,1.25]){
   const left=Math.max(16,Math.min(vw-width-16,a[0]-width*fraction)),top=band.bottom-height;
   if(width>vw-32||top<12||band.bottom>vh-12)continue;
   const rect=[(left-view.x)/view.scale,(top-view.y)/view.scale,(left+width-view.x)/view.scale,(band.bottom-view.y)/view.scale];
   const pad=6/view.scale,expanded=[rect[0]-pad,rect[1]-pad,rect[2]+pad,rect[3]+pad];
   if(protectedBoxes.some(box=>overlaps(expanded,box)))continue;
   return {left,top,pointer:band.pointer,pointerX:Math.max(24,Math.min(width-24,a[0]-left)),nativeRect:rect};
  }
  return null;
 }
 return {inside,midpoint,inPolygon,contains,resolveExplore,observationContains,centerOfView,restoreView,speechSafe,speechPlacement};
})();
