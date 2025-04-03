
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "node:path"
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),basicSsl()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    https:true
  },
})