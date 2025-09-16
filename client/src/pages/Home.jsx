import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { isAuthenticated, user, guestLogin } = useAuth()

  const handleGuestAccess = async () => {
    await guestLogin()
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="pip-card text-center">
        <h1 className="pip-header">WELCOME TO THE WASTELAND</h1>
        <p className="pip-text text-lg mb-6">
          Your comprehensive companion for Fallout 76 adventures
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="pip-screen p-4">
            <h3 className="pip-text font-bold mb-2">⚔️ BUILD CREATOR</h3>
            <p className="pip-text-dim text-sm">
              Create, share, and optimize character builds with our interactive SPECIAL planner
            </p>
          </div>
          <div className="pip-screen p-4">
            <h3 className="pip-text font-bold mb-2">📦 ITEM DATABASE</h3>
            <p className="pip-text-dim text-sm">
              Search through thousands of items, weapons, and armor with detailed stats
            </p>
          </div>
          <div className="pip-screen p-4">
            <h3 className="pip-text font-bold mb-2">💬 AI ASSISTANT</h3>
            <p className="pip-text-dim text-sm">
              Get help from our RAG-powered AI that knows the wasteland inside and out
            </p>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth" className="pip-button primary">
              CREATE ACCOUNT
            </Link>
            <button onClick={handleGuestAccess} className="pip-button">
              CONTINUE AS GUEST
            </button>
          </div>
        )}
      </div>

      {/* Welcome Back Section */}
      {isAuthenticated && (
        <div className="pip-card">
          <h2 className="pip-header text-xl">
            Welcome back, {user?.username}!
          </h2>
          {user?.role === 'guest' && (
            <div className="mb-4 p-4 border border-pip-amber-500 rounded bg-pip-amber-500 bg-opacity-10">
              <p className="pip-text text-pip-amber-400">
                📝 You're browsing as a guest. <Link to="/auth" className="underline">Create an account</Link> to save builds and track progress!
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/builds" className="pip-screen p-4 hover:bg-pip-green-500 hover:bg-opacity-5 transition-colors">
              <h3 className="pip-text font-bold mb-2">🏗️ MY BUILDS</h3>
              <p className="pip-text-dim text-sm">View and manage your character builds</p>
            </Link>
            <Link to="/items?farming=true" className="pip-screen p-4 hover:bg-pip-green-500 hover:bg-opacity-5 transition-colors">
              <h3 className="pip-text font-bold mb-2">📋 FARMING LIST</h3>
              <p className="pip-text-dim text-sm">Track your farming progress</p>
            </Link>
            <Link to="/chat" className="pip-screen p-4 hover:bg-pip-green-500 hover:bg-opacity-5 transition-colors">
              <h3 className="pip-text font-bold mb-2">🤖 ASK AI</h3>
              <p className="pip-text-dim text-sm">Get instant help and advice</p>
            </Link>
            <Link to="/profile" className="pip-screen p-4 hover:bg-pip-green-500 hover:bg-opacity-5 transition-colors">
              <h3 className="pip-text font-bold mb-2">⚙️ PROFILE</h3>
              <p className="pip-text-dim text-sm">Manage your account settings</p>
            </Link>
          </div>
        </div>
      )}

      {/* Featured Builds Section */}
      <div className="pip-card">
        <h2 className="pip-header text-xl">FEATURED BUILDS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Placeholder build cards */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="pip-screen p-4">
              <h3 className="pip-text font-bold mb-2">Stealth Sniper Build</h3>
              <p className="pip-text-dim text-sm mb-3">
                Perfect for solo players who prefer long-range combat
              </p>
              <div className="flex justify-between items-center text-xs pip-text-dim">
                <span>Level 50+</span>
                <span>⭐ 4.8 (127)</span>
                <span>👁️ 2.1k</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/builds" className="pip-button">
            VIEW ALL BUILDS
          </Link>
        </div>
      </div>

      {/* Latest Updates */}
      <div className="pip-card">
        <h2 className="pip-header text-xl">LATEST UPDATES</h2>
        <div className="space-y-4">
          <div className="pip-screen p-4">
            <h3 className="pip-text font-bold">v1.0.0 - Initial Release</h3>
            <p className="pip-text-dim text-sm mt-2">
              🎉 Launch of the Fallout 76 Companion with build creator, item database, and AI chat
            </p>
          </div>
          <div className="pip-screen p-4">
            <h3 className="pip-text font-bold">Database Update</h3>
            <p className="pip-text-dim text-sm mt-2">
              📦 Added 500+ new items and updated weapon stats for latest game patch
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home