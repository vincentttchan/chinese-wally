import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

/** Builds review artifacts only; never writes the site's compiled home page. */
export default defineConfig(({mode})=>{
 const legacy=mode==='legacy';
 return {base:'/chinese-wally/',plugins:[react()],build:{
  outDir:`output/releases/luoshen-three-act-v1-2026-10-27/${legacy?'legacy-build':'build'}`,
  copyPublicDir:false,cssMinify:false,
  rollupOptions:{input:legacy?'luoshen-before-three-act.html':'luoshen-three-act-v1.html'},
 }};
});
