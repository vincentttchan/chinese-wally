import {zanhuaSeal,zanhuaCollectorSeals} from './zanhuaSeal.ts';
/** Native reproduction coordinates; labels describe visible evidence, not recovered identities. */
export type ZanhuaAnnotation={id:string;label:string;at:[number,number];body:string;source:number};
const a=(id:string,label:string,at:[number,number],body:string,source=1):ZanhuaAnnotation=>({id,label,at,body,source});
const gauze=a('gauze','寬袖紗衣',[3220,410],'薄紗罩在長裙外，抬手時仍看得見袖中的手臂。到了中晚唐，寬袖成為女裝的流行款式之一。');
const waist=a('waist','高束裙腰',[3090,480],'紅色裙腰束在胸際，並非通常想像的腰部。下方長裙與外層紗衣分開描繪；這是畫中盛裝的線索，不能當作所有唐代女子的日常穿法。');
const scarf=a('scarf','花紋披帛',[3240,780],'臂旁的花紋沿着長帶垂到裙前。唐代女裝可在上衣和長裙外搭一條披帛，讓長帶從肩臂間垂下。');
const skirt=a('skirt','曳地長裙',[3420,1300],'裙襬延伸到地面，與薄紗外衣疊在一起。寬袖、長裙、披帛共同構成這身盛裝；不能只用一件衣服的名字概括全部。');
export const zanhuaAnnotations:ZanhuaAnnotation[][][]=[
 [[a('red-skirt','紅色裙襬',[5330,1190],'紅裙從深色外衣底下露出，裙襬鋪在地上。唐代女裝常見上衣配長裙，裙襬可長至曳地。'),a('dark-gauze','寬袖外衣',[5850,755],'深色寬袖從手腕旁垂下，罩在紅裙外。唐代女裝的袖幅逐漸加寬，寬衣長裙在中晚唐尤其流行。')],[a('floral-scarf','花紋披帛',[5810,466],'紅底花紋在肩頭和臂前各露一段。披帛是唐代女裝可搭在肩臂間的長帶，這一條披在深色寬袖外。')]],
 [[waist,gauze,scarf],[scarf,gauze,skirt],[a('ribbon','紅帶束髻',[3715,460],'紅帛約束雙髻，與其餘女子的高髻、簪花和金飾不同。較簡的束髮配合執扇動作，表現隨侍角色；紅色本身不能視作侍女專用的制度。',1),a('fan','長柄扇',[4050,510],'從扇面沿長柄往下看，就會找到托扇的手。旁邊的女子拈花，她卻一直執着扇。兩人的手，讓你看出她們在這一幕各做甚麼。')]],
 [[a('high-hair','高髻',[1215,205],'唐代女髻有高有低，盤高的髮髻可襯托簪花與釵飾。遼博研究者認為，畫中高髻可能借助「義髻」，也就是另外加戴的髮髻。',0),a('hair-flower','髻上簪花',[1350,66],'唐代女子可把折枝花簪在髮髻間，與簪釵一同妝點。這卷畫中，幾位仕女髻上的花有不同的花形與位置。',0),a('hair-ornament','金色髮飾',[1350,160],'唐代的簪可用來固髻，釵頭也可做成花形或垂掛飾件。畫中髻側可見金色細飾，顏色只能提示裝飾的位置與效果。',6)],
 zanhuaCollectorSeals.map(seal=>a(seal.id,seal.label,seal.at,'印章會留下收藏與鑑賞的痕跡。沿着這類線索與著錄，可追看畫卷先後為梁清標、安岐及清內府收藏的歷史。眼前的紅印不是畫中女子的姓名，也不是畫家落款。',0))],
];

export const zanhuaEarlierSealNote=a('seal','更早的收藏線索',zanhuaSeal.at,'畫心左下另有較淡的「紹興」連珠印。館方以它說明畫卷曾入藏南宋高宗內府。它把畫卷的收藏歷史帶到南宋；印記記下的是收藏，並不是女子的姓名。',0);

export const zanhuaDressComparison:ZanhuaAnnotation={id:'tang-dress',label:'唐代女服的不同面貌',at:[3090,480],body:'唐代女服並非只有寬袖長裙。國博展覽也呈現窄袖襦衫配裙、披帛，以及胡服、男裝等形象。衣着隨身分、場合與時期改變；本幅可作貴族盛裝的線索，不能概括所有唐代婦女。',source:5};
