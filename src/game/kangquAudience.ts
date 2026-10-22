import playback from './kangquAudiencePlayback.json';
import {assetPath} from './assets.ts';
export const kangquAudienceSize={width:4500,height:2843};
export const kangquAudiencePainting=assetPath('chapters/kangqu-listening/art/native-segment-lossless.webp');
export const kangquAudienceCrop=playback.crop;
export const kangquAudienceFocus={x:512.5/4500,y:2557.5/2843};
export const kangquAudienceAsset=(name:string)=>assetPath(`art/animations/kangqu-audience-v2-seven/${name}.png`);
export const kangquAudienceFrames=Array.from({length:9},(_,i)=>kangquAudienceAsset(`frames/group-${String(i+1).padStart(2,'0')}`));
export const kangquAudienceLead=playback.lead,kangquAudienceFade=playback.fade;
export const kangquAudienceDurations=playback.durations;
export const kangquAudienceMotion=kangquAudienceDurations.reduce((n,t)=>n+t,0);
export const kangquAudienceDuration=kangquAudienceLead+kangquAudienceMotion+kangquAudienceFade+playback.tail;
export function kangquAudienceFrame(time:number){let end=kangquAudienceLead;for(let i=0;i<kangquAudienceDurations.length;i++){end+=kangquAudienceDurations[i];if(time<end)return i;}return 8;}
