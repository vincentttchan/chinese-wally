import type {SourcePassage} from './qingming.ts';

export type ReadingPhrase={text:string;meaning:string};
/** Punctuation and omissions belong to the cited extract; explanations are modern reading aids. */
const phrases:Record<string,ReadingPhrase[]>={
 河道:[
  {text:'運東南之糧，',meaning:'從東南地區運來糧食。這裏說的是汴河的運輸。'},
  {text:'凡東南方物，自此入京城，',meaning:'東南各地的物產，經由這條河進入京城。「方物」指各地物產。'},
  {text:'公私仰給焉。',meaning:'官府與民間都依靠這些供應。「仰給」就是依靠供應。'},
 ],
 酒樓:[
  {text:'凡京師酒店，',meaning:'這裏描寫京城的酒店，也就是賣酒、供人飲食的店舖。'},
  {text:'門首皆縛彩樓歡門。',meaning:'店門前搭起彩飾門架，稱為「彩樓歡門」。回畫中看看入口的裝飾。'},
 ],
 清明節:[
  {text:'紙馬鋪皆於當街……',meaning:'紙馬鋪把展示設在街邊。紙馬是祭祀用紙製品；省略部分的字詞校注放在延伸閱讀。'},
  {text:'疊成樓閣之狀。',meaning:'書中描述紙製品層疊成樓閣的樣子。畫中的陳列可以與它比較，但不能直接當作同一形態。'},
 ],
 馬行街北諸醫鋪:[
  {text:'「口齒咽喉藥」',meaning:'這處節錄提到口、齒、咽喉方面的用藥。它是書中其他醫鋪的例子。'},
  {text:'　「醫小兒」',meaning:'另一處節錄提到小兒醫療。兩處文字來自不同記載，不能都算作畫中趙太丞家的專科。'},
 ],
 大內前州橋東街巷:[
  {text:'南方官員商賈兵級，',meaning:'書中列出來自南方的官員、商人與軍中人員。「商賈」就是商人。'},
  {text:'皆於此安泊。',meaning:'他們在這一帶住宿。「此」指書中保康門一帶，不能直接當作原畫的地址。'},
 ],
 東角樓街巷:[
  {text:'餘皆真珠、匹帛、香藥鋪席。',meaning:'書中還列出珠寶、布帛及香藥等店舖。「匹帛」指紡織品，這些是不同種類的專門生意。'},
 ],
};
export const readingPhrases=(source:SourcePassage):ReadingPhrase[]=>phrases[source.title]??[{text:source.quote,meaning:source.gloss}];

/** The relevant short passage is essential; the remaining annotations are optional. */
export const requiredReadingIndices=(source:SourcePassage):number[]=>{
 if(source.title==='河道'||source.title==='酒樓'||source.title==='大內前州橋東街巷')return [1];
 if(source.title==='清明節'||source.title==='馬行街北諸醫鋪')return [0,1];
 return [0];
};
export const readingComplete=(source:SourcePassage,read:readonly number[])=>requiredReadingIndices(source).every(index=>read.includes(index));
export const sourceReadingKey=(storyId:string,step:number)=>`${storyId}:${step}`;
