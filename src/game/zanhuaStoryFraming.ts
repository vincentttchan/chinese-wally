import {coverView} from './geometry.ts';
import type {Size} from './geometry.ts';
import {zanhuaSize,zanhuaSteps} from './zanhuaPreview.ts';

/** Reserve reading space while retaining the actual evidence in the original painting. */
export function zanhuaObservationShot(index:number,frame:Size){
 const base=coverView(frame,zanhuaSize).scale;
 if(index===0){
  if(frame.width<760){
   const readingHeight=Math.min(340,frame.height*.42);
   const scale=Math.min((frame.width-32)/1260,(frame.height-readingHeight-84)/zanhuaSize.height);
   return {region:{x:5370/zanhuaSize.width,y:.5},scaleRatio:scale/base,
    screenAnchor:{x:.52,y:(readingHeight+24+zanhuaSize.height*scale/2)/frame.height},
    allowHorizontalMargin:true,allowVerticalMargin:true};
  }
  return {region:{x:5370/zanhuaSize.width,y:.5},scaleRatio:Math.min(.9,(frame.width-32)/1260/base),
   screenAnchor:{x:.55,y:.5},allowHorizontalMargin:true,allowVerticalMargin:false};
 }
 return {region:zanhuaSteps[index].focus,scaleRatio:frame.width<760?1.2:1.15,
  screenAnchor:frame.width<760?{x:.5,y:.27}:{x:index===1?.76:.735,y:index===1?.42:.3},
  allowHorizontalMargin:false,allowVerticalMargin:false};
}
