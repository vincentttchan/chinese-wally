/** Registration and part coordinates belong to the generated 1254×1254 study. */
export const zanhuaCoiffureRegistration={x:1120,y:9,width:339,size:1254};
export const zanhuaCoiffureParts:Record<string,{at:[number,number];path:string}>={
 'high-hair':{at:[490,760],path:'M350 400 Q440 340 600 345 Q830 355 1000 470 Q1140 580 1120 770 Q1105 882 1020 945 L930 1020 L850 1130 Q840 1000 780 920 Q700 840 610 880 L470 950 L320 1000 Q280 1080 250 1160 L170 1198 L112 1190 L135 1100 Q90 1070 108 980 Q120 780 180 650 Q240 460 350 400 Z'},
 'hair-flower':{at:[910,220],path:'M565 132 L700 58 L830 53 L1005 65 L1130 135 L1205 274 L1190 440 L1100 556 L950 500 L760 434 L604 349 L545 245 Z'},
 'hair-ornament':{at:[925,530],path:'M734 416 L850 410 L1020 434 L1062 557 L1045 731 L955 816 L806 781 L660 800 L630 720 L740 673 L751 534 L710 470 Z M355 155 L456 111 L543 170 L549 330 L470 403 L350 402 L346 289 Z M244 533 L323 537 L324 647 L234 658 Z M100 1027 L176 1010 L186 1084 L110 1098 Z'},
};
export const zanhuaCoiffurePoint=(id:string):[number,number]=>{
 const r=zanhuaCoiffureRegistration,p=zanhuaCoiffureParts[id].at;
 return [r.x+p[0]*r.width/r.size,r.y+p[1]*r.width/r.size];
};

/** Schematic separated components, not a reconstruction of historical objects. */
export const zanhuaCoiffureLayers={image:'art/zanhua/studies/P6-coiffure-layers-v1.png',width:2172,height:724,parts:{
 'high-hair':[0,0,845,724], 'hair-flower':[845,0,745,724], 'hair-ornament':[1590,0,582,724],
} as Record<string,[number,number,number,number]>};
