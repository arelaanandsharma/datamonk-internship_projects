import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
     proxy: {
    '/api': 'http://EC2_PUBLIC_IP'     // yahi par apna EC2 public IP
  } 
  },
  build: {
    outDir: 'dist'
  }
})
