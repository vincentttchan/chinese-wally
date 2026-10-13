/* The map is an undistorted view of the active native painting content. It marks
   the viewport, never a target person or a collection answer. */
function drawMap(){
 const nav=$('navigator');nav.hidden=state.source!=='native';
 if(nav.hidden)return;
 const b=chapterViewport.nativeBounds,width=b[2]-b[0],height=b[3]-b[1],map=$('navigator-map'),image=$('navigator-image');
 map.style.aspectRatio=width+' / '+height;
 if(image.getAttribute('src')!==chapter.overview)image.src=chapter.overview;
 image.style.width=chapter.width/width*100+'%';image.style.height=chapter.height/height*100+'%';image.style.left=-b[0]/width*100+'%';image.style.top=-b[1]/height*100+'%';
 const window=KangquViewport.mapWindow(state.view,b,frame()),marker=$('navigator-window');
 marker.style.left=window.left*100+'%';marker.style.top=window.top*100+'%';marker.style.width=window.width*100+'%';marker.style.height=window.height*100+'%';
 const center=nativeAt([scene.clientWidth/2,scene.clientHeight/2]),horizontal=Math.round((center[0]-b[0])/width*100),vertical=Math.round((center[1]-b[1])/height*100);
 $('map-status').textContent=`觀看位置：由左至右 ${horizontal}%，由上至下 ${vertical}%。小地圖的方框代表目前畫面。`;
 map.disabled=!state.ready||state.busy;
}
function installMap(){
 const map=$('navigator-map');let grip=null;
 const sourcePoint=e=>KangquViewport.mapPoint([e.clientX,e.clientY],map.getBoundingClientRect(),chapterViewport.nativeBounds);
 const canMove=()=>state.ready&&!state.busy&&state.source==='native'&&['seek','found','free'].includes(state.mode)&&!state.menuOpen&&!state.hintOpen;
 const move=e=>{if(!grip||!canMove())return;if(Math.hypot(e.clientX-grip.start[0],e.clientY-grip.start[1])>3)grip.moved=true;const p=sourcePoint(e);centerAt([p[0]+grip.offset[0],p[1]+grip.offset[1]],state.view.scale,[.5,.5]);};
 map.addEventListener('pointerdown',e=>{
  if(e.button>0||grip||!canMove())return;e.preventDefault();map.focus({preventScroll:true});
  const p=sourcePoint(e),center=nativeAt([scene.clientWidth/2,scene.clientHeight/2]),a=nativeAt([0,0]),z=nativeAt(frame());
  grip={id:e.pointerId,start:[e.clientX,e.clientY],moved:false,offset:inside(p,[a[0],a[1],z[0],z[1]])?[center[0]-p[0],center[1]-p[1]]:[0,0]};
  map.setPointerCapture(e.pointerId);move(e);
 });
 map.addEventListener('pointermove',e=>{if(grip?.id===e.pointerId)move(e);});
 const release=(e,cancelled=false)=>{if(grip?.id!==e.pointerId)return;const tap=!cancelled&&!grip.moved;if(tap&&canMove())centerAt(sourcePoint(e),state.view.scale,[.5,.5]);if(map.hasPointerCapture(e.pointerId))map.releasePointerCapture(e.pointerId);grip=null;};
 map.addEventListener('pointerup',e=>release(e));map.addEventListener('pointercancel',e=>release(e,true));map.addEventListener('lostpointercapture',()=>{grip=null;});
 map.addEventListener('keydown',e=>{
  if(!canMove())return;const d=e.shiftKey?160:70,arrows={ArrowLeft:[d,0],ArrowRight:[-d,0],ArrowUp:[0,d],ArrowDown:[0,-d]};
  if(arrows[e.key]){e.preventDefault();state.view.x+=arrows[e.key][0];state.view.y+=arrows[e.key][1];render();}
  else if(['Home','Enter',' '].includes(e.key)){e.preventDefault();centerAt(chapterViewport.initialPoint,startScale(),[.5,.5]);}
 });
 map.addEventListener('click',e=>e.preventDefault());
}
