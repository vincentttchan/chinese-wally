// Every replay borrows the camera and restores it without changing the search or observations.
async function prepareInquiryPlayback(){
 if(state.busy)return null;
 const saved={noteHidden:state.noteHidden,speaker:state.speaker,view:{...state.view},sceneSize:frame(),source:state.source,focus:state.focus,focusPoint:[...state.focusPoint]};
 if(state.source!=='native'&&!await setSource('native'))return null;
 state.speaker=null;return saved;
}
async function restoreInquiryPlayback(saved){
 ++cameraToken;panel.classList.remove('moving');state.busy=false;
 if(saved){
  if(saved.source!==state.source)await setSource(saved.source);
  if(saved.source===state.source){state.view=KangquGeometry.restoreView(saved.view,saved.sceneSize,frame());state.focus=saved.focus;state.focusPoint=[...saved.focusPoint];}
  state.noteHidden=saved.noteHidden;state.speaker=saved.speaker;
 }
 $('layout').classList.remove('is-ensemble-playing');drawPanel();drawPoints();render();scene.focus({preventScroll:true});
}
function inquiryPlaybackActive(){return Boolean(ensembleReturn||audienceReturn||flagReturn);}
