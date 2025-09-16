import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Builds from './pages/Builds'
import Items from './pages/Items'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Auth from './pages/Auth'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builds" element={<Builds />} />
          <Route path="/items" element={<Items />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
