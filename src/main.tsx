import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app'
import { enableMocking } from '@/mocks'

import './index.css'

const root = createRoot(document.getElementById('root')!)

const renderApp = () => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

enableMocking().then(renderApp)
