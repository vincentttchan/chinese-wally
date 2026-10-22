/** Calibrated against full-scroll.jpg at its native 6455×1378 size, including mounting.
 * The two connected impressions run from y=1093 to 1171 (not 1078 to 1180).
 * Observation, click target, leader and confirmation must share these coordinates.
 */
export const zanhuaSeal={
 at:[552,1132] as [number,number],
 // The leader meets the left edge, leaving the faint red characters unobscured.
 labelAt:[524,1132] as [number,number],
 hit:[[523,1090],[581,1090],[581,1174],[523,1174]],
 path:'M526 1093 L575 1093 L576 1133 L527 1133 Z M527 1133 L576 1133 L578 1171 L528 1171 Z',
};

/** Other visible seals on the mounting: excluded from labels/dialogue, not game targets. */
export const zanhuaMountingSeals=[
 {x:330,y:906,width:65,height:67},
 {x:331,y:1026,width:64,height:58},
 {x:319,y:1143,width:90,height:96},
];

/** Player-only game overlay on blank mounting, beside the historical linked seal.
 * Bounds (422,1097)–(486,1161) avoid the original seals and painting edge at x=500.
 * Never baked into the historical reproduction or counted as a collection item.
 */
export const zanhuaPlayerSeal={x:454,y:1129,size:64};
