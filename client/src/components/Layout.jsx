import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated, isGuest } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'HOME', icon: '🏠' },
    { path: '/builds', label: 'BUILDS', icon: '⚔️' },
    { path: '/items', label: 'ITEMS', icon: '📦' },
    { path: '/chat', label: 'CHAT', icon: '💬' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="pip-nav px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="pip-screen p-2">
              <div className="w-8 h-8 bg-pip-green-500 rounded flex items-center justify-center">
                <span className="font-pip font-bold text-crt-dark text-sm">76</span>
              </div>
            </div>
            <h1 className="pip-header text-xl mb-0">FALLOUT COMPANION</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`pip-nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className={`pip-nav-link ${isActive('/profile') ? 'active' : ''}`}
                >
                  <span className="mr-2">👤</span>
                  {user?.username}
                  {isGuest && <span className="text-xs ml-1">(GUEST)</span>}
                </Link>
                <button
                  onClick={logout}
                  className="pip-button"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <Link to="/auth" className="pip-button primary">
                LOGIN
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`pip-nav-link text-sm ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="pip-nav px-4 py-6 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="pip-text-dim text-sm">
            <p>FALLOUT 76 COMPANION v1.0.0</p>
            <p className="mt-2">
              Built with MERN Stack • Pip-Boy Interface • RAG-Powered AI Chat
            </p>
            <p className="mt-2 text-xs">
              This is an unofficial companion app. Fallout and related trademarks are property of Bethesda Softworks LLC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout