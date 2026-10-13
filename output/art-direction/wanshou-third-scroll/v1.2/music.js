/* Shared audio engine, canonical button and hand-painted icons. */
const musicButton=document.getElementById('music-toggle');
const musicTrack=chapterMusicTracks.kangqu;
function showChapterSoundState(soundState){
 const label=soundState==='on'?'關閉音樂':soundState==='loading'?'音樂載入中，點擊取消':soundState==='error'?'重試本章音樂':'開啟本章音樂';
 musicButton.setAttribute('aria-label',label);musicButton.title=label;
 musicButton.setAttribute('aria-pressed',String(soundState==='on'||soundState==='loading'));
 musicButton.innerHTML=icon(soundState==='on'?'Volume2':'VolumeX',19);
 if(soundState==='error')announce('音樂未能載入，可再次點擊重試。');
}
const chapterMusicUrl=new URL('../../../../public/'+musicTrack.path,location.href).href;
let chapterSound=createChapterMusic(chapterMusicUrl,showChapterSoundState,true);
function updateChapterSound(){chapterSound.setQuiet(!state.ready||!['seek','free'].includes(state.mode)||state.busy||state.menuOpen||state.hintOpen||Boolean(state.speaker));}
musicButton.onclick=()=>{if(state.ready)void chapterSound.toggle();};
document.getElementById('music-credit').innerHTML=`配樂：<a href="${musicTrack.source}" target="_blank" rel="noopener noreferrer">${musicTrack.title} · ${musicTrack.author}</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>。本章背景配樂，並非畫中所奏曲目的復原。`;
window.addEventListener('pagehide',()=>{chapterSound.dispose();showChapterSoundState('off');});
window.addEventListener('pageshow',event=>{
 if(!event.persisted)return;
 chapterSound=createChapterMusic(chapterMusicUrl,showChapterSoundState,true);updateChapterSound();
});
window.addEventListener('message',event=>{
 if(event.source===window.parent&&event.origin===window.location.origin&&event.data?.type==='kangqu-host-stop')chapterSound.dispose();
});
