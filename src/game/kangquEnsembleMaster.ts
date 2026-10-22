import {assetPath} from './assets.ts';
import playback from './kangquEnsemblePlayback.json';
export const ensembleMasterAsset=(name:string)=>assetPath(`art/animations/kangqu-ensemble-master-v7/${name}.png`);
export const ensembleMasterFrames=Array.from({length:9},(_,i)=>ensembleMasterAsset(`frames/group-${String(i+1).padStart(2,'0')}`));
export const ensembleMasterPlacement=playback.placement;
export const ensembleMasterLead=playback.lead,ensembleMasterFade=playback.fade;
export const ensembleMasterDurations=playback.durations;
export const ensembleMasterMotion=ensembleMasterDurations.reduce((n,t)=>n+t,0);
export const ensembleMasterDuration=ensembleMasterLead+ensembleMasterMotion+ensembleMasterFade+playback.tail;
export function ensembleMasterFrame(time:number){
 let end=ensembleMasterLead;
 for(let i=0;i<ensembleMasterDurations.length;i++){end+=ensembleMasterDurations[i];if(time<end)return i;}
 return 8;
}
