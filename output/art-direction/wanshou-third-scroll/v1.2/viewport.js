/* Keep the camera and map in original source coordinates. Display clipping
   excludes photograph borders without recutting artwork or moving hotspots. */
const KangquViewport=(()=>{
 const limit=(value,low,high)=>Math.min(high,Math.max(low,value));
 function coverScale(bounds,frame,gutter=1){return Math.max((frame[0]+gutter*2)/(bounds[2]-bounds[0]),(frame[1]+gutter*2)/(bounds[3]-bounds[1]));}
 function maxScale(bounds,frame,config){return Math.max(1,coverScale(bounds,frame,config.gutter)*config.initialZoomRatio);}
 function constrain(view,bounds,frame,config){
  const min=coverScale(bounds,frame,config.gutter),max=maxScale(bounds,frame,config),scale=limit(view.scale,min,max),g=config.gutter;
  return {scale,x:limit(view.x,frame[0]+g-bounds[2]*scale,-g-bounds[0]*scale),y:limit(view.y,frame[1]+g-bounds[3]*scale,-g-bounds[1]*scale)};
 }
 function mapWindow(view,bounds,frame){
  const width=bounds[2]-bounds[0],height=bounds[3]-bounds[1];
  return {left:limit((-view.x/view.scale-bounds[0])/width,0,1),top:limit((-view.y/view.scale-bounds[1])/height,0,1),width:limit(frame[0]/view.scale/width,0,1),height:limit(frame[1]/view.scale/height,0,1)};
 }
 function mapPoint(point,rect,bounds){return [bounds[0]+limit((point[0]-rect.left)/rect.width,0,1)*(bounds[2]-bounds[0]),bounds[1]+limit((point[1]-rect.top)/rect.height,0,1)*(bounds[3]-bounds[1])];}
 return {coverScale,maxScale,constrain,mapWindow,mapPoint};
})();
