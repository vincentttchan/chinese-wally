import {assetPath} from './assets.ts';
export type EnsemblePlayer='blue'|'grey'|'drummer';
export const ensembleGroupDuration=2800;
export const ensembleGroupPath=(name:string)=>assetPath(`art/animations/kangqu-ensemble-v6/${name}.png`);
export const ensemblePlayerDrawings={blue:[0,1,2,3,6],grey:[0,1,2,3,6,7,10],drummer:[0,1,2,3,4,5,17,6,7,9,13]} as const;
const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
function valueAt(t:number,keys:readonly (readonly [number,number])[]){
 for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const [a,av]=keys[i-1],[b,bv]=keys[i];return av+(bv-av)*ease((t-a)/(b-a));}
 return keys[keys.length-1][1];
}
function drawingAt(t:number,keys:readonly (readonly [number,number])[]){
 let drawing=0;for(const [at,value] of keys){if(t<at)break;drawing=value;}return drawing;
}
/** Bodies articulate around planted waists; original heads nod at their own necks. */
export function ensembleGroupPose(t:number){
 return {
  drummer:{drawing:drawingAt(t,[[0,0],[260,1],[370,2],[480,3],[590,4],[720,5],[920,17],[1030,6],[1120,7],[1280,9],[1500,13],[1800,1],[2130,0]]),angle:valueAt(t,[[0,0],[280,0],[740,-1.8],[1050,1.8],[1320,.35],[1880,0],[2800,0]]),nod:valueAt(t,[[0,0],[720,-.3],[1060,1],[1340,.15],[1870,0],[2800,0]])},
  blue:{drawing:drawingAt(t,[[0,0],[450,1],[680,2],[920,3],[1160,6],[1380,3],[1600,2],[1900,1],[2240,0]]),angle:valueAt(t,[[0,0],[400,0],[880,-1.4],[1230,1.8],[1510,.3],[2150,0],[2800,0]]),nod:valueAt(t,[[0,0],[930,-.3],[1270,.9],[1580,.15],[2170,0],[2800,0]])},
  grey:{drawing:drawingAt(t,[[0,0],[580,1],[800,2],[1050,3],[1320,6],[1530,7],[1800,10],[2230,0]]),angle:valueAt(t,[[0,0],[520,0],[1080,-1.3],[1430,2],[1670,.2],[2230,0],[2800,0]]),nod:valueAt(t,[[0,0],[1100,-.25],[1450,1],[1710,.1],[2240,0],[2800,0]])},
 };
}
export const ensemblePlayerAnchors={blue:{waist:[103,168],neck:[90,88]},grey:{waist:[141,168],neck:[143,116]},drummer:{waist:[84,190],neck:[86,146]}} as const;
