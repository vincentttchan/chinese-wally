import {luoshenPeople,luoshenCollectibles,luoshenSteps,luoshenEnding} from './luoshen.ts';
import type {LuoshenState} from './luoshenState.ts';
export type LuoshenLookStop={id:string;label:string;text:string};
export function luoshenJournalActor(id:string){return [...luoshenPeople,...luoshenCollectibles,...luoshenSteps.flatMap(s=>s.observations.map(o=>o.actor)),...luoshenEnding.map(e=>e.observation.actor)].find(a=>a.id===id);}
const collectionStops:Record<string,LuoshenLookStop[]>={
 bird:[{id:'bird-0',label:'開首飛鳥',text:'看飛起的雙翼，再與送別場面的長頸鳥形比較。'},{id:'bird-2',label:'送別鳥形',text:'長頸鳥形伴在低身神女旁，留意牠們的位置。'}],
 ribbon:[{id:'ribbon-0',label:'初見衣帶',text:'衣帶在神女身旁延展，先記住這一處的輪廓。'},{id:'ribbon-1',label:'回身衣帶',text:'順著回轉的身形，看衣帶彎出的長線。'},{id:'ribbon-11',label:'榻前衣帶',text:'神女來到坐榻前，連著她的姿態看衣帶。'},{id:'ribbon-13',label:'低身處衣帶',text:'看人物下方延伸的長線，與初見的輪廓比較。'}],
 dragon:[{id:'dragon-0',label:'開首龍形',text:'這處龍形在神女附近，沒有連著雲車。'},{id:'dragon-1',label:'車前龍形',text:'龍形在雲車前相連，重點是牽引車駕的關係。'}],
 canopy:[{id:'canopy-0',label:'初見隊伍華蓋',text:'先看蓋的輪廓，再順著長柄找到岸上隊伍。'},{id:'canopy-3',label:'雲車華蓋',text:'雲車上方也有華蓋，與人間隊伍的蓋形比較。'},{id:'canopy-2',label:'岸邊華蓋',text:'華蓋又在坐候場面出現，留意它與人物的相對位置。'}],
 boat:[{id:'boat-0',label:'樓船上下層',text:'上層乘舟、下層操船，同一艘船裡有不同角色。'}]
};
export function luoshenCollectionStops(category:string,origin:string):LuoshenLookStop[]{
 const stops=collectionStops[category]??[];
 return stops.some(s=>s.id===origin)?stops:[{id:origin,label:'首次發現的一處',text:'這是你首次找到的位置，再與本類其他場面比較。'},...stops];
}
export function luoshenStoryStops(chapter:string,state:LuoshenState):LuoshenLookStop[]{
 const ashore=state.index===6&&(state.ending>=1||state.endingSeen);
 const homeward=state.index===6&&(state.ending>=3||state.ending===2&&state.endingSeen);
 if(chapter==='encounter'&&state.index>=1)return [
  {id:'sleeve-C1',label:'曹植展袖',text:'衣袖向外展開，與同行者收袖的姿態比較。'},
  {id:'sleeve-attendant',label:'同行者收袖',text:'留意衣袖收在身前的輪廓，再回看曹植展袖。'},
  ...(state.index>=2?collectionStops.bird.slice(0,1):[])];
 if(chapter==='lingering'&&state.index>=3)return [
  {id:'hair-L1',label:'初見髮式',text:'先看雙環高髮，再與坐榻前的神女比一比。'},
  {id:'hair-L7',label:'榻前髮式',text:'髮式相似；連著場景與姿態，辨認重現的身影。'}];
 if(chapter==='farewell'&&state.index>=4)return [
  {id:'L8',label:'低身神女',text:'先看神女低身的姿態，再看與她相對的岸上人。'},
  {id:'C3',label:'岸上送別',text:'曹植與隊伍在岸上，兩處身影共同構成離別場面。'},
  ...(state.index>=5?[{id:'cloud-car',label:'雲車車體',text:'神女乘雲車離去，順著車前看牽引的龍形。'},{id:'dragon-link',label:'牽引龍形',text:'看龍形與車駕相連的位置，不用逐條數清。'}]:[])];
 if(chapter==='longing'&&state.index>=6)return [
  {id:'C4',label:'上層尋望',text:'曹植在樓船上層，與下方操船者各有位置。'},
  {id:'boatman-left',label:'下層操船',text:'看舟人手中的長桿，乘舟者與操船者有不同動作。'},
  ...(ashore?[{id:'C5',label:'岸邊坐候',text:'舟上之後，岸邊又出現曹植的身影。'}]:[]),
  ...(homeward?[{id:'carriage-wheel',label:'歸途車輪',text:'從樓船、岸邊到車駕，反覆身影連起不同時刻。'}]:[])];
 return [];
}
