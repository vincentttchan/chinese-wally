import playback from './kangquFlagsPlayback.json';
import {assetPath} from './assets.ts';
export const kangquFlagsSize={width:4500,height:2843};
export const kangquFlagsPainting=assetPath('chapters/kangqu-listening/art/native-segment-lossless.webp');
export const kangquFlagsCrop=playback.crop;
export const kangquFlagsFocus={x:3525/4500,y:1515/2843};
export const kangquFlagsAsset=(name:string)=>assetPath(`art/animations/kangqu-flags-v2-detail/${name}.png`);
export const kangquFlagsFrames=Array.from({length:9},(_,i)=>kangquFlagsAsset(`frames/group-${String(i+1).padStart(2,'0')}`));
export const kangquFlagsLead=playback.lead,kangquFlagsFade=playback.fade;
export const kangquFlagsDurations=playback.durations;
export const kangquFlagsMotion=kangquFlagsDurations.reduce((n,t)=>n+t,0);
export const kangquFlagsDuration=kangquFlagsLead+kangquFlagsMotion+kangquFlagsFade+playback.tail;
export function kangquFlagsFrame(time:number){let end=kangquFlagsLead;for(let i=0;i<kangquFlagsDurations.length;i++){end+=kangquFlagsDurations[i];if(time<end)return i;}return 8;}
