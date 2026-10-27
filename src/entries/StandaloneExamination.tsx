import {StrictMode,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {ExaminationStreetLifeGame} from '../components/ExaminationStreetLifeGame.tsx';
import {assetPath} from '../game/assets.ts';
import '../styles.css';
import '../page-motion.css';
import '../page-motion.js';

function StandaloneExamination(){
 useEffect(()=>{
  document.title='榜下尋人 · 獨立章節';
  const navigate=()=>{const hash=window.location.hash;if(hash&&hash!=='#examination')window.location.assign(assetPath(`index.html${hash}`));};
  window.addEventListener('hashchange',navigate);
  return()=>window.removeEventListener('hashchange',navigate);
 },[]);
 return <ExaminationStreetLifeGame/>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><StandaloneExamination/></StrictMode>);
