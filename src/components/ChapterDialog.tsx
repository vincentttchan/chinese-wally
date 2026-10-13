import {useEffect,useRef} from 'react';
import type {ReactNode,RefObject} from 'react';
import {X} from './ArtIcons.tsx';
/** Same focus contract and paper structure as LanternDialog, with chapter content supplied. */
export function useChapterFocus(ref:RefObject<HTMLElement|null>,active:boolean,onClose:()=>void){
 const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  if(!active)return;const previous=document.activeElement as HTMLElement|null,node=ref.current;
  node?.focus({preventScroll:true});
  const keys=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close.current();return;}
   if(e.key!=='Tab')return;
   const items=Array.from(node?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],summary,[tabindex="0"]')??[]).filter(x=>!x.closest('[inert]')&&x.getClientRects().length>0);
   const first=items[0],last=items[items.length-1];if(!first){e.preventDefault();return;}
   if(e.shiftKey&&(document.activeElement===first||document.activeElement===node)){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===node)){e.preventDefault();first.focus();}
  };
  node?.addEventListener('keydown',keys);
  return()=>{node?.removeEventListener('keydown',keys);if(previous?.isConnected&&!previous.closest('[inert]'))previous.focus({preventScroll:true});};
 },[active,ref]);
}
export function ChapterDialog({label,className='',children,onClose}:{label:string;className?:string;children:ReactNode;onClose:()=>void}){
 const ref=useRef<HTMLElement>(null);useChapterFocus(ref,true,onClose);
 return <div className={`lantern-dialog-layer ${className}`}><section ref={ref} tabIndex={-1} className="lantern-paper" role="dialog" aria-modal="true" aria-label={label}><button className="paper-close" aria-label="關閉" onClick={onClose}><X size={18}/></button>{children}</section></div>;
}
