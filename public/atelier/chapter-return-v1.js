// A fullscreen child remains in the browser's top layer even if its iframe is hidden.
// Finish leaving that layer before making the atelier interactive again.
export async function leaveChapterFullscreen(frame){
 const documents=[frame.ownerDocument,frame.contentDocument].filter(Boolean);
 for(const doc of documents){
  if(!doc.fullscreenElement)continue;
  if(typeof doc.exitFullscreen!=='function')throw Error('Fullscreen exit unavailable');
  await doc.exitFullscreen();
 }
 if(documents.some(doc=>doc.fullscreenElement))throw Error('Fullscreen chapter is still active');
}
