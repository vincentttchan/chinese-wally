type CourtFigure='P4'|'P6';
const smooth=(value:number)=>{
 const t=Math.max(0,Math.min(1,value));
 return t*t*(3-2*t);
};
const gesture=(time:number,start:number,rise:number,release:number,fall:number)=>
 smooth((time-start)/rise)*(1-smooth((time-release)/fall));

export const zanhuaCourtPerformanceDuration=8000;

/** Separate dramatic beats: flower/wrist/sleeve versus returned gaze/reflection/head tilt. */
export function zanhuaCourtPerformance(kind:CourtFigure,time:number){
 if(kind==='P4'){
  const attention=gesture(time,350,700,6000,1000);
  const response=gesture(time,3000,700,5500,1200);
  const wrist=gesture(time,900,1200,5000,1600);
  const sleeveAge=Math.max(0,time-1700);
  return {
   attention,response,
   body:gesture(time,1300,1200,5400,1800),
   armAngle:wrist*5.2,
   headAngle:-2.6*attention+3.2*gesture(time,1600,1100,5400,1400),
   sleeveLag:Math.sin(sleeveAge*Math.PI/1500)*Math.exp(-sleeveAge/2500)*wrist*1.8,
   caption:time<1600?'先垂眼看花，頭部微俯':time<3000?'提腕舒袖，身姿稍後跟隨':time<5000?'衣袖輕落，眉眼與嘴角漸鬆': '收回手勢，笑意與衣袖依次安定',
  };
 }
 const attention=gesture(time,400,700,3500,800);
 const response=gesture(time,2900,1000,5900,1100);
 return {
  attention,response,
  body:gesture(time,3200,1200,6000,1400),
  armAngle:0,
  headAngle:-1.2*attention+4.2*gesture(time,2700,1400,5800,1400),
  sleeveLag:0,
  caption:time<2400?'略抬眼，回望正在看花的你':time<4200?'神情漸斂，頭髻緩緩斜轉':time<5900?'停住身姿，留下關於身分的提問':'目光與身姿，依次回到原畫',
 };
}
