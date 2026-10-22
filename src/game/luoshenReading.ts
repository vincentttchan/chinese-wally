import type {ReadingPhrase} from './qingmingReading.ts';
import type {SourcePassage} from './qingming.ts';
export const luoshenTextSource='https://digitalarchive.npm.gov.tw/Collection/Detail/20223?dep=P';
export type LuoshenPhrase=ReadingPhrase&{actors:string[]};
/** Ancient text is excerpted; punctuation and short marginal explanations are supplied by the game. */
export const luoshenReading:readonly {title:string;phrases:LuoshenPhrase[]}[]=[
 {title:'岸上初見',phrases:[
  {text:'余情悅其淑美兮，',meaning:'曹植為神女的美好而心動。回看衣袖，分清賦文心緒與原畫姿態。',actors:['C1','attendant-opening-beard']},
  {text:'心震蕩而不怡。',meaning:'心緒震動，難以平靜。這是賦文的感受，不能只憑展袖判定心情。',actors:['C1','attendant-opening-beard']},
 ]},
 {title:'飛鳥與龍形',phrases:[
  {text:'翩若驚鴻，',meaning:'用飛鳥比喻神女的輕盈。看雙鳥展翼，再連著洛神的姿態來讀。',actors:['bird']},
  {text:'婉若遊龍。',meaning:'用游龍比喻神女的婉轉。並看畫中曲線，不把動物當作逐句圖解。',actors:['dragon-first']},
 ]},
 {title:'身影重現',phrases:[
  {text:'進止難期，',meaning:'進退難以預料，是賦文的形容。比對原畫冠髮與姿態，辨認重現的身影。',actors:['L7','C2']},
  {text:'若往若還。',meaning:'像要離去，又像要回來。並看兩處神女，不必把文字與畫面逐句對號。',actors:['L1']},
 ]},
 {title:'兩岸離別',phrases:[
  {text:'恨人神之道殊。',meaning:'遺憾人神道路不同。分離來自賦文；原畫可看身影的位置，不靠表情判定。',actors:['L8','C3']},
 ]},
 {title:'雲車離去',phrases:[
  {text:'載雲車之容裔。',meaning:'賦文寫雲車行進。回看神女與車駕，再看龍形的牽引關係。',actors:['L9','cloud-car']},
 ]},
 {title:'乘舟尋望',phrases:[
  {text:'御輕舟而上溯。',meaning:'駕舟逆水尋望。原畫上層乘舟、下層操船；輕舟不等同精確船型。',actors:['C4','boatman-left']},
 ]},
];
export function luoshenPassage(index:number):SourcePassage{
 const page=luoshenReading[Math.max(0,Math.min(index,luoshenReading.length-1))];
 return {volume:'節錄',title:page.title,quote:page.phrases.map(p=>p.text).join(''),gloss:page.phrases[0].meaning,url:luoshenTextSource,context:'曹植《洛神賦》的文學故事；原畫與賦文對讀，不將神話或遊戲演繹當成史實。'};
}
