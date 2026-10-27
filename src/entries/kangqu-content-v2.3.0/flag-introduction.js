async function beginFlagObservation(person){
 // Read the approved greeting before the existing one-person flag playback.
 setMode('found');await beginObservation();
 if(state.mode!=='observe'||current().station!=='flags'||state.busy)return;
 const next=document.createElement('button');next.id='kangqu-flag-next';
 next.className='emperor-speech-action';next.textContent='看看沿街旗列';
 next.onclick=async()=>{
  if(state.busy)return;
  clearCharacterSpeech({restoreView:false});noteStoryPerson(person);
  if(reduced.matches){
   state.flagAnimationIssue=true;state.flagStaticReason='reduced';state.inquiryStaticReason='reduced';
   state.noteHidden=false;drawPanel();drawPoints();render();return;
  }
  state.inquiryStaticReason=null;await playFlags();
 };
 $('speech-bubble').append(next);speak(person,current().greeting,true);
}
