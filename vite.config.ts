import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Relative base so the board can be hosted at any path (GitHub Pages, a tablet kiosk, a USB stick).
export default defineConfig({
  base: './',
  plugins: [react()],
});
