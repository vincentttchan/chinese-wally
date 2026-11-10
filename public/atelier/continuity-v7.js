const ease=t=>t*t*(3-2*t),mix=(a,b,t)=>a+(b-a)*t;
function animate(ms,update){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){update(1);return Promise.resolve();}
 return new Promise(resolve=>{let start;function tick(now){start??=now;const t=Math.min(1,(now-start)/ms);update(ease(t));if(t<1)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});
}
function positionPortal(stage,t){
 const shell=stage.querySelector(".threshold-camera"),portal=stage.querySelector(".portal-room");
  const {width:w,height:h}=stage.getBoundingClientRect();
  const k=mix(1,4,t),tx=-.1075*w*k*t,ty=.01*h*k*t;
  shell.style.transform=`translate(${tx}px,${ty}px) scale(${k})`;
  const ax=w*(.5+(.4437-.5)*k)+tx,ay=h*(.5+(.14-.5)*k)+ty;
  const rh=Math.min(h,.7*h*k),rw=rh*2;
  // Track the welcoming figure instead of sliding the room past the door jamb.
  const head=mix(.6075*w,-.06279905*w+.36*2*h,t);
  const rx=head-.36*rw,ry=Math.max(0,ay);
  Object.assign(portal.style,{width:`${rw/k}px`,height:`${rh/k}px`,left:`${(rx-ax)/k}px`,top:`${(ry-ay)/k}px`});
}
export function prepareRoom(opening,stage){
 const room=stage.querySelector('.desk-composition'),portal=room.cloneNode(true);
 portal.className='portal-room';portal.setAttribute('aria-hidden','true');
 // SVG IDs must be unique even though both views use exactly the same art.
 for(const node of portal.querySelectorAll('[id]'))node.id+='-portal';
 for(const attr of ['clip-path','mask','filter'])for(const node of portal.querySelectorAll('['+attr+']'))node.setAttribute(attr,node.getAttribute(attr).replace(')', '-portal)'));
 stage.querySelector('.door-view').replaceChildren(portal);
 positionPortal(stage,0);
 new ResizeObserver(()=>{if(['loading','unlit','lighting','lit','opening'].includes(opening.dataset.state)&&!opening.classList.contains('entering-hall'))positionPortal(stage,0);}).observe(stage);
}
export async function enterHall(opening,stage){
 opening.classList.add('entering-hall');
 await animate(1500,t=>{
  positionPortal(stage,t);
 });
 opening.classList.remove('entering-hall');
}
export async function approachDesk(opening,stage){
 opening.classList.add('approaching-desk');
 await animate(1500,t=>{
  stage.style.setProperty('--room-zoom',mix(1,1.06,t));
  stage.style.setProperty('--scholar-offset',`${mix(-4,0,t)}%`);
  stage.style.setProperty('--scholar-settle',`${Math.sin(t*Math.PI)*-1.5}%`);
  stage.style.setProperty('--greeting-turn',`${t<.82?t*28:0}deg`);
  stage.querySelector('.scholar-rig').classList.toggle('greeting-lowered',t>=.82);
 });
 opening.classList.remove('approaching-desk');
}
export async function passAlbum(stage){
 await animate(1150,t=>{
  const push=Math.min(1,t/.62),point=Math.max(0,(t-.62)/.38);
  stage.style.setProperty('--book-push',push);
  stage.style.setProperty('--hand-push',`${Math.sin(push*Math.PI)*9}px`);
  stage.style.setProperty('--point-turn',`${mix(8,0,point)}deg`);
  stage.querySelector('.scholar-rig').classList.toggle('pointing',point>0);
 });
}
