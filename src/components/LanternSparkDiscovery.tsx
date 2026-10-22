import {LanternCollectionImage} from './LanternCollectionImage.tsx';
import {useEffect} from 'react';
import type {CSSProperties} from 'react';
import type {CollectionArtwork} from './LanternCollectionImage.tsx';
import {lanternFindings} from '../game/lanternCollection.ts';
import '../lantern-spark.css';

export type SparkDiscovery = {
  token: number; newlyCollected: boolean; findingId: string;
  source: {x: number; y: number}; destination: {x: number; y: number};
  frame: {width: number; height: number};
};
const emberDirections = [
  [-27,-25,-30,18], [19,-38,24,15], [35,-10,55,12],
];
const firelight = lanternFindings.find(item=>item.id==='fireworks')!.collectible!;

/** Decorative discovery layer only: it never blocks painting or opens a modal. */
export function LanternSparkDiscovery({discovery,onDone,artwork}:{discovery:SparkDiscovery;onDone:()=>void;artwork?:CollectionArtwork}) {
  const {source,destination,newlyCollected,findingId}=discovery;
  useEffect(()=>{
    const timeout=window.setTimeout(onDone,newlyCollected?3600:2000);
    return ()=>window.clearTimeout(timeout);
  },[]);
  return <div className={`lantern-spark-discovery ${newlyCollected?'is-new':'is-revisit'}`}>
    <div className="lantern-spark-source" aria-hidden="true" style={{left:source.x,top:source.y}}>
      {newlyCollected&&findingId==='fireworks'&&emberDirections.map(([x,y,angle,size],index)=><img key={index} className="lantern-ember" src={firelight.image} alt="" style={{'--ember-x':`${x}px`,'--ember-y':`${y}px`,'--ember-angle':`${angle}deg`,'--ember-delay':`${index*35}ms`,width:size,height:size} as CSSProperties}/>)}
      <span className="lantern-firelight-token lantern-collectible-token" style={{'--token-x':`${destination.x-source.x}px`,'--token-y':`${destination.y-source.y}px`,'--arc-x':`${(destination.x-source.x)*.48}px`,'--arc-y':`${(destination.y-source.y)*.48-85}px`} as CSSProperties}>
        <LanternCollectionImage findingId={findingId} artwork={artwork}/>
      </span>
    </div>

  </div>;
}
