/* Independent discussion sample v0.1. No production imports, storage or game routing. */
const $=id=>document.getElementById(id);
const root=$('entry'),cover=$('cover'),world=root.querySelector('.art-world');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const scenes=[
  {
    "label": "洛水相逢",
    "caption": "第一幕 · 洛水相逢",
    "action": "看看這一卷",
    "groups": [
      {
        "lines": [
          "三國時，曹植寫下《洛神賦》，",
          "描繪一場人與神的相遇。",
          "故事裡，他行經洛水，",
          "在水岸之間，遇見神女洛神。",
          "行旅的腳步，就此停留，",
          "目光所及，多了她的身影。",
          "一段故事，從這片水岸展開。"
        ]
      }
    ]
  },
  {
    "label": "一卷藏時",
    "caption": "第二幕 · 一卷藏時",
    "action": "循賦入畫",
    "groups": [
      {
        "lines": [
          "眼前這卷《洛神賦圖》，",
          "將賦中的故事繪成長卷。",
          "原本相傳為顧愷之作，",
          "此卷是北京故宮所藏宋摹本。",
          "山水之間，熟悉的身影再現，",
          "衣冠相似，姿態卻有不同。",
          "他們之間，又發生了甚麼？"
        ]
      }
    ]
  },
  {
    "label": "循賦入畫",
    "caption": "第三幕 · 循賦入畫",
    "action": "看看曹植的樣子",
    "groups": [
      {
        "lines": [
          "你是循賦入畫的年輕書生，",
          "帶著《洛神賦》，展開此卷。",
          "先認清岸上曹植的面貌，",
          "找到他，再細看他的衣袖。",
          "循著身影，留意姿態與位置，",
          "看過細節，再翻開相應賦文，",
          "讓文字與畫面，慢慢連在一起。"
        ]
      }
    ]
  }
];
let stage=0,started=false,arrived=false,busy=false,entered=false,paused=reduced.matches;
let drift=0,last=0,raf=0,generation=0,glyphs=[],index=0,wait=500,revealing=false;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,reduced.matches?0:ms));

function layout(){
  const w=window.innerWidth,h=window.innerHeight;
  const scale=Math.max(h/943,w/19950),width=19950*scale;
  const origin=Math.max(w-width,Math.min(0,w*.5-width*.885));
  const travel=Math.min(560,w*.48,-origin);
  document.querySelector('.cover-world').style.transform=`translate3d(${origin}px,0,0) scale(${scale})`;
  world.style.transform=`translate3d(${origin+travel*drift}px,0,0) scale(${scale})`;
}
function updateButtons(){
  $('next').querySelector('span').textContent=revealing?'顯示全文':scenes[stage].action;
  $('next').disabled=busy;$('back').disabled=busy||stage===0;
  $('motion').textContent=paused?'繼續展卷':'暫停畫卷';
  $('motion').setAttribute('aria-pressed',String(paused));
  root.classList.toggle('is-paused',paused);
}
function finishReveal(){
  glyphs.forEach(glyph=>glyph.node.classList.add('is-visible'));
  index=glyphs.length;revealing=false;updateButtons();
}
function renderAct(){
  const scene=scenes[stage];glyphs=[];index=0;wait=500;
  const columns=scene.groups.flatMap(group=>group.lines.map(line=>{
    const p=document.createElement('p');p.className='passage '+(group.kind||'');
    const chars=Array.from(line);
    chars.forEach((character,i)=>{
      const node=document.createElement('span');node.className='glyph';node.textContent=character;p.append(node);
      glyphs.push({node,character,columnEnd:i===chars.length-1});
    });return p;
  }));
  $('copy').replaceChildren(...columns);
  $('accessible-copy').textContent=scene.groups.flatMap(group=>group.lines).join('\n');
  $('scene-caption').textContent=scene.caption;
  $('progress').setAttribute('aria-label',`引言第${stage+1}幕，共三幕`);
  $('progress').querySelectorAll('i').forEach((node,i)=>node.classList.toggle('current',i===stage));
  revealing=true;if(reduced.matches)finishReveal();updateButtons();
}
function tick(time){
  const elapsed=last?Math.min(time-last,80):0;last=time;
  if(!document.hidden&&!entered){
    if(!paused&&!reduced.matches){drift=Math.min(1,drift+elapsed/52000);layout();}
    if(arrived&&!busy&&revealing){
      wait-=elapsed;
      if(wait<=0){
        const glyph=glyphs[index++];glyph.node.classList.add('is-visible');
        wait=110+(/[，。！？：；、」]/u.test(glyph.character)?240:0)+(glyph.columnEnd?180:0);
        if(index===glyphs.length)finishReveal();
      }
    }
  }
  if(started&&!entered)raf=requestAnimationFrame(tick);
}
async function changeAct(value){
  if(busy||!arrived||entered)return;
  const token=generation;busy=true;updateButtons();$('narrative').classList.add('is-changing');
  await delay(420);if(token!==generation)return;
  stage=value;renderAct();$('narrative').classList.remove('is-changing');
  await delay(420);if(token!==generation)return;
  busy=false;updateButtons();
}
async function start(){
  if(started)return;
  const token=++generation;started=true;$('cover-start').disabled=true;
  $('cover-start').querySelector('span').textContent='正在展卷';$('cover-status').textContent='畫卷與字體正準備就緒……';
  try{
    $('entry-art').src=$('cover-art').currentSrc||$('cover-art').src;
    await Promise.all([$('cover-art').decode(),$('entry-art').decode(),document.fonts.load('24px LanternEntryWenKai'),...Array.from(document.querySelectorAll('.detail-tile'),image=>image.decode())]);
    if(token!==generation)return;
    root.hidden=false;root.inert=true;cover.inert=true;renderAct();layout();last=0;
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    if(token!==generation)return;
    root.classList.add('is-opening');cover.classList.add('is-opening-scroll');raf=requestAnimationFrame(tick);
    await delay(1050);if(token!==generation)return;
    cover.hidden=true;arrived=true;root.inert=false;root.classList.add('has-arrived');$('next').focus({preventScroll:true});
  }catch{
    if(token!==generation)return;
    started=false;cover.inert=false;$('cover-start').disabled=false;
    $('cover-start').querySelector('span').textContent='重新展卷';$('cover-status').textContent='畫卷未能載入，請再試一次。';
  }
}
async function showPortrait(){
  if(busy||entered)return;
  busy=true;updateButtons();$('next').querySelector('span').textContent='正在準備樣貌';
  try{const portrait=new Image();portrait.src=$('portrait-image').getAttribute('href');await portrait.decode();}catch{
    busy=false;updateButtons();$('next').querySelector('span').textContent='重新載入樣貌';return;
  }
  entered=true;cancelAnimationFrame(raf);root.classList.add('is-handing-over');
  $('narrative').inert=true;$('entry-controls').inert=true;root.querySelector('.entry-header').inert=true;
  await delay(1100);
  $('narrative').hidden=true;$('entry-controls').hidden=true;$('handover').hidden=false;
  $('scene-caption').textContent='樣貌提示 · 獨立樣段至此';$('handover').focus({preventScroll:true});busy=false;
}
function replay(){
  generation++;cancelAnimationFrame(raf);stage=0;started=false;arrived=false;busy=false;entered=false;paused=reduced.matches;drift=0;last=0;
  root.hidden=true;root.inert=true;root.classList.remove('is-opening','has-arrived','is-handing-over');
  $('handover').hidden=true;$('narrative').hidden=false;$('entry-controls').hidden=false;
  $('narrative').inert=false;$('entry-controls').inert=false;root.querySelector('.entry-header').inert=false;
  $('narrative').classList.remove('is-changing');cover.hidden=false;cover.inert=false;cover.classList.remove('is-opening-scroll');
  $('cover-start').disabled=false;$('cover-start').querySelector('span').textContent='走進這一卷';
  $('cover-status').textContent='三幕入場 · 獨立樣段 v0.1';layout();$('cover-start').focus({preventScroll:true});
}
$('cover-start').onclick=start;
$('next').onclick=()=>{if(busy||!arrived||entered)return;if(revealing)finishReveal();else if(stage<2)void changeAct(stage+1);else void showPortrait();};
$('back').onclick=()=>void changeAct(Math.max(0,stage-1));
$('narrative').onclick=()=>{if(arrived&&!busy&&!entered)finishReveal();};
$('motion').onclick=()=>{paused=!paused;updateButtons();};$('replay').onclick=replay;
reduced.addEventListener('change',()=>{paused=reduced.matches;if(reduced.matches&&revealing)finishReveal();updateButtons();});
window.addEventListener('resize',layout);document.addEventListener('visibilitychange',()=>{last=0;});
layout();
