import {lanternLocation} from './lanternFestival.ts';

export const lanternEmperorMotions=[
  {id:'first',tile:9,label:'坐看爆竹',focus:lanternLocation(9,1170,455),hit:[1080,305,190,320],
    speech:'庭前的爆竹，你也來看看？',action:'朝庭前轉頭，袖臂隨抬手一起回應。'},
  {id:'second',tile:1,label:'站看街市',focus:lanternLocation(1,385,610),hit:[290,450,190,310],
    speech:'宮中也有買賣，你可曾留意？',action:'轉向街市，從腰旁抬起袖臂示意。'},
  {id:'third',tile:5,label:'坐看表演',focus:lanternLocation(5,115,555),hit:[25,390,170,320],
    speech:'這一卷裡，你已三次尋得朕。',action:'朝庭院轉頭，抬起袖臂向外示意。'},
] as const;
