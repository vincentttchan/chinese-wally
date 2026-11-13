import {coverView} from './geometry.ts';
import type {Size} from './geometry.ts';

/** Fit P6's hair, face and raised hand instead of inheriting a previous garment zoom. */
export function zanhuaHeadObservationShot(frame:Size){
 const scale=Math.min(1.1,frame.width*.42/620,(frame.height-80)/800);
 const focus={x:1300/6455,y:160/1378};
 return {
  region:focus,
  scaleRatio:scale/coverView(frame,{width:6455,height:1378}).scale,
  screenAnchor:{x:.62,y:(40+150*scale)/frame.height},
  allowHorizontalMargin:true,allowVerticalMargin:true,
 };
}
