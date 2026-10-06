import type { Point } from '../game/geometry.ts';

/** Faint steam follows each painting's actual pot rather than a shared scene location. */
export function LivingPainting({enabled, steam = {x: .406, y: .273}}: {enabled: boolean; steam?: Point | null}) {
  if (!steam) return null;
  return <svg className={`living-painting ${enabled ? '' : 'is-still'}`} viewBox="0 0 1000 333.333" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <filter id="steam-soft"><feGaussianBlur stdDeviation="1.1"/></filter>
    </defs>
    <g className="steam" transform={`translate(${steam.x * 1000} ${steam.y * 333.333})`} fill="none" stroke="#e9e4ce" strokeWidth="1.2" strokeLinecap="round" filter="url(#steam-soft)">
      <path className="steam-wisp wisp-one" d="M0 0c-2-4 2-6 0-10s-1-6 1-9"/>
      <path className="steam-wisp wisp-two" d="M1 0c2-3-2-5-1-9s3-5 1-8"/>
    </g>
  </svg>;
}
