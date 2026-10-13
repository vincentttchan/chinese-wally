import {useEffect,useRef,useState} from 'react';
import {assetPath} from '../game/assets.ts';
import {createChapterMusic} from './chapterMusic.js';
import type {ChapterMusic,SoundState} from './chapterMusic.js';
import {chapterMusicTracks} from './chapterMusicTracks.js';
import type {ChapterMusicTrack} from './chapterMusicTracks.js';

/** A chapter's own score, enabled only by the player's music-button gesture. */
export function useAmbience(quiet:boolean,track:ChapterMusicTrack=chapterMusicTracks.lantern){
  const [state,setState]=useState<SoundState>('off');
  const engine=useRef<ChapterMusic|null>(null),quietRef=useRef(quiet);
  quietRef.current=quiet;
  const url=assetPath(track.path);
  useEffect(()=>{
    const item=createChapterMusic(url,setState,quietRef.current);
    engine.current=item;setState('off');
    return()=>{item.dispose();if(engine.current===item)engine.current=null;};
  },[url]);
  useEffect(()=>{engine.current?.setQuiet(quiet);},[quiet]);
  return {state,toggle:async()=>{await engine.current?.toggle();}};
}
