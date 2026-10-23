/** Calibrated against full-scroll.jpg at its native 6455×1378 size, including mounting.
 * The single-character 紹 / 興 squares are at the very bottom, y=1274–1377.
 * The multi-character impression at y=1093–1171 is a different collector's seal.
 * Observation, click target, leader and confirmation must share these coordinates.
 */
export const zanhuaSeal={
 at:[554,1326] as [number,number],
 // Label each impression, rather than placing one dot at the lower corner of 紹.
 labelAt:[554,1302] as [number,number],
 centers:[[554,1302],[555,1355]] as [number,number][],
 hit:[[525,1271],[584,1271],[584,1378],[525,1378]],
 path:'M529 1277 L576 1274 L579 1326 L529 1328 Z M530 1334 L578 1332 L581 1377 L531 1377 Z',
};

/** Main-story clues: the three clear original impressions on the pale left mounting.
 * Labels describe visible shapes; individual inscriptions are not assigned without verification.
 */
export const zanhuaCollectorSeals=[
 {id:'collector-round',label:'圓形收藏印',x:330,y:906,width:65,height:67},
 {id:'collector-square',label:'方形收藏印',x:331,y:1026,width:64,height:58},
 {id:'collector-large',label:'較大收藏印',x:319,y:1143,width:90,height:96},
].map(seal=>({...seal,at:[seal.x+seal.width/2,seal.y+seal.height/2] as [number,number],
 region:{points:[[seal.x,seal.y],[seal.x+seal.width,seal.y],[seal.x+seal.width,seal.y+seal.height],[seal.x,seal.y+seal.height]].map(([x,y])=>({x:x/6455,y:y/1378}))},
 path:`M${seal.x} ${seal.y} h${seal.width} v${seal.height} h${-seal.width} Z`,
}));
export const zanhuaMountingSeals=zanhuaCollectorSeals.map(({x,y,width,height})=>({x,y,width,height}));
export function resolveZanhuaCollectorSeal(point:{x:number;y:number},scale=1){
 const padding=6/scale;
 return zanhuaCollectorSeals.find(s=>point.x>=s.x-padding&&point.x<=s.x+s.width+padding&&point.y>=s.y-padding&&point.y<=s.y+s.height+padding);
}

/** Player-only game overlay on blank mounting, beside the historical linked seal.
 * Bounds (422,1097)–(486,1161) avoid the original seals and painting edge at x=500.
 * Never baked into the historical reproduction or counted as a collection item.
 */
export const zanhuaPlayerSeal={x:454,y:1129,size:64};
