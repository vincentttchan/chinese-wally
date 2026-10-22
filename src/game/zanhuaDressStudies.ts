import {zanhuaP4GauzePath,zanhuaP4ScarfPath} from './zanhuaP4OuterwearContours.ts';
import {zanhuaP4SkirtPath} from './zanhuaP4SkirtContour.ts';
import {zanhuaAnnotations} from './zanhuaAnnotations.ts';
import type {ZanhuaAnnotation} from './zanhuaAnnotations.ts';
type DressPart=Pick<ZanhuaAnnotation,'id'|'label'|'body'|'source'>&{path:string;hitPath?:string;layer:string};
type GarmentLayer={id:string;label:string;crop:[number,number,number,number];atlasPath?:string;path:string;anchor:[number,number];relation:string};
type DressStudy={name:string;title:string;image:string;original:string;width:number;height:number;parts:DressPart[];atlas:string;atlasWidth:number;atlasHeight:number;layers:GarmentLayer[]};
const item=(person:number,id:string,path:string):DressPart=>({...zanhuaAnnotations[person].flat().find(part=>part.id===id)!,path,layer:id==='waist'||id==='skirt'||id==='red-skirt'?'skirt':id==='scarf'?'scarf':'gown'});
export const zanhuaDressStudies:DressStudy[]=[
 {name:'逗犬女子',title:'紅裙之外，還有幾層？',image:'art/zanhua/studies/P1-dress-study-v1.png',original:'art/zanhua/studies/P1-dress-original.png',width:968,height:1625,atlas:'art/zanhua/studies/P1-dress-layers-v1.png',atlasWidth:1942,atlasHeight:809,layers:[],parts:[
  {...item(0,'dark-gauze','M 705 645 Q 838 628 892 701 L 952 1300 Q 971 1450 895 1455 L 861 1160 811 895 750 780 Q 676 865 613 1060 L 435 1456 Q 351 1535 292 1450 L 270 1360 458 1125 553 758 Z'),hitPath:'M 490 1050 L 640 1010 520 1250 342 1420 310 1380 Z'},
  item(0,'red-skirt','M 269 1330 L 300 1460 Q 367 1540 549 1455 L 392 1540 Q 141 1578 12 1500 L 16 1457 Q 135 1380 269 1330 Z'),
  {id:'floral-scarf',layer:'scarf',label:'花紋披帛',source:1,hitPath:'M 797 494 L 834 515 847 608 803 625 Z',body:'花紋長帶繞過肩臂，與深色寬袖交疊。它的走向和袖口不同；把長帶與衣袖分開追看，便能讀出盛裝的層次。',path:'M 776 445 Q 850 465 860 595 L 849 642 797 643 785 545 Z M 527 570 Q 527 638 604 661 L 701 714 709 749 583 728 Q 504 693 519 610 Z'},
 ]},
 {name:'持花女子',title:'從薄紗看懂盛裝',image:'art/zanhua/studies/P4-dress-study-v1.png',original:'art/zanhua/studies/P4-dress-original.png',width:937,height:1678,atlas:'art/zanhua/studies/P4-dress-layers-v1.png',atlasWidth:1774,atlasHeight:887,layers:[],parts:[
  item(1,'waist','M 344 497 Q 386 492 431 519 L 399 604 338 584 327 555 Z'),{...item(1,'gauze','M 159 500 L 209 524 232 635 224 920 251 1170 212 1410 Q 179 1515 66 1520 L 40 1490 59 1397 114 1270 127 1080 122 705 136 561 Z M 350 600 L 396 618 431 765 442 1040 489 1355 568 1560 Q 444 1654 263 1609 L 283 1530 344 1390 359 1230 319 951 315 707 Z'),hitPath:'M 138 660 L 218 661 221 1120 176 1330 112 1360 128 1170 Z'},{...item(1,'scarf','M 400 613 Q 467 645 575 574 L 581 685 509 702 539 924 559 1100 607 1317 578 1323 477 1244 446 1143 436 916 421 722 Z M 225 536 L 269 529 297 591 294 735 303 976 261 951 227 875 224 675 Z'),hitPath:'M 456 747 L 501 755 541 1135 562 1240 489 1190 470 1070 Z'},item(1,'skirt','M 687 1401 Q 759 1418 817 1465 Q 852 1502 906 1538 Q 943 1564 928 1605 Q 876 1663 713 1654 L 554 1628 Q 611 1590 654 1540 L 738 1493 Q 715 1455 687 1401 Z'),
 ]},
];

// One garment, one interaction: both visible ends of the skirt select this same study.
const flowerDress=zanhuaDressStudies[1];
flowerDress.parts=[{id:'long-skirt',layer:'skirt',label:'高束長裙',source:1,
 body:'紅色裙腰高束在胸際，長裙向下延伸，裙襬鋪展到地面。中段被外罩紗衣遮住；胸前與腳邊露出的紅色，屬於同一件長裙。',
 path:zanhuaP4SkirtPath},...flowerDress.parts.filter(part=>part.id!=='waist'&&part.id!=='skirt')];

flowerDress.parts=flowerDress.parts.map(part=>part.id==='gauze'?{...part,path:zanhuaP4GauzePath,hitPath:undefined}:part.id==='scarf'?{...part,path:zanhuaP4ScarfPath,hitPath:undefined}:part);

// Waist and hem are two observations on the same inner skirt, not separate garments.
for (const [index,study] of zanhuaDressStudies.entries()) {
 const paths=(ids:string[])=>study.parts.filter(part=>ids.includes(part.id)).map(part=>part.path).join(' ');
 study.layers=[
  {id:'skirt',label:'內層 · 長裙',crop:index===0?[0,0,818,809]:[0,0,705,887],path:index===0?paths(['red-skirt'])+' M 654 549 L 736 511 754 626 683 650 Z M 766 937 Q 823 982 828 1125 L 751 1155 732 1090 Z':paths(['long-skirt']),anchor:index===0?[180,1460]:[380,550],relation:'裙腰與裙襬屬於同一件長裙；外罩衣物遮住了其中一部分。'},
  {id:'gown',label:'外層 · 寬袖罩衣',crop:index===0?[818,0,698,809]:[705,0,790,887],atlasPath:index===1?'M 705 0 H 1435 V 710 L 1495 765 V 887 H 705 Z':undefined,path:paths(index===0?['dark-gauze']:['gauze']),anchor:index===0?[490,1200]:[177,1000],relation:'寬袖罩在長裙外，和內層長裙分開看，才能分清交疊的衣線。'},
  {id:'scarf',label:'肩臂間 · 披帛',crop:index===0?[1516,0,426,809]:[1435,0,339,887],atlasPath:index===1?'M 1435 0 H 1774 V 887 H 1530 V 755 L 1435 740 Z':undefined,path:paths(index===0?['floral-scarf']:['scarf']),anchor:index===0?[820,560]:[502,1040],relation:'披帛是繞在肩臂間的長帶；展開看它的形狀，再與寬大的衣袖比較。'},
 ];
}
