import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import checker from 'vite-plugin-checker';
// https://vite.dev/config/
export default defineConfig({
  plugins: [checker({
    typescript: true, // uses your tsconfig.json
    // optionally:
    // eslint: {
    //   lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
    // },
  }),react(), tailwindcss(), ],
})
