import {zanhuaP4GauzePath,zanhuaP4ScarfPath} from './zanhuaP4OuterwearContours.ts';
import {zanhuaP4SkirtPath} from './zanhuaP4SkirtContour.ts';
import {zanhuaAnnotations} from './zanhuaAnnotations.ts';
import type {ZanhuaAnnotation} from './zanhuaAnnotations.ts';
type DressPart=Pick<ZanhuaAnnotation,'id'|'label'|'body'|'source'>&{path:string;hitPath?:string;layer:string};
type GarmentLayer={id:string;label:string;crop:[number,number,number,number];atlasPath?:string;path:string;anchor:[number,number];relation:string};
type DressStudy={name:string;title:string;image:string;original:string;width:number;height:number;parts:DressPart[];atlas:string;atlasWidth:number;atlasHeight:number;layers:GarmentLayer[]};
const item=(person:number,id:string,path:string):DressPart=>({...zanhuaAnnotations[person].flat().find(part=>part.id===id)!,path,layer:id==='waist'||id==='skirt'||id==='red-skirt'?'skirt':(id==='scarf'||id==='floral-scarf')?'scarf':'gown'});
export const zanhuaDressStudies:DressStudy[]=[
 {name:'逗犬女子',title:'紅裙之外，還有幾層？',image:'art/zanhua/studies/P1-dress-study-v1.png',original:'art/zanhua/studies/P1-dress-original.png',width:968,height:1625,atlas:'art/zanhua/studies/P1-dress-layers-v1.png',atlasWidth:1942,atlasHeight:809,layers:[],parts:[
  item(0,'dark-gauze',[
   'M604 442 Q582 460 558 493 Q539 522 543 557 L548 614 Q581 639 659 637 L670 649 L647 581 L627 523 Z',
   'M710 392 Q743 402 783 426 L799 448 L779 475 L773 525 L756 572 L741 520 Q731 465 719 418 Z',
   'M856 519 Q883 553 894 609 Q909 668 903 728 Q899 765 905 790 L925 995 Q929 1086 923 1134 Q950 1193 956 1268 Q967 1337 948 1386 Q936 1423 908 1429 Q884 1433 866 1401 L854 1339 Q828 1297 832 1257 L835 1215 L844 1162 L842 1113 Q831 1075 824 1027 Q816 976 801 925 Q816 909 813 881 Q810 823 789 801 L760 790 Q751 757 723 738 L714 699 L731 697 L728 656 Q752 630 773 640 L796 635 Q820 648 838 629 Q850 607 852 581 Z',
   'M557 728 Q602 749 664 744 L719 742 Q750 750 777 786 L774 794 Q756 811 752 828 Q761 869 759 905 L744 942 Q743 972 732 1005 Q721 1070 714 1137 L696 1235 Q684 1283 657 1332 Q626 1370 570 1399 L500 1436 Q440 1478 367 1490 L322 1489 Q306 1460 319 1432 Q285 1398 287 1367 L273 1321 Q306 1303 336 1270 Q393 1203 432 1130 Q469 1066 505 984 Q537 931 546 902 L551 829 Q552 776 557 728 Z',
  ].join(' ')),
  item(0,'red-skirt',[
   'M650 552 Q685 526 731 511 L755 602 Q711 609 671 638 Z',
   'M14 1437 Q26 1415 77 1400 Q110 1372 177 1370 Q204 1338 232 1335 Q254 1331 273 1322 L287 1368 Q285 1397 319 1432 Q309 1461 323 1490 Q412 1505 499 1436 L554 1408 Q515 1456 459 1481 Q408 1526 364 1546 Q315 1559 282 1543 Q224 1560 169 1545 Q92 1548 44 1509 Q6 1487 14 1437 Z',
   'M768 925 Q782 931 796 924 Q808 973 818 1027 Q825 1075 837 1113 Q836 1132 807 1145 Q774 1158 749 1133 L728 1113 Q734 1067 746 1020 Q757 970 768 925 Z',
  ].join(' ')),
  item(0,'floral-scarf',[
    'M799 441 Q830 463 848 494 Q863 515 854 552 Q849 587 837 612 Q829 631 816 635 L792 633 L771 640 Q776 613 781 576 Q787 532 797 504 Q808 465 799 441 Z',
    'M542 553 Q522 570 520 602 Q517 636 531 654 Q544 677 572 693 L553 713 Q535 701 529 677 Q520 657 520 635 Q516 612 520 589 Q528 567 542 553 Z',
    'M524 623 Q557 648 602 649 Q627 649 659 656 Q623 663 609 680 L580 701 L564 701 Q538 685 528 665 Q523 651 524 623 Z',
    'M558 725 L585 706 Q601 709 618 695 Q643 682 665 677 L691 681 Q701 701 715 738 Q687 740 658 734 Q599 728 558 725 Z',
   ].join(' ')),
 ]},
 {name:'持花女子',title:'從薄紗看懂盛裝',image:'art/zanhua/studies/P4-dress-study-v1.png',original:'art/zanhua/studies/P4-dress-original.png',width:937,height:1678,atlas:'art/zanhua/studies/P4-dress-layers-v1.png',atlasWidth:1774,atlasHeight:887,layers:[],parts:[
  item(1,'waist','M 344 497 Q 386 492 431 519 L 399 604 338 584 327 555 Z'),{...item(1,'gauze','M 159 500 L 209 524 232 635 224 920 251 1170 212 1410 Q 179 1515 66 1520 L 40 1490 59 1397 114 1270 127 1080 122 705 136 561 Z M 350 600 L 396 618 431 765 442 1040 489 1355 568 1560 Q 444 1654 263 1609 L 283 1530 344 1390 359 1230 319 951 315 707 Z'),hitPath:'M 138 660 L 218 661 221 1120 176 1330 112 1360 128 1170 Z'},item(1,'scarf','M 400 613 Q 467 645 575 574 L 581 685 509 702 539 924 559 1100 607 1317 578 1323 477 1244 446 1143 436 916 421 722 Z M 225 536 L 269 529 297 591 294 735 303 976 261 951 227 875 224 675 Z'),item(1,'skirt','M 687 1401 Q 759 1418 817 1465 Q 852 1502 906 1538 Q 943 1564 928 1605 Q 876 1663 713 1654 L 554 1628 Q 611 1590 654 1540 L 738 1493 Q 715 1455 687 1401 Z'),
 ]},
];

// One garment, one interaction: both visible ends of the skirt select this same study.
const flowerDress=zanhuaDressStudies[1];
flowerDress.parts=[{id:'long-skirt',layer:'skirt',label:'高束長裙',source:1,
 body:'胸前的紅邊和腳邊的裙襬，是同一件長裙的兩端。唐代有把裙腰束高至胸前的穿法，裙身可一直垂到地面。',
 path:zanhuaP4SkirtPath},...flowerDress.parts.filter(part=>part.id!=='waist'&&part.id!=='skirt')];

flowerDress.parts=flowerDress.parts.map(part=>part.id==='gauze'?{...part,path:zanhuaP4GauzePath,hitPath:undefined}:part.id==='scarf'?{...part,path:zanhuaP4ScarfPath,hitPath:undefined}:part);

// Waist and hem are two observations on the same inner skirt, not separate garments.
for (const [index,study] of zanhuaDressStudies.entries()) {
 const paths=(ids:string[])=>study.parts.filter(part=>ids.includes(part.id)).map(part=>part.path).join(' ');
 study.layers=[
  {id:'skirt',label:'內層 · 長裙',crop:index===0?[0,0,818,809]:[0,0,705,887],path:index===0?paths(['red-skirt']):paths(['long-skirt']),anchor:index===0?[180,1460]:[380,550],relation:'裙腰與裙襬屬於同一件長裙；外罩衣物遮住了其中一部分。'},
  {id:'gown',label:'外層 · 寬袖罩衣',crop:index===0?[818,0,698,809]:[705,0,790,887],atlasPath:index===1?'M 705 0 H 1435 V 710 L 1495 765 V 887 H 705 Z':undefined,path:paths(index===0?['dark-gauze']:['gauze']),anchor:index===0?[490,1200]:[177,1000],relation:'寬袖罩在長裙外，和內層長裙分開看，才能分清交疊的衣線。'},
  {id:'scarf',label:'肩臂間 · 披帛',crop:index===0?[1516,0,426,809]:[1435,0,339,887],atlasPath:index===1?'M 1435 0 H 1774 V 887 H 1530 V 755 L 1435 740 Z':undefined,path:paths(index===0?['floral-scarf']:['scarf']),anchor:index===0?[820,560]:[502,1040],relation:'披帛是繞在肩臂間的長帶；展開看它的形狀，再與寬大的衣袖比較。'},
 ];
}
