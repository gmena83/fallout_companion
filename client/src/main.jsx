import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'pip-card',
          style: {
            background: 'rgba(0, 17, 0, 0.95)',
            color: '#00ff00',
            border: '1px solid #22c55e',
            fontFamily: 'Share Tech Mono, monospace'
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
