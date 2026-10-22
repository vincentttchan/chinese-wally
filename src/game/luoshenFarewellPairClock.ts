export type FarewellFigure='goddess'|'cao';
/** One frame clock: neither figure becomes visible until both have prepared their layers. */
export function createFarewellPairClock(){const ready=new Set<FarewellFigure>();let start:number|null=null;return {ready:(figure:FarewellFigure)=>{ready.add(figure);},elapsed:(now:number)=>{if(ready.size!==2)return null;start??=now;return Math.max(0,now-start);}};}
export type FarewellPairClock=ReturnType<typeof createFarewellPairClock>;
