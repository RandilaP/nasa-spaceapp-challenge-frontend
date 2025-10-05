import React from 'react'
import axios from 'axios'
import { Heart, Home, Activity, Mask, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { FaRunning, FaLeaf, FaMask, FaHome, FaChild, FaUserMd, FaEye } from 'react-icons/fa'
import { MdOutdoorGrill, MdAir, MdVisibility, MdHealthAndSafety } from 'react-icons/md'
import { WiDaySunny, WiTime4 } from 'react-icons/wi'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://nasa-spaceapp-challenge-1.onrender.com'

export default function Recs(){
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [selectedCategory, setSelectedCategory] = React.useState('all')

  const fetchRecommendations = () => {
    setLoading(true)
    axios.get(`${API_BASE}/health-recommendations`)
      .then(r=> setData(r.data))
      .catch(e=> setError(e.message))
      .finally(()=> setLoading(false))
  }

  React.useEffect(()=>{ fetchRecommendations() },[])

  const getAQILevel = (aqi) => {
    if(aqi <= 50) return { level: 'Good', color: 'text-green-400', bg: 'bg-green-500/20', icon: <FaLeaf className="text-green-400" size={16} /> }
    if(aqi <= 100) return { level: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: <WiDaySunny className="text-yellow-400" size={16} /> }
    if(aqi <= 150) return { level: 'Unhealthy for Sensitive', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: <FaMask className="text-orange-400" size={16} /> }
    if(aqi <= 200) return { level: 'Unhealthy', color: 'text-red-400', bg: 'bg-red-500/20', icon: <AlertTriangle className="text-red-400" size={16} /> }
    return { level: 'Very Unhealthy', color: 'text-purple-400', bg: 'bg-purple-500/20', icon: <FaHome className="text-purple-400" size={16} /> }
  }

  const categorizeRecommendations = (recommendations) => {
    const categories = {
      outdoor: [],
      indoor: [],
      health: [],
      sensitive: [],
      general: []
    }
    
    recommendations.forEach((rec, index) => {
      const lowerRec = rec.toLowerCase()
      if(lowerRec.includes('outdoor') || lowerRec.includes('exercise') || lowerRec.includes('activity')) {
        categories.outdoor.push({ text: rec, icon: <FaRunning size={16} />, index })
      } else if(lowerRec.includes('indoor') || lowerRec.includes('inside') || lowerRec.includes('home')) {
        categories.indoor.push({ text: rec, icon: <FaHome size={16} />, index })
      } else if(lowerRec.includes('mask') || lowerRec.includes('sensitive') || lowerRec.includes('children') || lowerRec.includes('elderly')) {
        categories.sensitive.push({ text: rec, icon: <FaMask size={16} />, index })
      } else if(lowerRec.includes('health') || lowerRec.includes('symptoms') || lowerRec.includes('breathing')) {
        categories.health.push({ text: rec, icon: <MdHealthAndSafety size={16} />, index })
      } else {
        categories.general.push({ text: rec, icon: <Info size={16} />, index })
      }
    })
    
    return categories
  }

  const filterCategories = ['all', 'outdoor', 'indoor', 'health', 'sensitive', 'general']
  const categoryLabels = {
    all: 'All Recommendations',
    outdoor: 'Outdoor Activities',
    indoor: 'Indoor Guidelines', 
    health: 'Health & Safety',
    sensitive: 'Sensitive Groups',
    general: 'General Advice'
  }

  if(loading) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-blue-400" size={24} />
          <p className="text-white/80">Loading health recommendations...</p>
        </div>
      </div>
    )
  }

  if(error) {
    return (
      <div className="glass-card p-6 border-l-4 border-l-red-500">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-400 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-red-400">Recommendations Unavailable</h3>
            <p className="text-white/70 text-sm mt-1">{error}</p>
            <button 
              onClick={fetchRecommendations}
              className="mt-3 text-sm px-3 py-1 bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if(!data) {
    return (
      <div className="glass-card p-8">
        <div className="text-center">
          <Heart className="mx-auto mb-3 text-red-400" size={48} />
          <h3 className="text-lg font-semibold text-red-400 mb-2">No Recommendations</h3>
          <p className="text-white/70">Health recommendations are not available</p>
        </div>
      </div>
    )
  }

  const currentLevel = getAQILevel(data.current_aqi)
  const forecastLevel = getAQILevel(data.max_forecast_aqi)
  const categorizedRecs = categorizeRecommendations(data.recommendations || [])

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Heart className="text-red-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Health Recommendations</h2>
              <p className="text-white/70 text-sm">Personalized advice based on current air quality</p>
            </div>
          </div>
          <button 
            onClick={fetchRecommendations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 shadow-lg"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* AQI Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current AQI */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MdAir className="text-blue-400" size={20} />
              <h3 className="font-semibold">Current Air Quality</h3>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${currentLevel.bg} ${currentLevel.color}`}>
              {currentLevel.level}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentLevel.icon}
            <div>
              <div className="text-2xl font-bold">{data.current_aqi}</div>
              <div className="text-xs text-white/60">AQI Index</div>
            </div>
          </div>
        </div>

        {/* Forecast AQI */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <WiTime4 className="text-purple-400" size={20} />
              <h3 className="font-semibold">Forecast Peak</h3>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${forecastLevel.bg} ${forecastLevel.color}`}>
              {forecastLevel.level}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {forecastLevel.icon}
            <div>
              <div className="text-2xl font-bold">{data.max_forecast_aqi}</div>
              <div className="text-xs text-white/60">Max Expected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-2">
          {filterCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {(selectedCategory === 'all' ? Object.entries(categorizedRecs) : [[selectedCategory, categorizedRecs[selectedCategory]]])
          .filter(([, recs]) => recs && recs.length > 0)
          .map(([category, recs]) => (
            <div key={category} className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {category === 'outdoor' && <FaRunning className="text-blue-400" size={16} />}
                {category === 'indoor' && <FaHome className="text-green-400" size={16} />}
                {category === 'health' && <MdHealthAndSafety className="text-red-400" size={16} />}
                {category === 'sensitive' && <FaMask className="text-orange-400" size={16} />}
                {category === 'general' && <Info className="text-gray-400" size={16} />}
                {categoryLabels[category]}
              </h3>
              <div className="space-y-3">
                {recs.map((rec, index) => (
                  <div key={rec.index || index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="mt-1 text-white/70">
                      {rec.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-white/90 text-sm leading-relaxed">{rec.text}</p>
                    </div>
                    <CheckCircle className="text-green-400 mt-1" size={16} />
                  </div>
                ))}
              </div>
            </div>
          ))
        }
      </div>

      {/* Empty State for Categories */}
      {selectedCategory !== 'all' && (!categorizedRecs[selectedCategory] || categorizedRecs[selectedCategory].length === 0) && (
        <div className="glass-card p-8">
          <div className="text-center">
            <Info className="mx-auto mb-3 text-blue-400" size={48} />
            <h3 className="text-lg font-semibold text-blue-400 mb-2">No {categoryLabels[selectedCategory]}</h3>
            <p className="text-white/70">No recommendations available for this category</p>
          </div>
        </div>
      )}
    </div>
  )
}
