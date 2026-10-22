import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({command,isPreview}) => ({
  base: command === 'build'||isPreview ? '/chinese-wally/' : '/',
  plugins: [react()],
  // Preserve both standard and WebKit backdrop filters. The default CSS
  // minifier drops the standard declaration when these are paired.
  build: {cssMinify: false},
}));
