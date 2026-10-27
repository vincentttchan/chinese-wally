/* Confirmed Kangqu entrance, attached only to the preserved 2.1.14 runtime. */
const kangquThreeAct = (() => {
  const root = $('kangqu-three-act'), cover = $('introduction');
  const art = root.querySelector('.full-painting'), artWorld = root.querySelector('.art-world');
  const narrative = root.querySelector('.narrative'), copy = root.querySelector('.vertical-copy');
  const next = $('entry-next'), back = $('entry-back'), motion = $('entry-motion');
  const scenes = [
    {label:'為誰祝壽',caption:'清代 · 一七五一年萬壽慶典',action:'看看這一卷',groups:[
      {kind:'kicker',lines:['為誰祝壽']},
      {lines:['清乾隆十六年，公元一七五一年。','乾隆為母親崇慶皇太后，','慶祝六十壽辰。']},
      {kind:'closing',lines:['京城沿途張燈設戲，','街道也成了慶典的場所。']}
    ]},
    {label:'畫中一街',caption:'康衢駢慶 · 萬壽圖第三卷',action:'走進人群',groups:[
      {kind:'kicker',lines:['畫中一街']},
      {lines:['眼前的《康衢駢慶》，','是皇太后六旬《萬壽圖》','的第三卷。']},
      {kind:'closing',lines:['張廷彥等宮廷畫家，','把沿街的人群與慶典活動，','留在這一卷裡。']}
    ]},
    {label:'外鄉來客',caption:'你的身份 · 初到京城的外鄉客',action:'入畫尋找樂手',groups:[
      {kind:'kicker',lines:['外鄉來客']},
      {lines:['你初到京城，便遇上這場熱鬧。','街旁彩飾連綿，人群間樂聲傳來。']},
      {kind:'closing',lines:['這條街，怎樣為皇太后祝壽？','先找一位樂手，從他那裡聽起。']}
    ]}
  ];
  let started=false, arrived=false, coverHidden=false, busy=false, leaving=false;
  let stage=0, drift=0, paused=reduced.matches, glyphs=[], index=0, wait=500, revealing=false;
  let raf=0, last=0, generation=0, view={x:0,y:0,scale:1};
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,reduced.matches?0:ms));

  function paint(){
    const w=root.clientWidth,h=root.clientHeight;
    if(!w||!h)return;
    const scale=Math.max(h/(2708-120),(w+Math.min(560,w*.48))/4500);
    const baseX=w-4500*scale,travel=Math.min(560,w*.48,-baseX);
    const y=Math.max(h-2708*scale,Math.min(-120*scale,h*.52-1700*scale));
    view={x:baseX+travel*drift,y,scale};
    artWorld.style.transform=`translate3d(${view.x}px,${view.y}px,0) scale(${scale})`;
  }
  function updateButtons(){
    next.querySelector('span').textContent=revealing?'顯示全文':stage===2&&!state.ready?'正在展卷':scenes[stage].action;
    next.disabled=busy||(!revealing&&stage===2&&!state.ready);
    back.disabled=busy||stage===0;
    motion.textContent=paused?'繼續展卷':'暫停畫卷';
    motion.setAttribute('aria-pressed',String(paused));
    root.classList.toggle('is-paused',paused);
  }
  function finishReveal(){
    for(const glyph of glyphs)glyph.node.classList.add('is-visible');
    index=glyphs.length;revealing=false;updateButtons();
  }
  function renderAct(){
    glyphs=[];index=0;wait=500;
    const data=scenes[stage];
    const columns=data.groups.flatMap(group=>group.lines.map(line=>{
      const p=document.createElement('p');p.className='passage '+(group.kind||'');
      const characters=Array.from(line);
      characters.forEach((character,i)=>{
        const node=document.createElement('span');node.className='glyph';node.textContent=character;p.append(node);
        glyphs.push({node,character,columnEnd:i===characters.length-1});
      });return p;
    }));
    copy.replaceChildren(...columns);
    root.querySelector('.sr-only').textContent=data.groups.flatMap(group=>group.lines).join('\n');
    root.querySelector('.scene-caption').textContent=data.caption;
    const progress=root.querySelector('.progress');
    progress.setAttribute('aria-label',`引言第${stage+1}幕，共三幕`);
    progress.querySelectorAll('i').forEach((node,i)=>node.classList.toggle('current',i===stage));
    revealing=true;if(reduced.matches)finishReveal();updateButtons();
  }
  function tick(time){
    const elapsed=last?Math.min(time-last,80):0;last=time;
    if(!document.hidden&&!leaving){
      if(!paused&&!reduced.matches){drift=Math.min(1,drift+elapsed/52000);paint();}
      if(arrived&&!busy&&revealing){
        wait-=elapsed;
        if(wait<=0){
          const glyph=glyphs[index++];glyph.node.classList.add('is-visible');
          wait=110+(/[，。！？：；、」]/u.test(glyph.character)?240:0)+(glyph.columnEnd?180:0);
          if(index===glyphs.length)finishReveal();
        }
      }
    }
    if(started&&!leaving)raf=requestAnimationFrame(tick);
  }
  async function changeAct(value){
    if(busy||!arrived||leaving)return;
    const token=generation;busy=true;updateButtons();narrative.classList.add('is-changing');
    await delay(420);if(token!==generation)return;
    stage=value;renderAct();narrative.classList.remove('is-changing');
    await delay(420);if(token!==generation)return;
    busy=false;updateButtons();
  }
  async function enterPainting(){
    if(!state.ready||busy||leaving)return;
    leaving=true;busy=true;root.inert=true;cancelAnimationFrame(raf);
    // Transfer this exact camera before revealing the original 2.1.14 gameplay.
    state.view={...view};setMode('seek');
    root.classList.add('is-leaving');
    await delay(1100);
    root.hidden=true;scene.focus({preventScroll:true});
  }
  async function start(){
    if(started)return;
    const token=++generation;started=true;drawCover();
    try{
      art.src=$('painting').currentSrc||chapter.native;
      await Promise.all([art.decode(),document.fonts.load('24px LanternEntryWenKai')]);
      if(token!==generation)return;
      root.hidden=false;root.inert=true;cover.inert=true;
      renderAct();paint();last=0;
      // Match Lantern 1.1.0: retain the cover during load, then overlap the fades.
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      if(token!==generation)return;
      root.classList.add('is-opening');cover.classList.add('is-opening-scroll');
      raf=requestAnimationFrame(tick);
      await delay(1050);if(token!==generation)return;
      coverHidden=true;cover.hidden=true;arrived=true;root.inert=false;
      root.classList.add('has-arrived');next.focus({preventScroll:true});
    }catch{
      if(token!==generation)return;
      started=false;cover.inert=false;drawCover();
      $('intro-next').querySelector('span').textContent='重新展卷';
    }
  }
  function drawCover(){
    if(arrived){updateButtons();return;}
    if(started){$('intro-next').disabled=true;$('intro-next').querySelector('span').textContent='正在展卷';return;}
    cover.classList.add('lantern-entry-cover-v1');cover.setAttribute('aria-label','在人群中聽樂封面');
    $('intro-narrative').innerHTML='<p class="intro-chapter">清代 · 康衢駢慶</p><p class="intro-story">乾隆為母親崇慶皇太后祝壽。<br>畫家把沿街的人群與慶典，<br>留在這一卷裡。</p>';
    $('intro-next').disabled=false;
    $('intro-next').innerHTML='<span>走進這一卷</span>'+icon('ArrowRight',23);
    $('intro-next').onclick=start;
    cover.querySelector('.intro-sequence').hidden=true;
  }
  function reset(){
    generation++;cancelAnimationFrame(raf);
    started=false;arrived=false;coverHidden=false;busy=false;leaving=false;stage=0;drift=0;last=0;
    paused=reduced.matches;root.hidden=true;root.inert=true;root.classList.remove('is-opening','has-arrived','is-leaving');
    narrative.classList.remove('is-changing');cover.classList.remove('is-opening-scroll');cover.inert=false;
  }
  next.onclick=()=>{if(busy||!arrived||leaving)return;if(revealing)finishReveal();else if(stage<2)void changeAct(stage+1);else void enterPainting();};
  back.onclick=()=>void changeAct(Math.max(0,stage-1));
  narrative.onclick=()=>{if(arrived&&!busy&&!leaving)finishReveal();};
  motion.onclick=()=>{paused=!paused;updateButtons();};
  reduced.addEventListener('change',()=>{paused=reduced.matches;if(reduced.matches&&revealing)finishReveal();updateButtons();});
  new ResizeObserver(paint).observe(root);
  document.addEventListener('visibilitychange',()=>{last=0;});
  return {drawCover,reset,get coverHidden(){return coverHidden;}};
})();
