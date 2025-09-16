import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Items = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    rarity: '',
    sortBy: 'name',
    sortOrder: 'asc'
  })
  const [filterOptions, setFilterOptions] = useState({
    types: [],
    categories: [],
    rarities: []
  })
  const [farmingMode, setFarmingMode] = useState(false)

  useEffect(() => {
    fetchFilterOptions()
    fetchItems()
  }, [filters, farmingMode])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const endpoint = farmingMode ? '/items/farming/checklist' : '/items'
      const response = await axios.get(endpoint, { 
        params: farmingMode ? { difficulty: filters.difficulty } : filters 
      })
      setItems(response.data.items)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('/items/meta/filters')
      setFilterOptions(response.data)
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-400',
      uncommon: 'text-pip-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-pip-amber-400'
    }
    return colors[rarity] || 'text-pip-green-400'
  }

  return (
    <div className="space-y-6">
      <div className="pip-card">
        <h1 className="pip-header">ITEM DATABASE</h1>
        
        {/* Mode Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFarmingMode(false)}
            className={`pip-button ${!farmingMode ? 'primary' : ''}`}
          >
            📦 ALL ITEMS
          </button>
          <button
            onClick={() => setFarmingMode(true)}
            className={`pip-button ${farmingMode ? 'primary' : ''}`}
          >
            📋 FARMING CHECKLIST
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="pip-label">SEARCH</label>
            <input
              type="text"
              className="pip-input w-full"
              placeholder="Search items..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          {!farmingMode && (
            <>
              <div>
                <label className="pip-label">TYPE</label>
                <select
                  className="pip-select w-full"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">All Types</option>
                  {filterOptions.types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="pip-label">RARITY</label>
                <select
                  className="pip-select w-full"
                  value={filters.rarity}
                  onChange={(e) => handleFilterChange('rarity', e.target.value)}
                >
                  <option value="">All Rarities</option>
                  {filterOptions.rarities.map(rarity => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {farmingMode && (
            <div>
              <label className="pip-label">DIFFICULTY</label>
              <select
                className="pip-select w-full"
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="very_hard">Very Hard</option>
              </select>
            </div>
          )}

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
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="level-desc">Level High-Low</option>
              <option value="level-asc">Level Low-High</option>
              <option value="value-desc">Value High-Low</option>
            </select>
          </div>
        </div>

        {farmingMode && (
          <div className="mb-6 p-4 border border-pip-green-600 rounded bg-pip-green-500 bg-opacity-5">
            <h3 className="pip-text font-bold mb-2">📋 FARMING CHECKLIST</h3>
            <p className="pip-text-dim text-sm">
              Track your progress collecting renewable items. Click items to add them to your personal farming list.
            </p>
          </div>
        )}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="pip-card text-center py-12">
          <div className="pip-loading">LOADING ITEMS</div>
        </div>
      ) : items.length === 0 ? (
        <div className="pip-card text-center py-12">
          <p className="pip-text">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard 
              key={item._id} 
              item={item} 
              farmingMode={farmingMode}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const ItemCard = ({ item, farmingMode }) => {
  const [isInFarmingList, setIsInFarmingList] = useState(false)
  const [farmingProgress, setFarmingProgress] = useState({ collected: 0, target: 10 })

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'border-gray-500 text-gray-400',
      uncommon: 'border-pip-green-500 text-pip-green-400',
      rare: 'border-blue-500 text-blue-400',
      epic: 'border-purple-500 text-purple-400',
      legendary: 'border-pip-amber-500 text-pip-amber-400'
    }
    return colors[rarity] || 'border-pip-green-500 text-pip-green-400'
  }

  const toggleFarmingList = () => {
    setIsInFarmingList(!isInFarmingList)
    // TODO: API call to update user's farming progress
  }

  return (
    <div className={`pip-card ${getRarityColor(item.rarity)}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="pip-text font-bold text-sm">{item.name}</h3>
        {farmingMode && (
          <button
            onClick={toggleFarmingList}
            className={`pip-button text-xs px-2 py-1 ${isInFarmingList ? 'primary' : ''}`}
          >
            {isInFarmingList ? '✓' : '+'}
          </button>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <span className="pip-text-dim text-xs">{item.type}</span>
        <span className={`text-xs ${getRarityColor(item.rarity)}`}>
          {item.rarity}
        </span>
      </div>

      {item.level && (
        <div className="pip-text-dim text-xs mb-2">
          Level: {item.level}
        </div>
      )}

      {item.description && (
        <p className="pip-text-dim text-xs mb-3 line-clamp-2">
          {item.description}
        </p>
      )}

      {farmingMode && item.farmingInfo && (
        <div className="mb-3">
          <div className="flex justify-between text-xs pip-text-dim mb-1">
            <span>Difficulty: {item.farmingInfo.difficulty}</span>
            <span>{item.farmingInfo.renewable ? '♻️' : '⚠️'}</span>
          </div>
          {isInFarmingList && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs pip-text">
                <span>Progress:</span>
                <span>{farmingProgress.collected}/{farmingProgress.target}</span>
              </div>
              <div className="w-full bg-crt-dark rounded-full h-2">
                <div 
                  className="bg-pip-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(farmingProgress.collected / farmingProgress.target) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {item.locations && item.locations.length > 0 && (
        <div className="mb-3">
          <p className="pip-text-dim text-xs">
            <strong>Locations:</strong> {item.locations.slice(0, 2).join(', ')}
            {item.locations.length > 2 && '...'}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button className="pip-button flex-1 text-xs">VIEW</button>
        {!farmingMode && (
          <button className="pip-button text-xs">⭐</button>
        )}
      </div>
    </div>
  )
}

export default Items