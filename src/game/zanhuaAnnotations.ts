import {zanhuaSeal} from './zanhuaSeal.ts';
/** Native reproduction coordinates; labels describe visible evidence, not recovered identities. */
export type ZanhuaAnnotation={id:string;label:string;at:[number,number];body:string;source:number};
const a=(id:string,label:string,at:[number,number],body:string,source=1):ZanhuaAnnotation=>({id,label,at,body,source});
const gauze=a('gauze','寬袖紗衣',[3220,410],'外層衣袖寬大，薄衣之內仍透出手臂與裡衣。先沿衣袖的外緣，再找手臂的線，便能分清這兩層。');
const waist=a('waist','高束裙腰',[3090,480],'紅色裙腰束在胸際，並非通常想像的腰部。下方長裙與外層紗衣分開描繪；這是畫中盛裝的線索，不能當作所有唐代女子的日常穿法。');
const scarf=a('scarf','花紋披帛',[3240,780],'披帛是繞在肩臂間的長帶，向下垂落，並不是另一隻衣袖。沿着花紋追看它的走向，再與有袖口的紗衣比較。');
const skirt=a('skirt','曳地長裙',[3420,1300],'裙襬延伸到地面，與薄紗外衣疊在一起。寬袖、長裙、披帛共同構成這身盛裝；不能只用一件衣服的名字概括全部。');
export const zanhuaAnnotations:ZanhuaAnnotation[][][]=[
 [[a('red-skirt','紅色裙襬',[5330,1190],'深色外衣之外露出紅裙，裙襬向地面鋪開。先分辨內層裙色，再看外層衣線，便能讀出盛裝的疊穿。'),a('dark-gauze','寬袖外衣',[5850,755],'外衣有寬大的袖部，與內層紅裙並非同一件衣物。畫中女子的遊賞裝束，與侍女的執扇身分還需並看。')]],
 [[waist,gauze,scarf],[scarf,gauze,skirt],[a('ribbon','紅帶束髻',[3715,460],'侍女以紅帶約束雙髻，與簪花女子的高髻不同。髮式、頭飾及手中器物一起，幫助辨認畫中的侍奉角色。'),a('fan','長柄扇',[4050,510],'扇面與長柄連起雙手的姿勢。比較手中花與手中扇，才能看出遊賞者和侍奉者的差別。')]],
 [[a('high-hair','高髻',[1215,205],'高髻把頭部輪廓向上延伸。館方介紹指出，這類高髻可能藉「義髻」增加高度；它不只是把全部真髮盤得更高。',0),a('hair-flower','髻上簪花',[1350,66],'大朵花飾位於髻上，與髮髻和細小飾物疊在一起。這裡先辨認簪花的位置，不憑複製圖強定花種。',0),a('hair-ornament','金色髮飾',[1350,160],'高髻旁可見金色細線的裝飾。這是原畫中的顏色線索；單憑畫面，不能確定器物材質或每件飾物的名稱。',0)],
 [a('seal','紹興連珠印',zanhuaSeal.at,'兩方相連的紅印是後世收藏的線索，不是畫中女子的名字，也不是畫家署名。它把我們帶到南宋內府的收藏歷史。',0)]],
];

export const zanhuaDressComparison:ZanhuaAnnotation={id:'tang-dress',label:'唐代女服的不同面貌',at:[3090,480],body:'唐代女服並非只有寬袖長裙。國博展覽也呈現窄袖襦衫配裙、披帛，以及胡服、男裝等形象。衣着隨身分、場合與時期改變；本幅可作貴族盛裝的線索，不能概括所有唐代婦女。',source:5};
