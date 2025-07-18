// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    base: '/',

    build: {
        outDir: 'dist',
        minify: false
    }
    /* server: {
        host:true,
        allowedHosts: ['localhost','1de4f70d2808.ngrok-free.app'],
    }*/
});
