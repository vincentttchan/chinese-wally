import test from 'node:test';
import assert from 'node:assert/strict';
import {guideStep} from '../src/game/zanhuaGuide.ts';
const search={searching:true,studying:false,hasDog:false,found:false};
test('first entry teaches movement, focus and then finding in that order',()=>{
 assert.equal(guideStep({},search),'drag');
 assert.equal(guideStep({drag:true},search),'focus');
 assert.equal(guideStep({drag:true,focus:true},search),'find');
 assert.equal(guideStep({drag:true,focus:true},{...search,found:true}),null);
});
test('contextual notebook and zoom guidance waits until each is relevant',()=>{
 const ready={drag:true,focus:true,find:true};
 assert.equal(guideStep(ready,{...search,searching:false}),null);
 assert.equal(guideStep(ready,{...search,searching:false,hasDog:true}),'journal');
 assert.equal(guideStep({...ready,journal:true},{...search,searching:false,studying:true,hasDog:true}),'zoom');
 assert.equal(guideStep({...ready,journal:true,zoom:true},{...search,searching:false,studying:true,hasDog:true}),null);
});
test('remembered instructions stay completed when returning to the painting',()=>{
 assert.equal(guideStep({drag:true,focus:true,find:true,zoom:true,journal:true},{...search,hasDog:true}),null);
});
