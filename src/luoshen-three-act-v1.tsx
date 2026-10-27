import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {LuoshenThreeActGameV1} from './components/LuoshenThreeActGameV1.tsx';
import {VersionedLuoshenChapter} from './entries/VersionedLuoshenChapter.tsx';
import './styles.css';
import './page-motion.css';
import './page-motion.js';
createRoot(document.getElementById('root')!).render(<StrictMode><VersionedLuoshenChapter Game={LuoshenThreeActGameV1}/></StrictMode>);
