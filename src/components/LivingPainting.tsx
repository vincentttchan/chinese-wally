/** Effects are anchored to the original scroll, so they pan and zoom with it. */
export function LivingPainting({image, enabled}: {image: string; enabled: boolean}) {
  return <svg className={`living-painting ${enabled ? '' : 'is-still'}`} viewBox="0 0 1000 333.333" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <clipPath id="river-mask"><path d="M818 81 Q869 71 923 69 L1000 62 L1000 169 Q959 143 932 131 Q899 116 869 113 Q849 108 831 96Z"/></clipPath>
      <clipPath id="tea-banner-mask"><path d="M389 119 L413 119 L411 168 L390 167Z"/></clipPath>
      <filter id="steam-soft"><feGaussianBlur stdDeviation="1.1"/></filter>
    </defs>
    <g clipPath="url(#river-mask)" className="river-light">
      {[0, 1, 2].map(i => <g key={i} className={`river-ripples ripple-${i}`} fill="none" stroke="#eee0bd" strokeWidth=".65" strokeLinecap="round">
        <path d="M854 94q8-2 16 0m13 1q5-2 11 0M919 106q12-3 23-1m16 4q8-2 17-1M949 131q11-2 20 0M978 151q11-3 23 0"/>
        <path d="M883 82q10-2 18 0M953 88q9-2 20 0M924 121q5-2 13 0"/>
      </g>)}
    </g>
    <g className="tea-banner"><image href={image} width="1000" height="333.333" clipPath="url(#tea-banner-mask)"/></g>
    <g className="steam" fill="none" stroke="#e9e4ce" strokeWidth="2.3" strokeLinecap="round" filter="url(#steam-soft)">
      <path className="steam-wisp wisp-one" d="M416 194c-5-7 5-11 0-18s-2-11 2-17"/>
      <path className="steam-wisp wisp-two" d="M417 194c3-6-4-9-1-17s6-10 2-16"/>
      <path className="steam-wisp wisp-three" d="M538 204c-3-7 4-11 1-18s-4-9 0-15"/>
    </g>
    <g className="chimney-smoke" fill="none" stroke="#d4cfb5" strokeWidth="3" strokeLinecap="round" filter="url(#steam-soft)">
      <path className="smoke-wisp" d="M606 113c-4-8 3-12 1-19s-4-10 0-16"/>
      <path className="smoke-wisp smoke-second" d="M609 113c3-7-3-11 0-17s4-9 1-16"/>
    </g>
  </svg>;
}
