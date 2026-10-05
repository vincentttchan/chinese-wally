/** Faint tea steam is anchored to the painted pot; banners remain in the artwork. */
export function LivingPainting({enabled}: {enabled: boolean}) {
  return <svg className={`living-painting ${enabled ? '' : 'is-still'}`} viewBox="0 0 1000 333.333" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <filter id="steam-soft"><feGaussianBlur stdDeviation="1.1"/></filter>
    </defs>
    <g className="steam" fill="none" stroke="#e9e4ce" strokeWidth="1.2" strokeLinecap="round" filter="url(#steam-soft)">
      <path className="steam-wisp wisp-one" d="M402 96c-2-4 2-6 0-10s-1-6 1-9"/>
      <path className="steam-wisp wisp-two" d="M403 96c2-3-2-5-1-9s3-5 1-8"/>
    </g>
  </svg>;
}
