import {lanternActors,lanternTargets} from '../game/lanternFestival.ts';
import {lanternAcrobatFocus} from './LanternAcrobatAnimation.tsx';
import {lanternMarketFocus} from './LanternMarketAnimation.tsx';
import type {ReviewDetail} from './LanternEpilogue.tsx';
import type {SceneViewport,StudyCommand} from './ScrollScene.tsx';

/** Frame the emperor's appearances and the palace festivities. */
export function lanternReviewCommand(index:number,detail:ReviewDetail,frame:SceneViewport['frame'],transition:'pan'|'crossfade',onSettled:()=>void):StudyCommand {
  const actor=lanternActors.find(item=>item.id===lanternTargets[index].id)!;
  const compact=frame.width<760;
  const region=detail==='performance'?lanternAcrobatFocus:detail==='market'?lanternMarketFocus:{x:actor.x,y:actor.y};
  const scaleRatio=compact?(detail==='performance'?1.05:detail==='market'?1.1:1.65):detail==='market'?1.3:1.12;
  return {region,scaleRatio,screenAnchor:compact?{x:.5,y:.23}:{x:.68,y:.46},transition,onSettled,token:performance.now()};
}
