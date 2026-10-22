import {assetPath} from './assets.ts';
/** One beat from the approved key poses. Near-identical late drawings are omitted. */
export const kangquDrummerPhrase=[
 {drawing:1,ms:120,phase:'準備'},
 {drawing:2,ms:75,phase:'起槌'},
 {drawing:3,ms:75,phase:'起槌'},
 {drawing:4,ms:75,phase:'起槌'},
 {drawing:5,ms:100,phase:'起槌'},
 {drawing:17,ms:80,phase:'落槌'},
 {drawing:6,ms:65,phase:'落槌'},
 {drawing:7,ms:95,phase:'回彈'},
 {drawing:9,ms:110,phase:'回彈'},
 {drawing:13,ms:130,phase:'收勢'},
 {drawing:1,ms:160,phase:'收勢'},
] as const;
export const kangquDrummerDrawings=Array.from({length:17},(_,i)=>assetPath(`art/animations/kangqu-drummer-v5/pose-${String(i+1).padStart(2,'0')}.png`));
export const kangquDrummerLeadIn=140,kangquDrummerFade=120;
export const kangquDrummerMotionDuration=kangquDrummerPhrase.reduce((sum,p)=>sum+p.ms,0);
export const kangquDrummerDuration=kangquDrummerLeadIn+kangquDrummerMotionDuration+kangquDrummerFade+140;
export function kangquDrummerPose(time:number){
 let end=kangquDrummerLeadIn;
 for(const pose of kangquDrummerPhrase){end+=pose.ms;if(time<end)return pose;}
 return kangquDrummerPhrase[kangquDrummerPhrase.length-1];
}
