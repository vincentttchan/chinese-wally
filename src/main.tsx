import { Fragment, StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import {ZanhuaPreview as ZanhuaLegacyGame} from './components/ZanhuaPreview.tsx';
import {ZanhuaThreeActGameV1 as ZanhuaGame} from './components/ZanhuaThreeActGameV1.tsx';
import {ExaminationStreetLifeGame} from './components/ExaminationStreetLifeGame.tsx';
import './styles.css';
import './page-motion.css';
import './page-motion.js';
import { LanternGame } from './components/LanternGame.tsx';
import {LanternThreeActGameV1} from './components/LanternThreeActGameV1.tsx';
import { LanternDialoguePreview } from './components/LanternDialoguePreview.tsx';
import {LanternMonkPreview} from './components/LanternMonkPreview.tsx';
import {LanternZhongKuiPreview} from './components/LanternZhongKuiPreview.tsx';
import {LanternTheatrePreview} from './components/LanternTheatrePreview.tsx';
import {LanternStovePreview} from './components/LanternStovePreview.tsx';
import {LanternEmperorPreview} from './components/LanternEmperorPreview.tsx';
import {LanternFireworksPreview} from './components/LanternFireworksPreview.tsx';
import {LanternDrummerPreview} from './components/LanternDrummerPreview.tsx';
import {LanternAcrobatPreview} from './components/LanternAcrobatPreview.tsx';
import {LanternMarketPreview} from './components/LanternMarketPreview.tsx';
import { LanternJournalPreview } from './components/LanternJournalPreview.tsx';
import {KangquAudiencePreview} from './components/KangquAudiencePreview.tsx';
import {KangquFlagsPreview} from './components/KangquFlagsPreview.tsx';
import {KangquEnsemblePreview} from './components/KangquEnsemblePreview.tsx';
import { KangquGame } from './components/KangquGame.tsx';
import { QingmingGame } from './components/QingmingGame.tsx';
import { LuoshenGame } from './components/LuoshenGame.tsx';

function GameRouter() {
  const [routeHash, setRouteHash] = useState(window.location.hash);
  const [coverRevision, setCoverRevision] = useState(0);
  useEffect(() => {
    const route = () => {
      if (window.location.hash === '#temple-fair') window.history.replaceState(null, '', '#examination');
      if (window.location.hash === '#historical-paintings' || window.location.hash === '#painting-selection') window.history.replaceState(null, '', '#lantern-festival');
      setRouteHash(window.location.hash);
    };
    route();
    window.addEventListener('hashchange', route);
    const cover = () => setCoverRevision(value => value + 1);
    window.addEventListener('chapter-cover', cover);
    return () => {window.removeEventListener('hashchange', route);window.removeEventListener('chapter-cover', cover);};
  }, []);
  return <Fragment key={coverRevision}>{routeHash === '#lantern-festival-legacy' ? <LanternGame/> : routeHash === '#zanhua-legacy' ? <ZanhuaLegacyGame/> : routeHash === '#zanhua' ? <ZanhuaGame/> : routeHash === '#luoshen-sleeves-playtest' ? <LuoshenGame key="sleeves-trial" sleeveTrial/> : routeHash === '#luoshen-cloudcar-playtest' ? <LuoshenGame key="cloudcar-trial" cloudCarTrial/> : routeHash === '#luoshen-farewell-playtest' ? <LuoshenGame key="farewell-trial" farewellTrial/> : routeHash === '#luoshen-hairstyle-playtest' ? <LuoshenGame key="hairstyle-trial" hairstyleTrial/> : routeHash === '#kangqu-audience-preview' ? <KangquAudiencePreview/> : routeHash === '#kangqu-flags-preview' ? <KangquFlagsPreview/> : routeHash === '#kangqu-ensemble-preview' ? <KangquEnsemblePreview/> : routeHash === '#luoshen-art-tap-playtest' ? <LuoshenGame key="art-tap-trial" artTapTrial="bird"/> : routeHash === '#luoshen-figure-tap-playtest' ? <LuoshenGame key="figure-tap-trial" artTapTrial="figure"/> : routeHash === '#luoshen-poem-playtest' ? <LuoshenGame key="poem-trial" artTapTrial="reading"/> : routeHash === '#luoshen-dragon-tap-playtest' ? <LuoshenGame key="dragon-tap-trial" dragonTapTrial/> : routeHash === '#luoshen-dragon-playtest' ? <LuoshenGame key="dragon-trial" dragonTrial/> : routeHash === '#luoshen-dragon-preview' ? <LuoshenGame key="dragon-preview-mainline" dragonTapTrial/> : routeHash === '#luoshen-ribbon-playtest' ? <LuoshenGame key="ribbon-trial" ribbonTrial/> : routeHash === '#luoshen-ribbon-preview' ? <LuoshenGame key="figure-preview-mainline" artTapTrial="figure"/> : routeHash === '#luoshen-birds-playtest' ? <LuoshenGame key="birds-trial" birdTrial/> : routeHash === '#luoshen-birds-preview' ? <LuoshenGame key="birds-preview-mainline" artTapTrial="bird"/> : routeHash === '#luoshen' ? <LuoshenGame key="luoshen"/> : routeHash === '#qingming-shanghe' ? <QingmingGame/> : routeHash === '#temple-fair' || routeHash === '#examination' || routeHash === '#examination-street-life-preview' ? <ExaminationStreetLifeGame/> : routeHash === '#kangqu-listening' ? <KangquGame/> : routeHash === '#market-preview' ? <LanternMarketPreview/> : routeHash === '#monk-preview' ? <LanternMonkPreview/> : routeHash === '#zhongkui-preview' ? <LanternZhongKuiPreview/> : routeHash === '#theatre-preview' ? <LanternTheatrePreview/> : routeHash === '#stove-preview' ? <LanternStovePreview/> : routeHash === '#emperor-preview' ? <LanternEmperorPreview/> : routeHash === '#fireworks-preview' ? <LanternFireworksPreview/> : routeHash === '#drummer-preview' ? <LanternDrummerPreview/> : routeHash === '#acrobat-preview' ? <LanternAcrobatPreview/> : routeHash === '#journal-preview' ? <LanternJournalPreview/> : routeHash === '#dialogue-preview' ? <LanternDialoguePreview/> : routeHash === '#legacy-practice' ? <App/> : <LanternThreeActGameV1/>}</Fragment>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><GameRouter/></StrictMode>);
