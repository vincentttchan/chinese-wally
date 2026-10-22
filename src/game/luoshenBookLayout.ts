import type {Size} from './geometry.ts';
/** A reading prop beside the painting, rather than a near-full-screen sheet. */
export function luoshenBookLayout(frame:Size){
 const mobile=frame.width<700;
 return {width:Math.min(mobile?344:460,frame.width-(mobile?24:32),mobile?frame.width:frame.width*.46),maxHeight:Math.min(580,Math.floor(frame.height*(mobile?.62:.76)),frame.height-32),mobile};
}
