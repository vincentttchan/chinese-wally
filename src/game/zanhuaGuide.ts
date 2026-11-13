export type GuideFlags=Partial<Record<'drag'|'focus'|'find'|'zoom'|'journal',boolean>>;
export const zanhuaGuideKey='chinese-wally:zanhua:play-guide:v1';
export function guideStep(flags:GuideFlags,state:{searching:boolean;studying:boolean;hasDog:boolean;found:boolean}){
 if(state.searching&&!flags.drag)return 'drag';
 if(state.searching&&!flags.focus)return 'focus';
 if(state.hasDog&&!flags.journal)return 'journal';
 if(state.studying&&!flags.zoom)return 'zoom';
 if(state.searching&&!state.found&&!flags.find)return 'find';
 return null;
}

export type GuideAction=NonNullable<ReturnType<typeof guideStep>>;
export type GuideStage=GuideAction|'review'|null;
/** Restrict inputs at this chapter's boundary without changing other painting renderers. */
export function installGuideInputGuard(root:HTMLElement,getStage:()=>GuideStage){
 let previous:GuideStage=null;
 const pointers=new Set<number>();
 function guard(event:Event){
  const stage=getStage();
  if(stage!==previous){pointers.clear();previous=stage;}
  if(!stage)return;
  const target=event.target as Element|null;
  const canvas=Boolean(target?.closest?.('.scroll-viewport'));
  const control=stage==='journal'?target?.closest?.('.lantern-journal-button'):stage==='review'?target?.closest?.('.zanhua-play-guide button'):null;
  let allow=Boolean(control);
  if(event.type==='keydown'){
   const key=(event as KeyboardEvent).key;
   if(key==='Tab')return; // Only the active control is rendered; do not trap the browser chrome.
   if(stage==='review'&&key==='Escape')return;
   if(control)allow=['Enter',' '].includes(key);
   else if(canvas)allow=stage==='drag'||stage==='find'?['ArrowLeft','ArrowRight'].includes(key)||stage==='find'&&['Enter',' '].includes(key):stage==='focus'?['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key):stage==='zoom'?['+','=','-'].includes(key):false;
  }else if(canvas){
   const pointer=event as PointerEvent;
   if(event.type==='wheel')allow=stage==='zoom';
   else if(event.type==='click')allow=stage==='find';
   else if(event.type.startsWith('pointer')){
    if(stage==='drag'||stage==='find'||stage==='focus'&&pointer.pointerType!=='mouse'){
     if(event.type==='pointerdown'){allow=pointers.size===0;if(allow)pointers.add(pointer.pointerId);}
     else if(event.type==='pointermove')allow=pointers.has(pointer.pointerId)||pointer.pointerType==='mouse'&&pointer.buttons===0;
     else {allow=pointers.has(pointer.pointerId);pointers.delete(pointer.pointerId);}
    }else if(stage==='focus')allow=event.type==='pointermove'&&pointer.buttons===0;
    else if(stage==='zoom'&&pointer.pointerType==='touch'){
     if(event.type==='pointerdown'){pointers.add(pointer.pointerId);allow=true;}
     else if(event.type==='pointermove')allow=pointers.size>=2;
     else {allow=pointers.has(pointer.pointerId);pointers.delete(pointer.pointerId);}
    }
   }
  }
  if(!allow){if(event.cancelable)event.preventDefault();event.stopImmediatePropagation();}
 }
 const events=['pointerdown','pointermove','pointerup','pointercancel','click','dblclick','wheel','keydown'];
 for(const name of events)root.addEventListener(name,guard,{capture:true,passive:false});
 return()=>{for(const name of events)root.removeEventListener(name,guard,true);};
}
