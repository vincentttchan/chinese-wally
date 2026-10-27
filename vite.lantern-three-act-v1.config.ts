import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

/** Independent chapter build; never runs the site's public/index.html packager. */
export default defineConfig({
  base:'/chinese-wally/',
  plugins:[react()],
  build:{
    outDir:'output/releases/lantern-three-act-v1-2026-10-27/build',
    copyPublicDir:false,
    cssMinify:false,
    rollupOptions:{input:'lantern-three-act-v1.html'},
  },
});
