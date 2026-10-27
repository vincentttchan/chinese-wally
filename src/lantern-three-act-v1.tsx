import {StrictMode, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {LanternThreeActGameV1} from './components/LanternThreeActGameV1.tsx';
import {assetPath} from './game/assets.ts';
import './styles.css';
import './page-motion.css';
import './page-motion.js';

function VersionedChapter() {
  const [revision,setRevision]=useState(0);
  useEffect(()=>{
    const cover=()=>setRevision(value=>value+1);
    const navigate=()=>{
      const hash=window.location.hash;
      if(hash && hash!=='#lantern-festival')window.location.assign(assetPath(`index.html${hash}`));
    };
    window.addEventListener('chapter-cover',cover);
    window.addEventListener('hashchange',navigate);
    navigate();
    return()=>{window.removeEventListener('chapter-cover',cover);window.removeEventListener('hashchange',navigate);};
  },[]);
  return <LanternThreeActGameV1 key={revision}/>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><VersionedChapter/></StrictMode>);
