import { Fragment, StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import {ExaminationStreetLifeGame} from './components/ExaminationStreetLifeGame.tsx';
import './styles.css';
import './page-motion.css';
import './page-motion.js';
import { LanternGame } from './components/LanternGame.tsx';
import { LanternDialoguePreview } from './components/LanternDialoguePreview.tsx';
import {LanternAcrobatPreview} from './components/LanternAcrobatPreview.tsx';
import {LanternMarketPreview} from './components/LanternMarketPreview.tsx';
import { LanternJournalPreview } from './components/LanternJournalPreview.tsx';
import { KangquGame } from './components/KangquGame.tsx';

function GameRouter() {
  const [routeHash, setRouteHash] = useState(window.location.hash);
  const [coverRevision, setCoverRevision] = useState(0);
  useEffect(() => {
    const route = () => {
      if (window.location.hash === '#temple-fair') window.history.replaceState(null, '', '#examination');
      if (window.location.hash === '#historical-paintings') window.history.replaceState(null, '', '#lantern-festival');
      setRouteHash(window.location.hash);
    };
    route();
    window.addEventListener('hashchange', route);
    const cover = () => setCoverRevision(value => value + 1);
    window.addEventListener('chapter-cover', cover);
    return () => {window.removeEventListener('hashchange', route);window.removeEventListener('chapter-cover', cover);};
  }, []);
  return <Fragment key={coverRevision}>{routeHash === '#temple-fair' || routeHash === '#examination' || routeHash === '#examination-street-life-preview' ? <ExaminationStreetLifeGame/> : routeHash === '#kangqu-listening' ? <KangquGame/> : routeHash === '#market-preview' ? <LanternMarketPreview/> : routeHash === '#acrobat-preview' ? <LanternAcrobatPreview/> : routeHash === '#journal-preview' ? <LanternJournalPreview/> : routeHash === '#dialogue-preview' ? <LanternDialoguePreview/> : routeHash === '#legacy-practice' ? <App/> : <LanternGame/>}</Fragment>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><GameRouter/></StrictMode>);
