import {useId} from 'react';
import {lanternJournalAtlas,lanternJournalItems} from '../game/lanternCollection.ts';

/** Supports existing atlas motifs and individual transparent collectible art. */
export type CollectionArtwork=(typeof lanternJournalItems)[string];
export function LanternCollectionImage({findingId,artwork}:{findingId:string;artwork?:CollectionArtwork}){
  const item=artwork??lanternJournalItems[findingId];
  const filterId=`collection-cutout-${useId().replace(/:/g,'')}`;
  if(item.frame){
    const frame=item.frame;
    return <svg viewBox={frame.rect.join(' ')} width="100%" height="100%" aria-hidden="true" focusable="false" style={{position:'absolute',inset:0}}>
      <defs><filter id={filterId} colorInterpolationFilters="sRGB"><feComponentTransfer><feFuncA type="linear" slope="1.333333" intercept="-.333333"/></feComponentTransfer></filter></defs>
      <image href={frame.image} width={frame.width} height={frame.height} filter={`url(#${filterId})`}/>
    </svg>;
  }
  return <>
    {item.image&&<svg width="0" height="0" aria-hidden="true" focusable="false" style={{position:'absolute'}}>
      <defs><filter id={filterId} colorInterpolationFilters="sRGB"><feComponentTransfer><feFuncA type="linear" slope="1.333333" intercept="-.333333"/></feComponentTransfer></filter></defs>
    </svg>}
    <img src={item.image??lanternJournalAtlas} alt="" draggable={false} style={item.image?
      {width:'100%',height:'100%',left:0,top:0,objectFit:'contain',filter:`url(#${filterId})`}:
      {left:`${-(item.index%3)*100}%`,top:`${-Math.floor(item.index/3)*100}%`}}/>
  </>;
}
