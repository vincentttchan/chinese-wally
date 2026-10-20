import test from 'node:test';
import assert from 'node:assert/strict';
import {initialLuoshen,saveLuoshen,luoshenReducer,luoshenSaveKey} from '../src/game/luoshenState.ts';
import {luoshenCollectionStops,luoshenStoryStops,luoshenJournalActor} from '../src/game/luoshenJournal.ts';
function storage(value:unknown){let text=JSON.stringify(value);Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>key===luoshenSaveKey?text:null,setItem:(_key:string,next:string)=>{text=next;}}});return()=>JSON.parse(text);}
test('v1 saves retain completed story and original collection locations on upgrade',()=>{
 storage({version:1,index:6,ending:3,origins:{bird:'bird-2',boat:'boat-0',invalid:'bird-0'}});
 const state=initialLuoshen();assert.equal(luoshenReducer(state,{type:'begin'}).phase,'complete');assert.deepEqual(state.origins,{bird:'bird-2',boat:'boat-0'});
});
test('reloading during an observation resumes that exact required detail',()=>{
 const read=storage(null);let s=initialLuoshen();s={...s,phase:'observe',index:2,observation:1,focusPreference:false};assert.equal(saveLuoshen(s),true);
 const intro=initialLuoshen();assert.equal(intro.phase,'intro');assert.equal(read().version,2);
 // Merely opening the cover must not overwrite the saved observation phase.
 saveLuoshen(intro);const resumed=luoshenReducer(initialLuoshen(),{type:'begin'});
 assert.equal(resumed.phase,'observe');assert.equal(resumed.index,2);assert.equal(resumed.observation,1);assert.equal(resumed.focusPreference,false);
});
test('found, interpretation and seen ending retain their next action across reload',()=>{
 for(const phase of ['found','interpret'] as const){storage(null);saveLuoshen({...initialLuoshen(),index:1,phase});assert.equal(luoshenReducer(initialLuoshen(),{type:'begin'}).phase,phase);}
 storage(null);saveLuoshen({...initialLuoshen(),index:6,phase:'ending',ending:1,endingSeen:true});const resumed=luoshenReducer(initialLuoshen(),{type:'begin'});assert.equal(resumed.phase,'ending');assert.equal(resumed.endingSeen,true);assert.equal(luoshenReducer(resumed,{type:'end-next'}).ending,2);
});
test('bad progress is bounded and unavailable storage does not prevent memory play',()=>{
 storage({version:2,index:2,observation:999,ending:99,phase:'alien'});let s=initialLuoshen();assert.equal(s.observation,0);assert.equal(s.ending,0);assert.equal(luoshenReducer(s,{type:'begin'}).phase,'search');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}}});s=initialLuoshen();assert.equal(saveLuoshen(s),false);assert.equal(luoshenReducer(s,{type:'begin'}).phase,'search');
});
test('replay retains collections and the player choice of colour exploration',()=>{
 storage(null);let s={...initialLuoshen(),phase:'complete' as const,index:6,origins:{bird:'bird-0'}};s=luoshenReducer(s,{type:'focus',value:false}) as typeof s;const replay=luoshenReducer(s,{type:'restart'});assert.equal(replay.index,0);assert.equal(replay.focusPreference,false);assert.deepEqual(replay.origins,s.origins);
});
test('every journal comparison reaches registered original art and preserves the first origin',()=>{
 for(const [category,origin] of [['bird','bird-1'],['ribbon','ribbon-3'],['dragon','dragon-6'],['canopy','canopy-4'],['boat','boat-0']]){const stops=luoshenCollectionStops(category,origin);assert.ok(stops.some(s=>s.id===origin));for(const stop of stops)assert.ok(luoshenJournalActor(stop.id),stop.id);}
});
test('story comparisons respect unlocks and do not reveal later ending scenes',()=>{
 storage(null);const state={...initialLuoshen(),index:1};assert.equal(luoshenStoryStops('lingering',state).length,0);assert.equal(luoshenStoryStops('encounter',state).some(s=>s.id==='bird-0'),false);
 const boat={...state,index:6,ending:0,endingSeen:false};assert.equal(luoshenStoryStops('longing',boat).some(s=>s.id==='C5'),false);assert.equal(luoshenStoryStops('longing',{...boat,ending:1}).some(s=>s.id==='carriage-wheel'),false);
 for(const chapter of ['encounter','lingering','farewell','longing'])for(const stop of luoshenStoryStops(chapter,{...boat,ending:3}))assert.ok(luoshenJournalActor(stop.id),stop.id);
});
