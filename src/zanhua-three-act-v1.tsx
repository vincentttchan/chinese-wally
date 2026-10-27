import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ZanhuaThreeActGameV1} from './components/ZanhuaThreeActGameV1.tsx';
import {VersionedZanhuaChapter} from './entries/VersionedZanhuaChapter.tsx';
import './styles.css';
import './page-motion.css';
import './page-motion.js';

createRoot(document.getElementById('root')!).render(<StrictMode><VersionedZanhuaChapter Game={ZanhuaThreeActGameV1}/></StrictMode>);
