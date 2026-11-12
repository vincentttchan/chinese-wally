// Prepare only a chapter's entry document, painting and shared typeface.
// Animation sheets, music and later scenes stay on demand.
const paintings={
 zanhua:'art/zanhua/full-scroll.jpg',
 'lantern-festival':'art/lantern-festival/full-scroll.jpg',
 'kangqu-listening':'chapters/kangqu-listening/art/overview.jpg',
 luoshen:'art/luoshen/full-scroll.jpg'
};
export function createChapterPreparation(doc){
 const win=doc.defaultView,requests=new Map();
 function request(url){
  if(requests.has(url))return requests.get(url);
  const task=win.fetch(url,{cache:'force-cache',credentials:'same-origin',priority:'low'})
   .then(response=>{if(!response.ok)throw new Error('Entry preparation unavailable');return response.arrayBuffer();})
   .catch(error=>{requests.delete(url);throw error;});
  requests.set(url,task);return task;
 }
 return chapter=>{
  const urls=[new URL(chapter.page,import.meta.url).href];
  if(paintings[chapter.id])urls.push(new URL('../'+paintings[chapter.id],import.meta.url).href);
  urls.push(new URL('../fonts/LXGWWenKaiTC-Regular.ttf',import.meta.url).href);
  return Promise.allSettled(urls.map(request));
 };
}
export function chapterCoverReady(doc,expectedURL,expectedTitle){
 if(!doc?.body||doc.readyState==='loading'||doc.URL==='about:blank')return false;
 // Never accept the outgoing chapter merely because its painting is still visible.
 if(new URL(doc.URL).href!==new URL(expectedURL).href)return false;
 const painting=doc.querySelector('.painting-world > img.painting, #painting');
 const title=doc.querySelector('h1')?.textContent.replace(/\s/g,'');
 return Boolean(title?.includes(expectedTitle.replace(/\s/g,''))&&painting?.complete&&painting.naturalWidth>0);
}
