import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const { login, register, guestLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const result = await login({ 
          email: formData.email, 
          password: formData.password 
        })
        if (result.success) {
          toast.success('Welcome back to the wasteland!')
          navigate('/')
        } else {
          toast.error(result.error)
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match')
          return
        }
        const result = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
        if (result.success) {
          toast.success('Welcome to the wasteland!')
          navigate('/')
        } else {
          toast.error(result.error)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setLoading(true)
    try {
      const result = await guestLogin()
      if (result.success) {
        toast.success('Entering as guest explorer')
        navigate('/')
      } else {
        toast.error(result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/${provider}`
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="pip-card">
        <h1 className="pip-header">
          {isLogin ? 'ACCESS TERMINAL' : 'REGISTER USER'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="pip-label">USERNAME</label>
              <input
                type="text"
                className="pip-input w-full"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="pip-label">EMAIL</label>
            <input
              type="email"
              className="pip-input w-full"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="pip-label">PASSWORD</label>
            <input
              type="password"
              className="pip-input w-full"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="pip-label">CONFIRM PASSWORD</label>
              <input
                type="password"
                className="pip-input w-full"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required={!isLogin}
              />
            </div>
          )}

          <button
            type="submit"
            className="pip-button primary w-full"
            disabled={loading}
          >
            {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'REGISTER')}
          </button>
        </form>

        <div className="pip-divider"></div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleOAuthLogin('google')}
            className="pip-button w-full"
            disabled={loading}
          >
            🌐 CONTINUE WITH GOOGLE
          </button>
          <button
            onClick={() => handleOAuthLogin('discord')}
            className="pip-button w-full"
            disabled={loading}
          >
            💬 CONTINUE WITH DISCORD
          </button>
        </div>

        <div className="pip-divider"></div>

        {/* Guest Access */}
        <button
          onClick={handleGuestLogin}
          className="pip-button w-full"
          disabled={loading}
        >
          🕵️ CONTINUE AS GUEST
        </button>

        <div className="pip-divider"></div>

        {/* Toggle Login/Register */}
        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="pip-text underline"
          >
            {isLogin 
              ? "Don't have an account? Register" 
              : "Already have an account? Login"
            }
          </button>
        </div>

        {/* Guest Info */}
        <div className="mt-6 p-3 border border-pip-green-600 rounded bg-pip-green-500 bg-opacity-5">
          <h3 className="pip-text font-bold text-sm mb-2">GUEST ACCESS</h3>
          <ul className="pip-text-dim text-xs space-y-1">
            <li>✅ Browse builds and items</li>
            <li>✅ Use AI chat assistant</li>
            <li>❌ Save builds or progress</li>
            <li>❌ Create custom builds</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Auth