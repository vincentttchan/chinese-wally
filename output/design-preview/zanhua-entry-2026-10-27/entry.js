/* Independent discussion sample v0.1. No production imports, storage or game routing. */
const $=id=>document.getElementById(id);
const root=$('entry'),cover=$('cover'),world=root.querySelector('.art-world');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const scenes=[
  {label:'盛裝一刻',caption:'畫中場景 · 盛裝遊賞',action:'看看這一卷',groups:[
    {kind:'kicker',lines:['盛裝一刻']},
    {lines:['畫中，幾位女子盛裝遊賞。','高髻簪花，長裙曳地。','有人拈花，有人在旁執扇。']},
    {kind:'closing',lines:['她們的手勢與目光，','留下各不相同的片刻。']}
  ]},
  {label:'畫中仕女',caption:'簪花仕女圖 · 傳唐代周昉作',action:'隨師展卷',groups:[
    {kind:'kicker',lines:['畫中仕女']},
    {lines:['眼前的《簪花仕女圖》，','傳為唐代畫家周昉所作，','現藏遼寧省博物館。']},
    {kind:'closing',lines:['畫卷留下了她們的樣貌，','畫中卻沒有記下她們的姓名。']}
  ]},
  {label:'初學看畫',caption:'你的身份 · 隨師展卷的學畫人',action:'看看她的樣子',groups:[
    {kind:'kicker',lines:['初學看畫']},
    {lines:['你是隨師展卷的學畫人。','師長輕聲囑咐：']},
    {kind:'quote',lines:['「先認清這位女子的面孔。','找到她，再循着手勢與目光，','看看她正在做甚麼。」']}
  ]}
];
let stage=0,started=false,arrived=false,busy=false,entered=false,paused=reduced.matches;
let drift=0,last=0,raf=0,generation=0,glyphs=[],index=0,wait=500,revealing=false;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,reduced.matches?0:ms));

function layout(){
  const w=window.innerWidth,h=window.innerHeight;
  const scale=Math.max(h/1378,w/6455);
  $('cover-art').style.transform=`scale(${scale})`;
  const origin=w-6455*scale,travel=Math.min(560,w*.48,-origin);
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
    await Promise.all([$('cover-art').decode(),$('entry-art').decode(),document.fonts.load('24px LanternEntryWenKai')]);
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
  try{await $('portrait').decode();}catch{
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
