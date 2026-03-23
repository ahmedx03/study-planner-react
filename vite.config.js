import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/study-planner-react/', // matches repo name: ahmedx03/study-planner-react
})
