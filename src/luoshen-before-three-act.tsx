import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {LuoshenGame} from './components/LuoshenGame.tsx';
import {VersionedLuoshenChapter} from './entries/VersionedLuoshenChapter.tsx';
import './styles.css';
import './page-motion.css';
import './page-motion.js';
createRoot(document.getElementById('root')!).render(<StrictMode><VersionedLuoshenChapter Game={LuoshenGame}/></StrictMode>);
