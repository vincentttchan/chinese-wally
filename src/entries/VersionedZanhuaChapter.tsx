import {useEffect,useState} from 'react';
import type {ComponentType} from 'react';
import {assetPath} from '../game/assets.ts';

/** Standalone review versions keep existing cover and cross-chapter navigation. */
export function VersionedZanhuaChapter({Game}:{Game:ComponentType}){
 const [revision,setRevision]=useState(0);
 useEffect(()=>{
  const cover=()=>setRevision(value=>value+1);
  const navigate=()=>{const hash=window.location.hash;if(hash&&hash!=='#zanhua')window.location.assign(assetPath(`index.html${hash}`));};
  window.addEventListener('chapter-cover',cover);window.addEventListener('hashchange',navigate);navigate();
  return()=>{window.removeEventListener('chapter-cover',cover);window.removeEventListener('hashchange',navigate);};
 },[]);
 return <Game key={revision}/>;
}
