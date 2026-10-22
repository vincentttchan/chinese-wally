const smooth=(value:number)=>{
 const t=Math.max(0,Math.min(1,value));
 return t*t*(3-2*t);
};

export const zanhuaDogPerformanceDuration=8000;

/** One performance clock: attention leads the lure, delight follows the dog's response. */
export function zanhuaDogPerformance(time:number){
 const attention=smooth((time-350)/650)*(1-smooth((time-6400)/800));
 const delight=smooth((time-3450)/450)*(1-smooth((time-5600)/1100));
 const follow=smooth((time-2600)/650)*(1-smooth((time-5500)/1500));
 const landingAge=(time-4350)/550;
 const nod=landingAge>0&&landingAge<1?Math.sin(landingAge*Math.PI)**2:0;
 const boundAge=(time-3250)/1150;
 const bound=boundAge>0&&boundAge<1?Math.sin(boundAge*Math.PI)**2:0;
 return {
  attention,delight,
  headAngle:-3*attention+4.2*follow-1.8*nod,
  body:smooth((time-800)/1200)*(1-smooth((time-5500)/1700)),
  lureAngle:(-3.5*smooth((time-1000)/900)+6.5*smooth((time-2600)/600))*(1-smooth((time-5500)/1500)),
  bound,
  caption:time<2000?'垂眼看犬，俯身放低長柄':time<2600?'停住長柄，等牠回應':time<4400?'抬柄、目光跟隨，小犬輕躍':time<5500?'見牠落定，眉眼稍鬆':'收回手勢，表情回到原畫',
 };
}
