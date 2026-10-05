/** Only subtle water and steam remain as motion layers; banners stay in the painted art. */
export function LivingPainting({enabled}: {enabled: boolean}) {
  return <svg className={`living-painting ${enabled ? '' : 'is-still'}`} viewBox="0 0 1000 625.47" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <clipPath id="river-mask"><path d="M690 155Q805 137 960 178L1000 209L1000 242Q919 241 839 292Q753 329 653 324L635 310Q715 265 720 202Z"/></clipPath>
      <filter id="steam-soft"><feGaussianBlur stdDeviation="1.1"/></filter>
    </defs>
    <g clipPath="url(#river-mask)" className="river-light">
      {[0, 1, 2].map(i => <g key={i} className={`river-ripples ripple-${i}`} fill="none" stroke="#eee0bd" strokeWidth=".65" strokeLinecap="round">
        <path d="M772 217q8-2 16 0m13 1q5-2 11 0M848 245q12-3 23-1m16 4q8-2 17-1M722 294q11-2 20 0M795 275q11-3 23 0"/>
        <path d="M853 196q10-2 18 0M953 209q9-2 20 0M924 231q5-2 13 0"/>
      </g>)}
    </g>
    <g className="steam" fill="none" stroke="#e9e4ce" strokeWidth="2.3" strokeLinecap="round" filter="url(#steam-soft)">
      <path className="steam-wisp wisp-one" d="M444 380c-5-7 5-11 0-18s-2-11 2-17"/>
      <path className="steam-wisp wisp-two" d="M445 380c3-6-4-9-1-17s6-10 2-16"/>
    </g>
  </svg>;
}
