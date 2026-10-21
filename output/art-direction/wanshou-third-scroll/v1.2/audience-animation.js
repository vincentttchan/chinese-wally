// Approved seven-person painting interpretation; the original observation remains mandatory.
const audiencePeople=['watcher-blue','watcher-pink','watcher-pale','watcher-white','watcher-brown','watcher-pattern','watcher-yellow'];
const audienceAsset=name=>'../../../../public/art/animations/kangqu-audience-v2-seven/'+name+'.png';
let audienceRAF=0,audienceToken=0,audienceReturn=null;
function stopAudience(completed=false){
 audienceToken++;cancelAnimationFrame(audienceRAF);$('audience-animation')?.remove();$('audience-controls')?.remove();$('layout').classList.remove('is-ensemble-playing');
 const previous=audienceReturn;audienceReturn=null;state.busy=false;
 if(previous){state.noteHidden=previous.noteHidden;state.speaker=previous.speaker;}
 drawPanel();drawPoints();render();
 if(completed&&!state.collections.audience){state.collections.audience={instance:'street-audience',point:[512.5,2557.5]};save();receiveCollection('已收藏：表演與觀看');}
 scene.focus({preventScroll:true});
}
async function playAudience(playbackRate=1){
 if(state.busy)return;
 if(state.source!=='native'&&!await setSource('native'))return;
 audienceReturn={noteHidden:state.noteHidden,speaker:state.speaker};state.speaker=null;
 await moveTo([512.5,2557.5],Math.min(1.35,(scene.clientWidth-48)/545,(scene.clientHeight-100)/275));
 const token=++audienceToken;state.busy=true;state.noteHidden=true;$('layout').classList.add('is-ensemble-playing');drawPanel();drawPoints();render();
 const controls=document.createElement('p');controls.id='audience-controls';controls.className='ensemble-controls';controls.setAttribute('role','status');controls.append('前方示意，後方四人回應 ');
 const skip=document.createElement('button');skip.className='lantern-text-button';skip.textContent='略過';skip.onclick=()=>stopAudience();controls.append(skip);document.body.append(controls);
 let images,timeout;
 try{images=await Promise.race([Promise.all(['original-reference','fixed-background',...Array.from({length:9},(_,i)=>'frames/group-'+String(i+1).padStart(2,'0'))].map(name=>preload(audienceAsset(name)))),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('timeout')),8000);})]);}
 catch{if(token===audienceToken){stopAudience();announce('演繹素材暫未載入，請再點人物重試。');}return;}
 finally{clearTimeout(timeout);}
 if(token!==audienceToken)return;
 const {crop,lead,fade,durations,tail,foreground}=audiencePlayback,motion=durations.reduce((n,t)=>n+t,0),duration=lead+motion+fade+tail;
 const layer=document.createElement('canvas');layer.id='audience-animation';layer.className='ensemble-animation';Object.assign(layer.style,{left:crop.x+'px',top:crop.y+'px',width:crop.width+'px',height:crop.height+'px'});
 layer.setAttribute('aria-label','畫中情景演繹：七人整組摹繪，前後人物呼應，背景固定');
 const context=layer.getContext('2d'),plate=document.createElement('canvas'),paint=plate.getContext('2d');
 if(!context||!paint){stopAudience();announce('演繹暫未能播放，請再試一次。');return;}
 world.append(layer);let start;
 const tick=now=>{
  if(token!==audienceToken)return;start??=now;const t=(now-start)*(reduced.matches?1:playbackRate);
  if(t>=(reduced.matches?850:duration)){stopAudience(true);return;}
  const density=Math.min(4,Math.max(1,state.view.scale*window.devicePixelRatio)),w=Math.ceil(crop.width*density),h=Math.ceil(crop.height*density);
  if(layer.width!==w||layer.height!==h){layer.width=plate.width=w;layer.height=plate.height=h;}
  context.setTransform(w/crop.width,0,0,h/crop.height,0,0);paint.setTransform(w/crop.width,0,0,h/crop.height,0,0);
  context.imageSmoothingEnabled=paint.imageSmoothingEnabled=true;context.imageSmoothingQuality=paint.imageSmoothingQuality='high';
  context.globalAlpha=1;context.clearRect(0,0,crop.width,crop.height);context.drawImage(images[0],0,0,crop.width,crop.height);
  let frame=8,end=lead;for(let i=0;i<durations.length;i++){end+=durations[i];if(t<end){frame=i;break;}}
  if(!reduced.matches){
   paint.clearRect(0,0,crop.width,crop.height);paint.drawImage(images[1],0,0,crop.width,crop.height);paint.drawImage(images[frame+2],0,0,crop.width,crop.height);
   paint.save();paint.beginPath();for(const polygon of foreground){polygon.forEach(([x,y],i)=>i?paint.lineTo(x,y):paint.moveTo(x,y));paint.closePath();}paint.clip();paint.drawImage(images[0],0,0,crop.width,crop.height);paint.restore();
   context.globalAlpha=Math.max(0,Math.min(1,t/lead,(lead+motion+fade-t)/fade));context.drawImage(plate,0,0,crop.width,crop.height);context.globalAlpha=1;
  }
  layer.dataset.groupFrame=String(frame+1);layer.dataset.sourceWidth=String(images[frame+2].width);audienceRAF=requestAnimationFrame(tick);
 };audienceRAF=requestAnimationFrame(tick);
}
