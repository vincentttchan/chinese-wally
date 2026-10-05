import { useState } from 'react';
import type { SceneActor } from '../game/level.ts';

/** Reuse the actual painted witness, keeping the portrait aligned with the scene. */
export function PaintedPortrait({actor, image}: {actor: SceneActor; image: string}) {
  const [aspect, setAspect] = useState(3);
  const height = Math.max(.25, actor.height * 1.18);
  const width = height / aspect * 56 / 76;
  return <span className="painted-portrait" aria-hidden="true">
    <img src={image} alt="" draggable={false} onLoad={event => setAspect(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)} style={{
      width: `${100 / width}%`, height: `${100 / height}%`,
      left: `${50 - actor.x / width * 100}%`, top: `${50 - (actor.y - .01) / height * 100}%`,
    }}/>
  </span>;
}
