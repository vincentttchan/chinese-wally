import {zanhuaSeal} from './zanhuaSeal.ts';
import type {PaintingRegion} from './lanternStudy.ts';

const museum='https://www.neac.gov.cn/seac/xwzx/202606/1191211.shtml';
const dress='https://whly.ln.gov.cn/whly/mtjj/2024042415084550898/index.shtml';
export const zanhuaHistorySources=[
 {url:museum,label:'遼博副館長談畫作、衣飾與流傳'},
 {url:dress,label:'遼寧省文旅廳：畫中服飾介紹'},
 {url:'https://zhuanti.mct.gov.cn/lnsbwg2022/detail/7361.html',label:'文化和旅遊部：館藏簡介'},
 {url:'https://artsandculture.google.com/asset/court-ladies-adorning-their-hair-with-flowers-zhou-fang/sgEnDl0cAnX9GQ?hl=zh-tw',label:'作品資料與年代討論'},
 {url:'https://www.chnmuseum.cn/yj/xscg/xslw/201812/t20181224_33161.shtml',label:'中國國家博物館：唐代女服的變化'},
 {url:'https://www.chnmuseum.cn/Portals/0/web/zt/20180904dtfh/',label:'中國國家博物館：大唐風華・長安多麗人'},
];
const region=(points:number[][]):PaintingRegion=>({points:points.map(([x,y])=>({x:x/6455,y:y/1378}))});
type ContextStop={title:string;prompt:string;action:string;answer:string;region:PaintingRegion;focus:{x:number;y:number};ratio:number;source:number;collect?:string};
const stop=(title:string,prompt:string,action:string,answer:string,points:number[][],focus:number[],source:number,ratio=1.15,collect?:string):ContextStop=>({title,prompt,action,answer,region:region(points),focus:{x:focus[0]/6455,y:focus[1]/1378},source,ratio,collect});

/** Each piece of historical context follows an action on the unchanged original scroll. */
export const zanhuaContext:ContextStop[][]=[
 [stop('逗犬之外，還看見怎樣的盛裝？',
  '沿着深色外衣往下看，腳邊露出一抹紅色。輕點拖在地上的紅裙。','點擊逗犬女子的紅色裙襬',
  '紅裙一直曳到地面，外面另罩寬袖紗衣。畫中的貴族女子以多層衣飾盛裝遊賞；這一刻的閒趣，並不代表當時所有婦女的日常。',
  [[5180,1128],[5310,1075],[5420,1120],[5485,1225],[5320,1255],[5165,1220]], [5410,1070],1,.95)],
 [stop('薄衣之內，長裙從哪裡束起？',
  '肩臂仍透過紗衣看得見。再看胸前那片紅色：輕點長裙的高裙腰。','點擊持花女子胸前的紅色裙腰',
  '裙腰高束在胸際，長裙向下垂至地面；寬袖紗衣罩在外層。外衣、裙子與手臂的線條疊在一起，才有眼前這種輕薄而繁複的裝束。',
  [[3050,438],[3135,455],[3130,528],[3060,527]], [3165,500],1),
  stop('這條花紋長帶，也是衣袖嗎？',
  '看她肩臂外側，還有一條帶花紋、向下垂的長帶。點點這件衣飾。','點擊持花女子臂旁的花紋披帛',
  '披在肩臂間的是披帛，有袖口的才是外衣。唐初女服多較窄狹，中晚唐衣袖與裙幅漸寬。把眼前的披帛、寬袖和曳地裙分開看，盛裝的層次與時代趣味便一起浮現。',
  [[3200,530],[3250,515],[3270,720],[3245,985],[3265,1105],[3200,1080]], [3250,785],4,1),
  stop('誰在賞花，誰的手還忙着？',
  '輕點侍女的扇面，再比較兩人的髮髻與手中物。','點擊侍女手中的扇面',
  '五位女子簪花，一位侍女執扇。她用紅帶束髻，手中拿的也不是花。把兩人並看，盛裝遊賞與在旁侍奉的角色便有了區別。',
  [[3855,500],[3890,440],[3980,390],[4075,395],[4155,450],[4160,520],[4130,580],[4050,625],[3960,630],[3875,585]], [3890,580],1,.95,'fan-maid')],
 [stop('花朵之下，髮髻怎會這樣高？',
  '花之外，盤起的頭髮也高高聳起。輕點髮髻，看看這份盛裝如何把目光引向頭部。','點擊斜首女子的高髻',
  '館方介紹以「義髻」解釋這類高髻：用墊髮等方式增加高度。高髻再配簪花與金色髮飾，讓頭部也成為盛裝的一部分。',
  [[1160,120],[1260,90],[1400,115],[1435,200],[1370,265],[1180,285],[1135,240]], [1300,220],0),
  stop('畫上的紅印，留下了誰的名字？',
  '女子沒有姓名題記，畫卷卻留下收藏痕跡。看褐色畫面左下、樹旁兩方相連的小紅印，輕點看看。','點擊畫心左下的紹興連珠印',
  '「紹興」連珠印記錄了南宋內府的收藏，並非畫家署名。本幅沒有作者落款，後世依著錄與風格繫於周昉；作者與成畫年代仍有討論，所以稱「傳周昉作」。',
  zanhuaSeal.hit, zanhuaSeal.at,0,1.6)],
];
export const zanhuaContextEntry=['沿着衣袖看看她的盛裝','從薄衣看懂這身穿搭','從髻飾追看畫作的來歷'];


/** Spoken prompts are fictional; later historical knowledge has its own visible voice. */
export const zanhuaContextDialogue=[
 [{speaker:'P1',invite:'牠總盯着我的手。你呢？沿着我的外衣往下看，可見裙子露出了甚麼顏色？',reply:['紅裙從外衣底下露出來了。這回分得清裡外了嗎？','衣裳一層層，手卻只動一下。牠已經等不及了。'],history:['這是畫中貴族女子盛裝遊賞的片刻，不能代表所有唐代婦女的日常。']}],
 [{speaker:'P4',invite:'隔着紗衣，還看得見手臂。再看看胸前的紅色：你猜長裙從哪裡束起？',reply:['紅色長裙束得高，外面還罩着薄紗。你看清那幾道衣線了嗎？','分開看是幾件衣物，合在一起，才是眼前這身盛裝。'],history:[]},
  {speaker:'P4',invite:'衣袖分清了，肩臂旁這條花紋長帶呢？它也有袖口嗎？',reply:['它是披帛，繞在肩臂間；衣袖則屬於外罩的紗衣。','我的手伸出去拈花，衣袖與披帛便交疊在一起。'],history:['唐初女服多較窄狹，中晚唐的衣袖與裙幅漸寬。畫中這身盛裝，也讓我們看見當時衣飾的審美趣味。']},
  {speaker:'P3',invite:'她有花在手，我的手可沒閒着。看看我拿的是甚麼，再看看我的髮髻。',reply:['是扇。我用紅帶束髻，她們卻在髻上簪花。','扇柄這麼長，兩隻手可得一起照應。再看看她們髻上的花吧。'],history:[]}],
 [{speaker:'P6',invite:'你認得花，可留意過花下面的頭髮？這髮髻為何能盤得這樣高？先點點看。',reply:['花在上，細飾點在髻邊。現在再看我，可還只留意那朵花？'],history:['館方以「義髻」解釋這類高髻：用墊髮等方式增加高度。盛裝的線索，並不只在衣裳。']},
  {speaker:'P6',invite:'你已看出我如何妝點。可我的姓名呢？樹旁那兩方小紅印，會有答案嗎？去看看。',reply:['紅印在畫卷上，卻不是我的名字。要問它從何而來，得循着畫卷的流傳去找。'],history:['那是「紹興」連珠印，記錄南宋內府的收藏，並非畫家署名。','本幅沒有作者落款。後世依著錄與風格繫於周昉，但作者與成畫年代仍有討論，所以稱「傳周昉作」。']}],
];
export const zanhuaInterpretDialogue=[
 '牠仰頭追着長柄，我也垂眼望牠。畫裡只留下一刻，你卻能猜到下一步，對嗎？',
 '我手裡拿的是花，身上的穿戴卻也不止一層。陪我分清，再看看旁人的手。',
 '從衣袖看到頭上了？花、高髻與細飾，也有前後層次。可這些，能告訴你我的名字嗎？',
];
