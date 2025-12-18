import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from 'react-oidc-context'
import { googleOidcConfig } from './oidc-config.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...googleOidcConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
)
