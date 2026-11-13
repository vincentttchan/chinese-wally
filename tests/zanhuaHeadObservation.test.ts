import test from 'node:test';
import assert from 'node:assert/strict';
import {zanhuaHeadObservationShot} from '../src/game/zanhuaHeadObservation.ts';
import {coverView} from '../src/game/geometry.ts';

test('P6 flower, hair and face fit below the top edge and beside the observation note on desktop',()=>{
 for(const frame of [{width:1280,height:720},{width:1366,height:768},{width:1920,height:1080}]){
  const shot=zanhuaHeadObservationShot(frame),scale=coverView(frame,{width:6455,height:1378}).scale*shot.scaleRatio;
  const x=frame.width*shot.screenAnchor.x-shot.region.x*6455*scale;
  const y=frame.height*shot.screenAnchor.y-shot.region.y*1378*scale;
  // Actual flower polygon spans y=10..140; the face and raised hand extend below it.
  assert.ok(y+10*scale>=32);assert.ok(y+800*scale<=frame.height-32);
  assert.ok(x+1220*scale>Math.min(476,frame.width*.4));
  assert.ok(x+1455*scale<frame.width-32);
  assert.ok(shot.allowVerticalMargin,'the renderer must be able to preserve this top inset');
 }
});
