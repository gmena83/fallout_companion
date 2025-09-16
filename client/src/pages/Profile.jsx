import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, isAuthenticated, isGuest } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    profile: {
      level: 1,
      platform: 'PC',
      playtime: 0
    },
    preferences: {
      theme: 'classic',
      notifications: true,
      publicProfile: true
    }
  })

  useEffect(() => {
    if (isAuthenticated && !isGuest) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, isGuest])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/users/profile')
      setProfile(response.data.user)
      setFormData({
        profile: response.data.user.profile || formData.profile,
        preferences: response.data.user.preferences || formData.preferences
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    try {
      const response = await axios.put('/users/profile', formData)
      setProfile(response.data.user)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="pip-card text-center">
          <h1 className="pip-header">ACCESS DENIED</h1>
          <p className="pip-text mb-6">Please login to view your profile</p>
          <a href="/auth" className="pip-button primary">LOGIN</a>
        </div>
      </div>
    )
  }

  if (isGuest) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="pip-card text-center">
          <h1 className="pip-header">GUEST PROFILE</h1>
          <div className="mb-6">
            <div className="pip-screen p-6 mb-4">
              <h2 className="pip-text font-bold text-lg mb-2">👤 {user.username}</h2>
              <p className="pip-text-dim">Guest User</p>
            </div>
            <div className="p-4 border border-pip-amber-500 rounded bg-pip-amber-500 bg-opacity-10">
              <p className="pip-text text-pip-amber-400 mb-4">
                🚀 You're using a guest account with limited features
              </p>
              <ul className="pip-text-dim text-sm space-y-1 mb-4">
                <li>❌ Cannot save builds or progress</li>
                <li>❌ Cannot customize profile</li>
                <li>❌ Cannot track farming progress</li>
                <li>❌ No permanent data storage</li>
              </ul>
              <a href="/auth" className="pip-button primary">
                CREATE ACCOUNT FOR FULL ACCESS
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="pip-card text-center py-12">
          <div className="pip-loading">LOADING PROFILE</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="pip-card">
        <h1 className="pip-header">USER PROFILE</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="pip-screen p-4">
              <div className="w-16 h-16 bg-pip-green-500 rounded-full flex items-center justify-center">
                <span className="font-pip font-bold text-crt-dark text-xl">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h2 className="pip-text font-bold text-xl">{user?.username}</h2>
              <p className="pip-text-dim">{user?.email}</p>
              <p className="pip-text-dim text-sm">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="pip-button"
          >
            {editing ? 'CANCEL' : 'EDIT PROFILE'}
          </button>
        </div>
      </div>

      {/* Game Profile */}
      <div className="pip-card">
        <h2 className="pip-text font-bold text-lg mb-4">🎮 GAME PROFILE</h2>
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="pip-label">CHARACTER LEVEL</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  className="pip-input w-full"
                  value={formData.profile.level}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: { ...formData.profile, level: parseInt(e.target.value) || 1 }
                  })}
                />
              </div>
              <div>
                <label className="pip-label">PLATFORM</label>
                <select
                  className="pip-select w-full"
                  value={formData.profile.platform}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: { ...formData.profile, platform: e.target.value }
                  })}
                >
                  <option value="PC">PC</option>
                  <option value="PlayStation">PlayStation</option>
                  <option value="Xbox">Xbox</option>
                </select>
              </div>
            </div>
            <div>
              <label className="pip-label">PLAYTIME (HOURS)</label>
              <input
                type="number"
                min="0"
                className="pip-input w-full"
                value={formData.profile.playtime}
                onChange={(e) => setFormData({
                  ...formData,
                  profile: { ...formData.profile, playtime: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="pip-screen p-4 text-center">
              <h3 className="pip-text font-bold">LEVEL</h3>
              <p className="pip-text text-2xl">{profile?.profile?.level || 1}</p>
            </div>
            <div className="pip-screen p-4 text-center">
              <h3 className="pip-text font-bold">PLATFORM</h3>
              <p className="pip-text">{profile?.profile?.platform || 'PC'}</p>
            </div>
            <div className="pip-screen p-4 text-center">
              <h3 className="pip-text font-bold">PLAYTIME</h3>
              <p className="pip-text">{profile?.profile?.playtime || 0}h</p>
            </div>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="pip-card">
        <h2 className="pip-text font-bold text-lg mb-4">⚙️ PREFERENCES</h2>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="pip-label">UI THEME</label>
              <select
                className="pip-select w-full"
                value={formData.preferences.theme}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, theme: e.target.value }
                })}
              >
                <option value="classic">Classic Green</option>
                <option value="amber">Amber</option>
                <option value="blue">Blue</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="notifications"
                className="pip-input"
                checked={formData.preferences.notifications}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, notifications: e.target.checked }
                })}
              />
              <label htmlFor="notifications" className="pip-label mb-0">
                ENABLE NOTIFICATIONS
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="publicProfile"
                className="pip-input"
                checked={formData.preferences.publicProfile}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, publicProfile: e.target.checked }
                })}
              />
              <label htmlFor="publicProfile" className="pip-label mb-0">
                PUBLIC PROFILE
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="pip-text">UI Theme:</span>
              <span className="pip-text-dim">{profile?.preferences?.theme || 'classic'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="pip-text">Notifications:</span>
              <span className="pip-text-dim">
                {profile?.preferences?.notifications ? '✅ Enabled' : '❌ Disabled'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="pip-text">Public Profile:</span>
              <span className="pip-text-dim">
                {profile?.preferences?.publicProfile ? '🌐 Public' : '🔒 Private'}
              </span>
            </div>
          </div>
        )}

        {editing && (
          <div className="pt-4 border-t border-pip-green-600 mt-6">
            <div className="flex gap-4">
              <button
                onClick={updateProfile}
                className="pip-button primary"
              >
                SAVE CHANGES
              </button>
              <button
                onClick={() => setEditing(false)}
                className="pip-button"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="pip-card">
        <h2 className="pip-text font-bold text-lg mb-4">📊 STATISTICS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="pip-screen p-3 text-center">
            <h3 className="pip-text-dim text-sm">BUILDS CREATED</h3>
            <p className="pip-text text-xl">{profile?.buildCount || 0}</p>
          </div>
          <div className="pip-screen p-3 text-center">
            <h3 className="pip-text-dim text-sm">FAVORITES</h3>
            <p className="pip-text text-xl">{profile?.profile?.favoriteBuilds?.length || 0}</p>
          </div>
          <div className="pip-screen p-3 text-center">
            <h3 className="pip-text-dim text-sm">FARMING ITEMS</h3>
            <p className="pip-text text-xl">{profile?.profile?.farmingProgress?.length || 0}</p>
          </div>
          <div className="pip-screen p-3 text-center">
            <h3 className="pip-text-dim text-sm">ACCOUNT TYPE</h3>
            <p className="pip-text text-sm">{user?.role?.toUpperCase() || 'USER'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile