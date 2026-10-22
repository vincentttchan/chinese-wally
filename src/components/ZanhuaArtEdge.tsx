import {zanhuaArtEdges} from '../game/zanhuaArtEdges.ts';

/** Paths share the atlas coordinate system with the actual transparent artwork. */
export function ZanhuaArtEdge({asset}:{asset:string}){
 return <g className="zanhua-art-edge" aria-hidden="true">{(zanhuaArtEdges[asset]??[]).map((d,n)=><g key={n}><path d={d} pathLength="1" className="zanhua-art-edge-halo"/><path d={d} pathLength="1" className="zanhua-art-edge-ink"/></g>)}</g>;
}
