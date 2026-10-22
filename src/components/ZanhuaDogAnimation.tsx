import {useId} from 'react';
import {zanhuaDogPerformance} from '../game/zanhuaDogPerformance.ts';
import {zanhuaImage} from '../game/zanhuaPreview.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import '../lantern-market.css';

// One continuous silhouette includes the crown, muzzle, open jaw, neck and tail.
const outline='M4870 1059 Q4875 1025 4895 1010 Q4920 995 4945 1016 Q4965 1040 5000 1045 L5038 1039 L5049 1010 Q5055 997 5078 995 Q5100 991 5118 1001 L5131 1006 L5135 1018 L5120 1031 L5132 1035 L5138 1042 L5128 1051 L5113 1050 Q5105 1061 5125 1068 L5141 1073 L5144 1085 L5127 1087 L5116 1083 L5111 1094 L5127 1095 L5131 1107 L5114 1113 L5097 1107 L5082 1110 L5072 1123 L5054 1122 L5038 1115 L5001 1128 L4973 1123 L4956 1131 L4932 1137 L4921 1129 L4927 1110 L4916 1115 L4906 1131 L4891 1132 L4882 1116 L4888 1096 L4910 1072 Q4890 1056 4870 1059 Z';

/** Rendered on the figure's clock, after every layer has loaded. */
export function ZanhuaDogAnimation({viewport,time,opacity}:{viewport:SceneViewport;time:number;opacity:number}){
 const id=useId().replace(/:/g,'');
 // The dog waits for the lure to lift, bounds towards it, then settles first.
 const {bound:impulse}=zanhuaDogPerformance(time);
 const dx=impulse*36,dy=-impulse*42,angle=-impulse*4;
 const {view}=viewport;
 return <div className="zanhua-dog-animation" role="status" aria-label="小犬向長柄物輕躍的遊戲演繹正在播放">
  <svg width="6455" height="1378" viewBox="0 0 6455 1378" style={{transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`,opacity}} aria-hidden="true">
   <defs>
    <filter id={`dog-feather-${id}`} x="-20%" y="-30%" width="140%" height="160%"><feMorphology operator="dilate" radius="2"/><feGaussianBlur stdDeviation="1.5"/></filter>
    <mask id={`dog-mask-${id}`} maskUnits="userSpaceOnUse" x="4825" y="950" width="370" height="240"><path d={outline} fill="white" filter={`url(#dog-feather-${id})`}/></mask>
    <clipPath id={`dog-outline-${id}`}><path d={outline}/></clipPath>
   </defs>
   <image href={zanhuaImage} x="0" y="180" width="6455" height="1378" mask={`url(#dog-mask-${id})`}/>
   <g transform={`translate(${dx} ${dy}) rotate(${angle} 5030 1135)`}>
    <g clipPath={`url(#dog-outline-${id})`}><image href={zanhuaImage} width="6455" height="1378"/></g>
   </g>
  </svg>
 </div>;
}
