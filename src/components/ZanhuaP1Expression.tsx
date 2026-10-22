import {assetPath} from '../game/assets.ts';

const attentive=assetPath('art/zanhua/animation/P1-attentive-v1.png');
const delighted=assetPath('art/zanhua/animation/P1-delighted-v1.png');
export const zanhuaP1ExpressionSources=[attentive,delighted];

/** Generated features only; the contour, nose, hair and dress remain original pixels. */
export function ZanhuaP1Expression({id,attention,delight}:{id:string;attention:number;delight:number}){
 const eyes=<>
  <ellipse cx="440" cy="310" rx="26" ry="24" transform="rotate(-22 440 310)"/>
  <ellipse cx="491" cy="290" rx="31" ry="25" transform="rotate(-28 491 290)"/>
 </>;
 return <>
  <defs>
   <filter id={`${id}-feature-feather`}><feGaussianBlur stdDeviation="1.4"/></filter>
   <mask id={`${id}-eyes`} maskUnits="userSpaceOnUse" x="400" y="250" width="135" height="95"><g fill="white" filter={`url(#${id}-feature-feather)`}>{eyes}</g></mask>
   <mask id={`${id}-expression`} maskUnits="userSpaceOnUse" x="400" y="250" width="135" height="125"><g fill="white" filter={`url(#${id}-feature-feather)`}>{eyes}<ellipse cx="493" cy="348" rx="21" ry="15" transform="rotate(-22 493 348)"/></g></mask>
  </defs>
  <image href={attentive} x="290" y="40" width="390" height="410" preserveAspectRatio="none" opacity={attention} mask={`url(#${id}-eyes)`}/>
  <image href={delighted} x="290" y="40" width="390" height="410" preserveAspectRatio="none" opacity={delight} mask={`url(#${id}-expression)`}/>
 </>;
}
