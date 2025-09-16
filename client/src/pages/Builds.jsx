import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const Builds = () => {
  const { isAuthenticated, isGuest } = useAuth()
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    buildType: '',
    playStyle: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [showMyBuilds, setShowMyBuilds] = useState(false)

  useEffect(() => {
    fetchBuilds()
  }, [filters, showMyBuilds])

  const fetchBuilds = async () => {
    try {
      setLoading(true)
      const endpoint = showMyBuilds ? '/builds/my-builds' : '/builds'
      const params = showMyBuilds ? {} : filters
      
      const response = await axios.get(endpoint, { params })
      setBuilds(showMyBuilds ? response.data.builds : response.data.builds)
    } catch (error) {
      console.error('Error fetching builds:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const buildTypes = ['PvP', 'PvE', 'Solo', 'Team', 'Stealth', 'Tank', 'DPS', 'Support', 'Hybrid']
  const playStyles = ['Melee', 'Ranged', 'Heavy Weapons', 'Energy Weapons', 'Explosives', 'Stealth', 'Mixed']

  return (
    <div className="space-y-6">
      <div className="pip-card">
        <h1 className="pip-header">CHARACTER BUILDS</h1>
        
        {/* Toggle between all builds and user builds */}
        {isAuthenticated && !isGuest && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowMyBuilds(false)}
              className={`pip-button ${!showMyBuilds ? 'primary' : ''}`}
            >
              ALL BUILDS
            </button>
            <button
              onClick={() => setShowMyBuilds(true)}
              className={`pip-button ${showMyBuilds ? 'primary' : ''}`}
            >
              MY BUILDS
            </button>
          </div>
        )}

        {/* Filters */}
        {!showMyBuilds && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="pip-label">SEARCH</label>
              <input
                type="text"
                className="pip-input w-full"
                placeholder="Search builds..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div>
              <label className="pip-label">BUILD TYPE</label>
              <select
                className="pip-select w-full"
                value={filters.buildType}
                onChange={(e) => handleFilterChange('buildType', e.target.value)}
              >
                <option value="">All Types</option>
                {buildTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="pip-label">PLAY STYLE</label>
              <select
                className="pip-select w-full"
                value={filters.playStyle}
                onChange={(e) => handleFilterChange('playStyle', e.target.value)}
              >
                <option value="">All Styles</option>
                {playStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="pip-label">SORT BY</label>
              <select
                className="pip-select w-full"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  handleFilterChange('sortBy', sortBy)
                  handleFilterChange('sortOrder', sortOrder)
                }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="likes-desc">Most Liked</option>
                <option value="views-desc">Most Viewed</option>
                <option value="name-asc">Name A-Z</option>
              </select>
            </div>
          </div>
        )}

        {/* Create Build Button */}
        {isAuthenticated && !isGuest && (
          <div className="mb-6">
            <button className="pip-button primary">
              ⚔️ CREATE NEW BUILD
            </button>
          </div>
        )}

        {/* Guest Notice */}
        {isGuest && (
          <div className="mb-6 p-4 border border-pip-amber-500 rounded bg-pip-amber-500 bg-opacity-10">
            <p className="pip-text text-pip-amber-400">
              👤 Guests can browse builds but cannot create or save them. 
              <a href="/auth" className="underline ml-1">Create an account</a> to unlock full features!
            </p>
          </div>
        )}
      </div>

      {/* Builds Grid */}
      {loading ? (
        <div className="pip-card text-center py-12">
          <div className="pip-loading">LOADING BUILDS</div>
        </div>
      ) : builds.length === 0 ? (
        <div className="pip-card text-center py-12">
          <p className="pip-text">
            {showMyBuilds ? 'No builds created yet' : 'No builds found'}
          </p>
          {showMyBuilds && (
            <button className="pip-button primary mt-4">
              CREATE YOUR FIRST BUILD
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {builds.map((build) => (
            <BuildCard key={build._id} build={build} />
          ))}
        </div>
      )}
    </div>
  )
}

const BuildCard = ({ build }) => {
  return (
    <div className="pip-card">
      <div className="flex justify-between items-start mb-3">
        <h3 className="pip-text font-bold text-lg">{build.name}</h3>
        <span className="pip-text-dim text-sm">Lv.{build.level}</span>
      </div>
      
      <p className="pip-text-dim text-sm mb-4 line-clamp-3">
        {build.description || 'No description provided'}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-pip-green-600 bg-opacity-20 border border-pip-green-600 rounded text-xs pip-text">
          {build.buildType}
        </span>
        {build.playStyle && (
          <span className="px-2 py-1 bg-pip-green-600 bg-opacity-20 border border-pip-green-600 rounded text-xs pip-text">
            {build.playStyle}
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center text-xs pip-text-dim mb-4">
        <span>by {build.author?.username || 'Unknown'}</span>
        <div className="flex gap-3">
          <span>❤️ {build.likes?.length || 0}</span>
          <span>👁️ {build.views || 0}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button className="pip-button flex-1">VIEW</button>
        <button className="pip-button">❤️</button>
      </div>
    </div>
  )
}

export default Builds