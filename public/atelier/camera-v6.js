/* Two camera moves; the progression and storage remain owned by opening.js. */
const ease = t => t*t*(3-2*t);
const mix = (a,b,t) => a+(b-a)*t;
function animate(duration, update) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { update(1); return Promise.resolve(); }
  return new Promise(resolve => {
    let start;
    function frame(now) {
      start ??= now;
      const t = Math.min(1, (now-start)/duration);
      update(ease(t));
      if(t<1) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
}
export async function enterHall(opening, stage) {
  const shell=stage.querySelector('.threshold-camera');
  const view=stage.querySelector('.door-view');
  opening.classList.add('entering-hall');
  await animate(1500, t => {
    const {width:w,height:h}=stage.getBoundingClientRect();
    const k=mix(1,4,t),tx=-.1075*w*k*t,ty=.01*h*k*t;
    shell.style.transform=`translate(${tx}px,${ty}px) scale(${k})`;
    // The corridor moves towards us. The room behind it advances more slowly.
    // Keep the opening and its surrounding door frame on the same transform.
    const apertureX=w*(.5+(.4437-.5)*k)+tx;
    const apertureY=h*(.5+(.14-.5)*k)+ty;
    const roomH=Math.min(h,.7*h*k);
    const roomX=mix(.35623*w,-.06279905*w,Math.min(1,t*3));
    const roomY=Math.max(0,apertureY);
    view.style.backgroundSize=`${roomH*2/k}px ${roomH/k}px`;
    view.style.backgroundPosition=`${(roomX-apertureX)/k}px ${(roomY-apertureY)/k}px`;
  });
  // The portal now covers the viewport and exactly matches the final hall.
  opening.classList.remove('entering-hall');
}
export async function approachDesk(opening, stage) {
  const hall=stage.querySelector('.hall');
  const desk=stage.querySelector('.desk-composition');
  const post=stage.querySelector('.camera-post');
  opening.classList.add('approaching-desk');
  await animate(1800,t=>{
    const boundary=mix(1.14,-.14,t);
    // An opaque foreground column masks the join during the lateral camera move.
    // At no point are two room plates alpha-blended together.
    hall.style.transform=`translateX(${-8*t}%) scale(${1+.18*t})`;
    desk.style.clipPath=`inset(0 0 0 ${Math.max(0,Math.min(100,boundary*100))}%)`;
    desk.style.transform=`translateX(${5*(1-t)}%) scale(${1+.035*(1-t)})`;
    post.style.left=`${boundary*100-16}%`;
  });
  // Keep the final composition mounted until the caller commits the desk state.
  requestAnimationFrame(()=>{
    opening.classList.remove('approaching-desk');
    hall.style.removeProperty('transform');
    desk.style.removeProperty('clip-path');
    desk.style.removeProperty('transform');
    post.style.removeProperty('left');
  });
}
export async function passAlbum(stage) {
  const actor=stage.querySelector('.stable-animation');
  await animate(900,t=>{
    const frame=Math.min(5,Math.floor(t*6));
    actor.style.setProperty('--pose-x',`${(frame%3)*50}%`);
    actor.style.setProperty('--pose-y',frame<3?'0%':'100%');
    actor.dataset.frame=String(frame);
  });
}
