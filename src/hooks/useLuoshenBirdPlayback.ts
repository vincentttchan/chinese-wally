import {useLuoshenAnimationPlayback} from './useLuoshenAnimationPlayback.ts';
export type BirdPlaybackMode='idle'|'preparing'|'playing'|'still'|'failed';
/** Compatibility for the original bird-only controls; the chapter now shares one owner. */
export function useLuoshenBirdPlayback(context:string|null,cameraBusy:boolean,pendingCollections:number){
 const player=useLuoshenAnimationPlayback(context,cameraBusy,pendingCollections);
 return {mode:player.mode as BirdPlaybackMode,play:()=>player.play('bird'),original:player.original,finish:player.finish,fail:player.fail,close:player.close};
}
