import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import ActionDialog from './components/ActionDialog'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={<div role="status" className="p-8">Yuklanmoqda…</div>}><App /></React.Suspense>
    <ActionDialog />
  </React.StrictMode>,
)
