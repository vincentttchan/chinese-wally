import { useState } from 'react';
import type { PaintingTile, SceneActor } from '../game/level.ts';

/** Reuse the actual painted witness, keeping the portrait aligned with the scene. */
export function PaintedPortrait({actor, image, tiles}: {actor: SceneActor; image: string; tiles?: PaintingTile[]}) {
  const tile = tiles?.find(part => actor.x >= part.x && actor.x < part.x + part.width);
  const source = tile?.image ?? image;
  const x = tile ? (actor.x - tile.x) / tile.width : actor.x;
  const [aspect, setAspect] = useState(tile ? 1 : 3);
  const height = Math.max(.1, actor.height * 1.18);
  const width = height / aspect * 56 / 76;
  return <span className="painted-portrait" aria-hidden="true">
    <img src={source} alt="" draggable={false} onLoad={event => setAspect(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)} style={{
      width: `${100 / width}%`, height: `${100 / height}%`,
      left: `${50 - x / width * 100}%`, top: `${50 - (actor.y - .01) / height * 100}%`,
    }}/>
  </span>;
}
