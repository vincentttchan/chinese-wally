import {assetPath} from '../game/assets.ts';

type CourtFigure='P4'|'P6';
const config={
 P4:{first:'P4-attentive-v1.png',second:'P4-soft-smile-v1.png',x:130,y:0,width:410,height:440,
  eyes:[[256,260,20,25,0],[300,258,25,27,0]],mouth:[290,319,18,14,0]},
 P6:{first:'P6-curious-v1.png',second:'P6-reflective-v1.png',x:180,y:10,width:450,height:450,
  eyes:[[357,283,25,24,28],[401,304,25,23,25]],mouth:[341,340,19,15,28]},
};
export const zanhuaCourtExpressionSources=(kind:CourtFigure)=>
 [config[kind].first,config[kind].second].map(file=>assetPath(`art/zanhua/animation/${file}`));

/** Only derived brows, eyelids and lips are shown; original identity contours remain. */
export function ZanhuaCourtExpression({kind,id,attention,response}:{kind:CourtFigure;id:string;attention:number;response:number}){
 const spec=config[kind],sources=zanhuaCourtExpressionSources(kind);
 const ellipse=([x,y,rx,ry,angle]:number[],key:number)=><ellipse key={key} cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(${angle} ${x} ${y})`}/>;
 const eyes=spec.eyes.map(ellipse),mouth=ellipse(spec.mouth,2);
 return <>
  <defs>
   <filter id={`${id}-court-feather`}><feGaussianBlur stdDeviation="1.4"/></filter>
   <mask id={`${id}-court-first`} maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="500"><g fill="white" filter={`url(#${id}-court-feather)`}>{eyes}{kind==='P6'&&mouth}</g></mask>
   <mask id={`${id}-court-response`} maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="500"><g fill="white" filter={`url(#${id}-court-feather)`}>{eyes}{mouth}</g></mask>
  </defs>
  <image href={sources[0]} x={spec.x} y={spec.y} width={spec.width} height={spec.height} preserveAspectRatio="none" opacity={attention} mask={`url(#${id}-court-first)`}/>
  <image href={sources[1]} x={spec.x} y={spec.y} width={spec.width} height={spec.height} preserveAspectRatio="none" opacity={response} mask={`url(#${id}-court-response)`}/>
 </>;
}
