const flagPeople=['red-front-east-05','red-front-east-06','red-front-east-07','red-front-east-08'];
const flagAsset=name=>'../../../../public/art/animations/kangqu-flags-v2-detail/'+name+'.png';
let flagRAF=0,flagToken=0,flagReturn=null;
async function stopFlags(completed=false){
 flagToken++;cancelAnimationFrame(flagRAF);$('flag-animation')?.remove();$('flag-controls')?.remove();
 const previous=flagReturn;flagReturn=null;
 await restoreInquiryPlayback(previous);
 if(completed&&!state.collections.flag){const object=chapter.objects.find(o=>o.category==='flag'&&objectBox(o)[0]>=3300&&objectBox(o)[0]<=3500);if(object)collect(object);}
}
async function playFlags(playbackRate=1,fromJournal=false){
 if(state.busy)return;
 if(!fromJournal&&!inquiryCanAnimate('flags')){announce('先完成這一站的原畫觀察，再看旗列演繹。');return;}
 const previous=await prepareInquiryPlayback();if(!previous)return;flagReturn=previous;
 const token=++flagToken;
 await moveTo([3535,1515],Math.min(1.25,(scene.clientWidth-48)/470,(scene.clientHeight-80)/490));if(token!==flagToken)return;
 quietInquiryNotice();state.busy=true;state.noteHidden=true;$('layout').classList.add('is-ensemble-playing');drawPanel();drawPoints();render();
 const controls=document.createElement('p');controls.id='flag-controls';controls.className='ensemble-controls';controls.setAttribute('role','status');controls.append('持旗者與旗面互相呼應 ');
 const skip=document.createElement('button');skip.className='lantern-text-button';skip.textContent='略過';skip.onclick=()=>stopFlags();controls.append(skip);document.body.append(controls);
 let images,timeout;
 try{images=await Promise.race([Promise.all(['original-reference','fixed-background',...Array.from({length:9},(_,i)=>'frames/group-'+String(i+1).padStart(2,'0'))].map(name=>preload(flagAsset(name)))),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('timeout')),8000);})]);}
 catch{if(token===flagToken){stopFlags();announce('演繹素材暫未載入，請再點人物重試。');}return;}
 finally{clearTimeout(timeout);}
 if(token!==flagToken)return;
 const {crop,lead,fade,durations,tail}=flagPlayback,motion=durations.reduce((n,t)=>n+t,0),duration=lead+motion+fade+tail;
 const layer=document.createElement('canvas');layer.id='flag-animation';layer.className='ensemble-animation';Object.assign(layer.style,{left:crop.x+'px',top:crop.y+'px',width:crop.width+'px',height:crop.height+'px'});
 layer.setAttribute('aria-label','畫中情景演繹：持旗者與隨員整組摹繪，旗面呼應，背景固定');
 const context=layer.getContext('2d'),plate=document.createElement('canvas'),paint=plate.getContext('2d');
 if(!context||!paint){stopFlags();announce('演繹暫未能播放，請再試一次。');return;}
 world.append(layer);let start;
 const tick=now=>{
  if(token!==flagToken)return;start??=now;const t=(now-start)*(reduced.matches?1:playbackRate);
  if(t>=(reduced.matches?850:duration)){stopFlags(true);return;}
  const density=Math.min(4,Math.max(1,state.view.scale*window.devicePixelRatio)),w=Math.ceil(crop.width*density),h=Math.ceil(crop.height*density);
  if(layer.width!==w||layer.height!==h){layer.width=plate.width=w;layer.height=plate.height=h;}
  context.setTransform(w/crop.width,0,0,h/crop.height,0,0);paint.setTransform(w/crop.width,0,0,h/crop.height,0,0);
  context.imageSmoothingEnabled=paint.imageSmoothingEnabled=true;context.imageSmoothingQuality=paint.imageSmoothingQuality='high';
  context.globalAlpha=1;context.clearRect(0,0,crop.width,crop.height);context.drawImage(images[0],0,0,crop.width,crop.height);
  let frame=8,end=lead;for(let i=0;i<durations.length;i++){end+=durations[i];if(t<end){frame=i;break;}}
  if(frame>0)clearHitFeedback();
  if(!reduced.matches){
   paint.clearRect(0,0,crop.width,crop.height);paint.drawImage(images[1],0,0,crop.width,crop.height);paint.drawImage(images[frame+2],0,0,crop.width,crop.height);
   context.globalAlpha=Math.max(0,Math.min(1,t/lead,(lead+motion+fade-t)/fade));context.drawImage(plate,0,0,crop.width,crop.height);context.globalAlpha=1;
  }
  layer.dataset.groupFrame=String(frame+1);layer.dataset.sourceWidth=String(images[frame+2].width);flagRAF=requestAnimationFrame(tick);
 };flagRAF=requestAnimationFrame(tick);
}
