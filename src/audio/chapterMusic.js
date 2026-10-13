/** Shared by React chapters and the packaged, standalone Kangqu document. */
export function createChapterMusic(url,onState,initialQuiet=false) {
  let engine=null,wanted=false,quiet=initialQuiet,disposed=false;
  const report=value=>{if(!disposed)onState(value);};
  const level=()=>{
    if(!engine)return;
    const volume=wanted&&!document.hidden?(quiet ? .07 : .19):0;
    if(engine.audio){engine.target=volume;return;}
    engine.master.gain.setTargetAtTime(volume,engine.context.currentTime,.45);
  };
  const release=item=>{
    if(!item)return;
    if(item.timer!==null)clearInterval(item.timer);
    if(item.audio){item.audio.pause();item.audio.removeAttribute('src');item.audio.load();return;}
    item.controller.abort();
    item.sources.forEach(source=>{try{source.stop();}catch{/* Already ended. */}});
    void item.context.close();
  };
  const fail=item=>{
    if(disposed||engine!==item||!wanted)return;
    wanted=false;release(item);engine=null;report('error');
  };
  document.addEventListener('visibilitychange',level);
  const toggle=async()=>{
    if(disposed)return;
    wanted=!wanted;
    if(!wanted){report('off');level();return;}
    report('loading');
    let item;
    try{
      if(!engine){
        if(window.location.protocol==='file:'){
          // File documents cannot fetch/decode an MP3 through Web Audio reliably.
          const audio=new Audio(url);audio.preload='none';audio.loop=true;audio.volume=0;
          item={audio,target:0,timer:null};engine=item;
          audio.addEventListener('error',()=>fail(item));
          item.timer=setInterval(()=>{
            const target=document.hidden?0:item.target;
            audio.volume=Math.max(0,Math.min(1,audio.volume+(target-audio.volume)*.18));
          },80);
        }else{
          const context=new AudioContext(),master=context.createGain(),controller=new AbortController();
          master.gain.value=0;master.connect(context.destination);
          const ready=fetch(url,{signal:controller.signal}).then(async response=>{
            if(!response.ok)throw new Error('Music unavailable');
            return context.decodeAudioData(await response.arrayBuffer());
          });
          engine={context,master,controller,ready,sources:new Set(),timer:null,started:false};
          ready.catch(()=>{});
        }
      }
      item=engine;
      if(item.audio){
        await item.audio.play();
        if(disposed||engine!==item||!wanted)return;
        level();report('on');return;
      }
      await item.context.resume();
      const music=await item.ready;
      if(disposed||engine!==item||!wanted)return;
      if(!item.started){
        const ctx=item.context,fade=Math.min(4,music.duration/4);
        const play=when=>{
          const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=music;
          gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(1,when+fade);
          gain.gain.setValueAtTime(1,when+music.duration-fade);gain.gain.linearRampToValueAtTime(0,when+music.duration);
          source.connect(gain);gain.connect(item.master);item.sources.add(source);
          source.onended=()=>{item.sources.delete(source);source.disconnect();gain.disconnect();};source.start(when);
        };
        const first=ctx.currentTime+.05;play(first);let next=first+music.duration-fade;
        item.timer=setInterval(()=>{
          if(ctx.state!=='running')return;
          if(next<=ctx.currentTime+1.5){const when=Math.max(next,ctx.currentTime+.05);play(when);next=when+music.duration-fade;}
        },500);item.started=true;
      }
      level();report('on');
    }catch{fail(item??engine);}
  };
  return {
    toggle,
    setQuiet(value){if(quiet===value)return;quiet=value;level();},
    dispose(){if(disposed)return;disposed=true;wanted=false;document.removeEventListener('visibilitychange',level);release(engine);engine=null;},
  };
}
