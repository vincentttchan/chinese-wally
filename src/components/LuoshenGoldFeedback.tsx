import {luoshenSize} from '../game/luoshen.ts';
import {luoshenGoldClues} from '../game/luoshenGoldClues.ts';
import type {SceneActor} from '../game/level.ts';
import type {SceneViewport} from './ScrollScene.tsx';
export function LuoshenGoldFeedback({actor,viewport}:{actor:SceneActor;viewport:SceneViewport}){
 const path=luoshenGoldClues[actor.id];if(!path)return null;
 return <div className="luoshen-gold-feedback" aria-hidden="true" data-gold-clue={actor.id}>
 <svg width={luoshenSize.width} height={luoshenSize.height} viewBox={`0 0 ${luoshenSize.width} ${luoshenSize.height}`} style={{transform:`translate(${viewport.view.x}px,${viewport.view.y}px) scale(${viewport.view.scale})`}}>
 <svg x={(actor.x-actor.width/2)*luoshenSize.width} y={(actor.y-actor.height/2)*luoshenSize.height} width={actor.width*luoshenSize.width} height={actor.height*luoshenSize.height} viewBox="-4 -4 108 108" preserveAspectRatio="none" overflow="visible"><path className="luoshen-gold-halo" d={path} vectorEffect="non-scaling-stroke"/><path className="luoshen-gold-line" d={path} pathLength="1" vectorEffect="non-scaling-stroke"/></svg>
 </svg></div>;
}
