import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ZanhuaPreview} from './components/ZanhuaPreview.tsx';
import './styles.css';

createRoot(document.getElementById('root')!).render(<StrictMode><ZanhuaPreview/></StrictMode>);
