import {discoveredMementos, selectedMemento, saveMemento, stickerArt, mementoKey} from './memento-catalog-v1.js?v=1';
import {renderArchiveSeal} from './archive-seal.js?v=2';
const numbers=['一','二','三','四'];
let albumNumber=0;
export function mountPaintingAlbum(container,collectedChapters,revisit,trigger) {
 const doc=container.ownerDocument,win=doc.defaultView;
 const node=(tag,cls,text)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const button=(cls,text,action)=>{const e=node('button',cls,text);e.type='button';if(action)e.addEventListener('click',action);return e;};
 const toggle=trigger??button('painting-album-toggle','觀畫帖');
 toggle.setAttribute('aria-haspopup','dialog');
 const album=node('dialog','painting-album sticker-album');
 const titleId='sticker-album-title-'+(++albumNumber);
 album.setAttribute('aria-labelledby',titleId);
 album.innerHTML=`<div class="memento-stage"><div class="memento-book">
 <picture class="memento-paper"><source media="(max-width:650px)" srcset="${new URL('./assets/album-river-v1/album-portrait.png',import.meta.url).href}"><img src="${new URL('./assets/album-river-v1/album-spread.png',import.meta.url).href}" alt="" draggable="false"></picture>
 <header class="memento-header"><h2 id="${titleId}">我的觀畫帖</h2><form method="dialog"><button type="submit" autofocus>合上 ×</button></form></header>
 <div class="memento-content"></div><footer class="memento-footer"><span class="memento-status" role="status"></span><span class="memento-owner" aria-label="觀畫紀念印"></span></footer>
 </div></div>`;
 if(!trigger)container.append(toggle);
 // A completion invitation must also work while the opening scene is hidden.
 doc.body.append(album);
 const content=album.querySelector('.memento-content'),status=album.querySelector('.memento-status');
 let chapters=[],mode='overview',chapterId=null,itemId=null,opener=null;
 const completed=()=>chapters.find(chapter=>chapter.id===chapterId);
 const chapterLabel=chapter=>'第'+numbers[chapters.indexOf(chapter)]+'卷 · '+chapter.title;
 const animate=()=>{if(!win.matchMedia('(prefers-reduced-motion:reduce)').matches)content.animate([{opacity:.15},{opacity:1}],{duration:180});};
 function setView(next,chapter=null,item=null,focus=true){
  mode=next;chapterId=chapter?.id??null;itemId=item?.id??null;render();content.scrollTop=0;animate();
  if(focus)content.querySelector('h3')?.focus({preventScroll:true});
 }
 function heading(text){const h=node('h3','memento-view-title',text);h.tabIndex=-1;return h;}
 function goBack(){return button('memento-back','← 我的貼紙',()=>setView('overview'));}
 function enterChapter(chapter){album.close();revisit(chapter);}
 function titleBlock(chapter,item) {
  const label=node('div','memento-label');label.append(node('p','memento-chapter',chapterLabel(chapter)),node('p','memento-name',item?.title??'這一頁，留給你的發現'));
  return label;
 }
 function renderOverview() {
  content.append(heading('把想記住的，貼在這裏。'));
  const grid=node('div','memento-sticker-board');grid.dataset.count=chapters.length;
  chapters.forEach((chapter,i)=>{
   const item=selectedMemento(doc,chapter.id),slot=node('section','memento-slot'+(item?' has-sticker':' is-pending'));
   slot.style.setProperty('--sticker-tilt',['-5deg','4deg','3deg','-4deg'][i]);slot.dataset.chapter=chapter.id;
   const art=button('memento-sticker',item?'':'待貼',()=>setView(item?'detail':'choose',chapter,item));
   art.setAttribute('aria-label',item?'細看'+item.title+'貼紙':'為《'+chapter.title+'》選一張貼紙');
   if(item){art.append(stickerArt(doc,item));art.dataset.item=item.id;}
   else art.append(node('span','memento-pending-note','選一件旅途中的紀念'));
   const label=titleBlock(chapter,item);
   label.append(button('memento-link',item?'換一張':'選一件貼上',()=>setView('choose',chapter)));
   slot.append(art,label);grid.append(slot);
  });
  if(chapters.length===1){const note=node('div','memento-invitation');note.append(node('p','','一卷，一件紀念。'),node('p','','往後的畫境，\n也會留下屬於你的發現。'));grid.append(note);}
  content.append(grid);
  const count=chapters.filter(c=>selectedMemento(doc,c.id)).length;
  status.textContent='已讀 '+chapters.length+' 卷 · 自選 '+count+' 張';
 }
 function renderChoose(chapter) {
  content.append(goBack(),heading('從這一卷，帶走一件紀念。'));
  const choices=discoveredMementos(doc,chapter.id);
  content.append(node('p','memento-choose-caption',chapterLabel(chapter)+(choices.length?' · 從 '+choices.length+' 件見聞中自選一件':' · 重訪時可繼續收集見聞')));
  if(!choices.length){
   const empty=node('div','memento-empty');empty.append(node('p','','這一頁先留待貼。'),node('p','','此卷已讀。再走一趟，找到喜歡的細節，\n便能帶回來貼在這裏。'),button('memento-action','回畫中找一件 →',()=>enterChapter(chapter)),button('memento-link','先留待貼',()=>setView('overview')));content.append(empty);return;
  }
  const chosen=selectedMemento(doc,chapter.id);
  if(!choices.some(item=>item.id===itemId))itemId=chosen?.id??choices[0].id;
  const layout=node('div','memento-chooser'),options=node('div','memento-options');options.setAttribute('role','group');options.setAttribute('aria-label','已發現的收藏元素');
  const preview=node('section','memento-preview');
  function updatePreview(){
   const item=choices.find(i=>i.id===itemId);preview.replaceChildren(stickerArt(doc,item),node('h4','',item.title),node('p','',item.body));
   for(const option of options.children)option.setAttribute('aria-pressed',String(option.dataset.item===itemId));
   selection.textContent='已選：'+item.title;
   confirm.replaceChildren();
   if(chosen?.id===itemId)confirm.textContent='已貼在帖中';
   else confirm.append(node('span','memento-confirm-prefix','選這一張，'),doc.createTextNode('貼入帖中 →'));
   confirm.setAttribute('aria-label',chosen?.id===itemId?'「'+item.title+'」已貼在帖中':'把「'+item.title+'」貼入觀畫帖');
   confirm.disabled=chosen?.id===itemId;
  }
  choices.forEach(item=>{const option=button('memento-option','',()=>{itemId=item.id;updatePreview();});option.dataset.item=item.id;option.append(stickerArt(doc,item),node('span','',item.title));options.append(option);});
  const actions=node('div','memento-choose-actions'),selection=node('p','memento-current-selection'),controls=node('div','memento-choice-buttons');
  selection.setAttribute('aria-live','polite');
  const confirm=button('memento-action memento-confirm','',()=>{
   // Re-read both the completion list and the journal before accepting a choice.
   const saved=saveMemento(doc,collectedChapters(),chapter.id,itemId);
   if(!saved){status.textContent='這次未能保存。你仍可先繼續旅程，稍後再選。';return;}
   const item=discoveredMementos(doc,chapter.id).find(i=>i.id===itemId);
   setView('overview',null,null,false);status.textContent='已把「'+item.title+'」貼入觀畫帖。';
   const sticker=content.querySelector('[data-chapter="'+chapter.id+'"] .memento-sticker');
   if(sticker){
    sticker.focus({preventScroll:true});
    const paper=content.getBoundingClientRect(),position=sticker.getBoundingClientRect();
    if(position.top<paper.top||position.bottom>paper.bottom){
     // Scroll only the paper, keeping the booklet and scene in place.
     content.scrollTop+=position.top-paper.top-(paper.height-position.height)/2;
    }
   }
  });
  controls.append(confirm,button('memento-link',chosen?'保留原來的':'先留待貼',()=>setView('overview')));
  actions.append(selection,controls);
  layout.append(options,preview);content.append(layout,actions);updatePreview();
  status.textContent='只選一件作紀念 · 見聞冊仍保留全部發現';
 }
 function renderDetail(chapter,item) {
  content.append(goBack(),heading('貼紙裏的小故事'));
  const spread=node('div','memento-detail-spread'),art=node('figure','memento-detail-art');art.append(stickerArt(doc,item),node('figcaption','','依畫中線索創作的收藏插畫'));
  const story=node('section','memento-story'),reading=node('div','memento-reading');reading.append(node('h4','',item.title),node('p','memento-story-body',item.body));story.append(node('p','memento-chapter',chapterLabel(chapter)),reading);
  if(item.source && item.source.label!=='原畫影像資料'){const source=node('a','memento-source',item.source.label+' ↗');source.href=item.source.url;source.target='_blank';source.rel='noopener noreferrer';story.append(source);}
  const actions=node('div','memento-detail-actions');actions.append(button('memento-link','換一張貼紙',()=>setView('choose',chapter,item)),button('memento-action','再入此卷 →',()=>enterChapter(chapter)));
  story.append(actions);spread.append(art,story);content.append(spread);status.textContent='你的選擇 · '+item.title;
 }
 function render(){
  chapters=collectedChapters();content.replaceChildren();album.dataset.view=mode;
  const chapter=completed();
  if(mode!=='overview'&&!chapter){mode='overview';album.dataset.view=mode;}
  if(mode==='choose')renderChoose(chapter);
  else if(mode==='detail'){
   const item=selectedMemento(doc,chapter.id);
   if(item)renderDetail(chapter,item);else {mode='choose';album.dataset.view=mode;renderChoose(chapter);}
  } else renderOverview();
 }
 function refresh(){chapters=collectedChapters();toggle.hidden=!chapters.length;if(album.open)render();}
 function open(view,chapter){
  refresh();if(!chapters.length)return;
  opener=doc.activeElement;mode=view;chapterId=chapter?.id??null;itemId=null;render();content.scrollTop=0;
  if(!album.open)album.showModal();
 }
 toggle.addEventListener('click',()=>open('overview'));
 album.addEventListener('close',()=>{if(opener?.isConnected&&!opener.closest('[hidden],[inert]'))opener.focus({preventScroll:true});});
 // Native Escape closes the booklet; all saved discoveries remain untouched.
 win.addEventListener('storage',event=>{if(album.open&&(event.key===mementoKey||event.key?.includes('findings')||event.key?.includes('journal')||event.key==='painting-luoshen-v1'))render();});
 refresh.offer=chapter=>{if(collectedChapters().some(c=>c.id===chapter.id)&&!selectedMemento(doc,chapter.id))open('choose',chapter);};
 void renderArchiveSeal(album.querySelector('.memento-owner'));
 refresh();return refresh;
}
