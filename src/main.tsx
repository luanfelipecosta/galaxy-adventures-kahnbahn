import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app'

import './index.css'

const root = createRoot(document.getElementById('root')!)
const shouldEnableMocks = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === 'true'

const renderApp = () => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

if (shouldEnableMocks) {
  import('@/mocks')
    .then(({ enableMocking }) => enableMocking())
    .then(renderApp)
} else {
  renderApp()
}
