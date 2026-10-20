import type {CSSProperties} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import type {StoryFocus} from '../game/qingmingStories.ts';

/** A display-only feathered mask follows original-painting coordinates, including pan and zoom. */
export function QingmingFocus({viewport,profile}:{viewport:SceneViewport;profile:StoryFocus}){
 const {view,frame}=viewport;
 const bridge=[[19620,275,445,155]],boat=[[19785,630,370,235]],left=[[4370,1245,300,235]],right=[[4795,1245,240,235]],loads=[[5480,1020,400,220]];
 const people:Partial<Record<StoryFocus,number[][]>>={
  'transport-left-west':[[4210,1220,135,135]],'transport-left-east':[[4480,1240,165,180]],
  'transport-right-west':[[4660,1280,125,155]],'transport-right-east':[[4910,1250,125,180]],
  'boat-window-face':[[24035,1100,110,100]],
  'boat-outside-search':[[24450,1015,760,255]],
  'boat-window-scene':[[24450,1015,760,255]],
 };
 const spots=people[profile]??(profile==='bridge-search'?bridge:profile==='boat'?boat:profile==='both'?[...bridge,[19710,430,220,210],...boat]:profile==='transport-left'||profile==='transport-left-scene'?left:profile==='transport-right'||profile==='transport-right-scene'?right:profile==='transport-loads'?loads:profile==='transport-cart'?[[5580,1060,210,170]]:profile==='transport-cargo'?[[5300,1020,180,160],[5650,972,180,160]]:[...left,...right,...loads]);
 const masks=spots.map(([x,y,rx,ry])=>`radial-gradient(ellipse ${rx*view.scale}px ${ry*view.scale}px at ${view.x+x*view.scale}px ${view.y+y*view.scale}px, transparent 78%, #000 100%)`).join(',');
 return <div className={`qingming-guided-focus ${profile==='bridge-search'||profile==='boat-window-face'||profile==='boat-outside-search'||profile.startsWith('transport-')&&profile!=='transport-all'&&!profile.endsWith('-scene')?'is-searching':''}`} style={{width:frame.width,height:frame.height,maskImage:masks,WebkitMaskImage:masks,maskComposite:'intersect',WebkitMaskComposite:'source-in'} as CSSProperties} aria-hidden="true"/>;
}
