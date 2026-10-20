import {qingmingFindings,actorById} from './qingming.ts';
import {bridgeIntroduction,qingmingStories,storyById,storyStepAt} from './qingmingStories.ts';
import type {PaintingStory,StoryStep} from './qingmingStories.ts';
import {readingComplete,readingPhrases,sourceReadingKey} from './qingmingReading.ts';
export type StoryProgress={step:number;seen:Record<string,string>;readSteps:number[];complete:boolean;version?:number};
export type QingmingSave={origins:Record<string,string>;read:string[];journeys:Record<string,StoryProgress>;tutorialDone:boolean;activeStory:string|null;flowVersion?:number;sourcePhrases?:Record<string,number[]>};
export type QingmingState=QingmingSave&{mode:'intro'|'observe'|'conclusion'|'roam'|'city';cityStep:number;replay?:StoryProgress|null};
export type QingmingAction={type:'read-phrase';index:number}|{type:'begin'}|{type:'inspect';id:string}|{type:'continue'}|{type:'start';id:string}|{type:'replay';id:string}|{type:'pause'}|{type:'collect';id:string;actorId:string}|{type:'restart'}|{type:'reset-stories'}|{type:'city'}|{type:'city-next'}|{type:'roam'};
const oldKey='chinese-wally:qingming-shanghe:v1';
const key='chinese-wally:qingming-free-roam-v1';
export const emptyProgress=():StoryProgress=>({step:0,seen:{},readSteps:[],complete:false});
export const emptyQingmingSave=():QingmingSave=>({origins:{},read:[],journeys:{},tutorialDone:false,activeStory:null,flowVersion:2,sourcePhrases:{}});
export const progressAt=(save:QingmingSave,id:string)=>save.journeys[id]??emptyProgress();
export const completedStories=(save:QingmingSave)=>qingmingStories.filter(s=>progressAt(save,s.id).complete).length;
export function stepObserved(step:StoryStep,p:StoryProgress){return step.kind==='observe'&&step.groups.every(g=>Boolean(p.seen[g.key]));}
const validOrigins=(raw:unknown)=>{
 const origins:Record<string,string>={};
 if(!raw||typeof raw!=='object')return origins;
 for(const f of qingmingFindings){const id=(raw as Record<string,unknown>)[f.id];if(typeof id==='string'&&f.actorIds.includes(id))origins[f.id]=id;}
 return origins;
};
export function loadQingming():QingmingSave{
 const save=emptyQingmingSave();
 try{
  const legacy=JSON.parse(localStorage.getItem(oldKey)??'null');
  const raw=JSON.parse(localStorage.getItem(key)??'null');
  save.origins={...validOrigins(legacy?.origins),...validOrigins(raw?.origins)};
  save.read=Array.from(new Set<string>([...(Array.isArray(legacy?.read)?legacy.read:[]),...(Array.isArray(raw?.read)?raw.read:[])].filter((v:unknown):v is string=>typeof v==='string'&&['bridge','wine','medicine','paper','lodging','incense'].includes(v))));
  if(!raw||typeof raw!=='object')return save;
  for(const story of [bridgeIntroduction,...qingmingStories]){
   story.steps.forEach((step,index)=>{
    if(step.kind!=='source')return;
    const phraseKey=sourceReadingKey(story.id,index),rawRead=raw.sourcePhrases?.[phraseKey];
    if(Array.isArray(rawRead))save.sourcePhrases![phraseKey]=readingPhrases(step.source).flatMap((_,i)=>rawRead.includes(i)?[i]:[]);
   });
   const candidate=raw.journeys?.[story.id];if(!candidate||typeof candidate!=='object')continue;
   const p={...emptyProgress(),version:story.version};
   const groups=[...story.steps.flatMap(step=>step.kind==='observe'?step.groups:[]),...(story.optionalGroups??[])];
   for(const g of groups){const id=candidate.seen?.[g.key];if(typeof id==='string'&&g.ids.includes(id))p.seen[g.key]=id;}
   if(story.id==='story-boat-work'){
    // Earlier versions grouped a person on the next boat with this foreground vessel.
    if(candidate.seen?.deck==='extra-person-outskirts-024'||candidate.seen?.['boat-person-return']==='extra-person-outskirts-024')p.seen['nearby-boat-person']='extra-person-outskirts-024';
    if(candidate.complete){p.step=story.steps.length;p.complete=true;save.journeys[story.id]=p;continue;}
    if(candidate.version!==story.version){
     p.step=p.seen['boat-window-person']?p.seen['boat-window-opening']?2:1:0;
     save.journeys[story.id]=p;continue;
    }
   }
   if(story.id==='story-street-transport'){
    // Validate each link against the actual first sedan and the opposite end, including restored data.
    for(const [index,name] of [[1,'transport-link'],[2,'transport-other']] as const){
     const step=storyStepAt(story,{...p,step:index});
     if(!p.seen.carriage||index===2&&!p.seen['transport-link']||step?.kind!=='observe'||!step.groups.some(g=>g.ids.includes(p.seen[name])))delete p.seen[name];
    }
   }
   if(story.id==='story-street-transport'&&candidate.version!==story.version){
    // Keep completion and optional street evidence; never invent an observation of the other carrier.
    if(candidate.complete){p.step=story.steps.length;p.complete=true;}
    else p.step=p.seen.carriage?p.seen['transport-link']?2:1:0;
    save.journeys[story.id]=p;continue;
   }
   if(story.id==='story-street-transport'&&candidate.complete){p.step=story.steps.length;p.complete=true;save.journeys[story.id]=p;continue;}
   // A completed old introduction stays completed. Partial old evidence must be observed in the new order.
   if(story.id===bridgeIntroduction.id&&raw.flowVersion!==2){
    if(candidate.complete&&raw.tutorialDone){
     p.step=story.steps.length;p.complete=true;
     p.readSteps=story.steps.flatMap((step,index)=>step.kind==='source'?[index]:[]);
    }else {const watched=p.seen['bridge-watch'];p.seen=watched?{'bridge-watch':watched}:{};p.step=watched?1:0;}
    save.journeys[story.id]=p;continue;
   }
   p.readSteps=story.steps.flatMap((s,i)=>s.kind==='source'&&Array.isArray(candidate.readSteps)&&candidate.readSteps.includes(i)?[i]:[]);
   // Restore only a prefix whose required observations and readings exist.
   const requested=Number.isInteger(candidate.step)?Math.max(0,Math.min(story.steps.length,candidate.step)):0;
   while(p.step<requested){const s=storyStepAt(story,p)!;if(s.kind==='source'?!p.readSteps.includes(p.step):!stepObserved(s,p))break;p.step++;}
   p.complete=Boolean(candidate.complete)&&p.step===story.steps.length;
   save.journeys[story.id]=p;
  }
  save.tutorialDone=Boolean(raw.tutorialDone)&&progressAt(save,bridgeIntroduction.id).complete;
  if(typeof raw.activeStory==='string'&&storyById(raw.activeStory)&&!progressAt(save,raw.activeStory).complete)save.activeStory=raw.activeStory;
 }catch{/* A damaged save does not block this play. */}
 return save;
}
export function saveQingming(save:QingmingSave){try{
 localStorage.setItem(key,JSON.stringify({origins:save.origins,read:save.read,journeys:save.journeys,tutorialDone:save.tutorialDone,activeStory:save.activeStory,flowVersion:2,sourcePhrases:save.sourcePhrases??{}}));
 // Preserve the existing collection format for older chapter builds.
 localStorage.setItem(oldKey,JSON.stringify({origins:save.origins,read:save.read}));
}catch{/* Current play remains available. */}}
export function initialQingming(save:QingmingSave=loadQingming()):QingmingState{
 const activeStory=save.tutorialDone?save.activeStory:bridgeIntroduction.id;
 const resumed=activeStory?progressAt(save,activeStory):null;
 return {...save,activeStory,mode:!save.tutorialDone&&(!resumed||resumed.step===0&&!Object.keys(resumed.seen).length)?'intro':activeStory?resumed?.step===storyById(activeStory)!.steps.length?'conclusion':'observe':'roam',cityStep:0};
}
function inspectProgress(story:PaintingStory,p:StoryProgress,id:string,activeStep:number|null):StoryProgress{
 const seen={...p.seen};
 for(const g of story.optionalGroups??[])if(g.ids.includes(id))seen[g.key]=id;
 if(p.complete)return {...p,seen};
 story.steps.forEach((_,i)=>{
  const step=storyStepAt(story,{...p,step:i})!;
  if(step.kind!=='observe')return;
  if(story.ordered&&i!==(activeStep??p.step))return;
  if(!story.ordered&&(story.id===bridgeIntroduction.id||step.revisit)&&i!==activeStep)return;
  for(const g of step.groups)if(g.ids.includes(id))seen[g.key]=id;
 });
 return {...p,seen,version:story.version};
}
function advanceObserved(story:PaintingStory,p:StoryProgress):StoryProgress{
 let next=p;
 while(next.step<story.steps.length){
  const step=storyStepAt(story,next);
  if(step?.kind!=='observe'||!step.autoContinue||!stepObserved(step,next))break;
  next={...next,step:next.step+1,complete:next.step+1===story.steps.length};
 }
 return next;
}
export function qingmingReducer(state:QingmingState,action:QingmingAction):QingmingState{
 const story=state.activeStory?storyById(state.activeStory):undefined;
 const p=state.replay??(story?progressAt(state,story.id):emptyProgress());
 const step=story?storyStepAt(story,p):undefined;
 switch(action.type){
  case 'begin':return state.mode==='intro'?{...state,mode:'observe',activeStory:bridgeIntroduction.id}:state;
  case 'read-phrase':{
   if(state.mode!=='observe'||!story||step?.kind!=='source'||!Number.isInteger(action.index)||!readingPhrases(step.source)[action.index])return state;
   const phraseKey=sourceReadingKey(story.id,p.step);
   const read=Array.from(new Set([...(state.sourcePhrases?.[phraseKey]??[]),action.index]));
   return {...state,sourcePhrases:{...state.sourcePhrases,[phraseKey]:read}};
  }
  case 'inspect':{
   if(!['roam','observe'].includes(state.mode))return state;
   if(state.mode==='observe'&&step?.kind==='source')return state;
   if(state.replay&&story){
    const next=inspectProgress(story,p,action.id,p.step);
    const replay=step?.kind==='observe'&&step.autoContinue&&step.groups.some(g=>g.ids.includes(action.id))?advanceObserved(story,next):next;
    return {...state,replay};
   }
   const journeys={...state.journeys};
   for(const s of [bridgeIntroduction,...qingmingStories]){
    const previous=progressAt(state,s.id);
    const next=inspectProgress(s,previous,action.id,state.mode==='observe'&&story?.id===s.id?previous.step:null);
    if(Object.keys(next.seen).length||state.journeys[s.id])journeys[s.id]=next;
   }
   if(story&&step?.kind==='observe'&&step.autoContinue&&step.groups.some(g=>g.ids.includes(action.id))){
    const next=journeys[story.id]??p;
    if(stepObserved(step,next))journeys[story.id]=story.ordered?advanceObserved(story,next):{...next,step:next.step+1,complete:next.step+1===story.steps.length};
   }
   return {...state,journeys};
  }
  case 'continue':{
   if(state.mode!=='observe'||!story||!step||step.kind==='observe'&&!stepObserved(step,p))return state;
   if(step.kind==='source'&&!readingComplete(step.source,state.sourcePhrases?.[sourceReadingKey(story.id,p.step)]??[]))return state;
   const next={...p,step:p.step+1,complete:p.step+1===story.steps.length,readSteps:step.kind==='source'?Array.from(new Set([...p.readSteps,p.step])):p.readSteps};
   if(story.finishInPainting&&next.complete){
    const recorded=progressAt(state,story.id);
    const finished=state.replay?{...next,seen:{...recorded.seen,...next.seen}}:next;
    return {...state,journeys:{...state.journeys,[story.id]:finished},replay:null,activeStory:null,mode:'roam'};
   }
   const read=step.kind==='source'?Array.from(new Set([...state.read,story.id==='intro-bridge'?'bridge':story.id==='story-wine-front'?'wine':story.id==='story-medical-service'?'medicine':'paper'])):state.read;
   return {...state,read,journeys:{...state.journeys,[story.id]:next},mode:next.step===story.steps.length?'conclusion':'observe'};
  }
  case 'start':{
   const target=storyById(action.id);if(!state.tutorialDone||!target||progressAt(state,target.id).complete)return state;
   const previous=progressAt(state,target.id),next=target.ordered?advanceObserved(target,previous):previous;
   return {...state,journeys:{...state.journeys,[target.id]:next},replay:null,activeStory:target.id,mode:'observe'};
  }
  case 'replay':{
   const target=storyById(action.id);
   if(!state.tutorialDone||!target?.ordered||!progressAt(state,target.id).complete)return state;
   return {...state,replay:{...emptyProgress(),version:target.version},activeStory:target.id,mode:'observe'};
  }
  case 'roam':{
   if(state.mode==='conclusion'&&story){
    const journeys={...state.journeys,[story.id]:{...p,complete:true}};
    return {...state,journeys,tutorialDone:state.tutorialDone||story.id===bridgeIntroduction.id,activeStory:null,mode:'roam'};
   }
   if(state.tutorialDone)return {...state,replay:null,mode:'roam',activeStory:null};
   return state;
  }
  case 'pause':return state.tutorialDone?{...state,replay:null,mode:'roam',activeStory:null}:state;
  case 'city':return completedStories(state)===5?{...state,replay:null,mode:'city',cityStep:0}:state;
  case 'city-next':return state.mode==='city'?state.cityStep<3?{...state,cityStep:state.cityStep+1}:{...state,mode:'roam',activeStory:null}:state;
  case 'collect':{
   const f=qingmingFindings.find(f=>f.id===action.id);
   if(!f||!f.actorIds.includes(action.actorId)||state.origins[f.id]||!actorById(action.actorId))return state;
   return {...state,origins:{...state.origins,[f.id]:action.actorId}};
  }
  case 'restart':return {...state,replay:null,sourcePhrases:Object.fromEntries(Object.entries(state.sourcePhrases??{}).filter(([id])=>!id.startsWith(bridgeIntroduction.id+':'))),journeys:{...state.journeys,[bridgeIntroduction.id]:emptyProgress()},tutorialDone:false,activeStory:bridgeIntroduction.id,mode:'intro',cityStep:0};
  case 'reset-stories':return {...state,replay:null,sourcePhrases:Object.fromEntries(Object.entries(state.sourcePhrases??{}).filter(([id])=>id.startsWith(bridgeIntroduction.id+':'))),journeys:{[bridgeIntroduction.id]:progressAt(state,bridgeIntroduction.id)},activeStory:null,mode:state.tutorialDone?'roam':'intro',cityStep:0};
 }
}
