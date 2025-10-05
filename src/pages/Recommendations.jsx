import React from 'react'
import axios from 'axios'
import { Heart, Home, Activity, RefreshCw, AlertTriangle, CheckCircle, Info, Shield } from 'lucide-react'
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
            <div className="p-3 bg-green-500/20 rounded-full">
              <Heart className="text-green-400" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold">What Should I Do Today? 🤔</h2>
              <p className="text-white/80 text-base">Simple tips to stay healthy based on today's air quality</p>
            </div>
          </div>
          <button 
            onClick={fetchRecommendations}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 shadow-lg text-lg font-medium"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Get Tips
          </button>
        </div>
      </div>

      {/* Simple Air Quality Status */}
      <div className="glass-card p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-4">Today's Air Quality</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center ${currentLevel.bg}`}>
                <span className="text-3xl">
                  {data.current_aqi <= 50 ? '😊' : 
                   data.current_aqi <= 100 ? '😐' : 
                   data.current_aqi <= 150 ? '😷' : 
                   data.current_aqi <= 200 ? '😨' : '🚨'}
                </span>
              </div>
              <div className="text-lg font-semibold mb-1">Right Now</div>
              <div className={`text-xl font-bold ${currentLevel.color}`}>
                {data.current_aqi <= 50 ? 'Great!' : 
                 data.current_aqi <= 100 ? 'OK' : 
                 data.current_aqi <= 150 ? 'Be Careful' : 
                 data.current_aqi <= 200 ? 'Stay Inside' : 'Dangerous!'}
              </div>
              <div className="text-sm text-white/60">Level: {data.current_aqi}</div>
            </div>
            
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center ${forecastLevel.bg}`}>
                <span className="text-3xl">
                  {data.max_forecast_aqi <= 50 ? '😊' : 
                   data.max_forecast_aqi <= 100 ? '😐' : 
                   data.max_forecast_aqi <= 150 ? '😷' : 
                   data.max_forecast_aqi <= 200 ? '😨' : '🚨'}
                </span>
              </div>
              <div className="text-lg font-semibold mb-1">Later Today</div>
              <div className={`text-xl font-bold ${forecastLevel.color}`}>
                {data.max_forecast_aqi <= 50 ? 'Great!' : 
                 data.max_forecast_aqi <= 100 ? 'OK' : 
                 data.max_forecast_aqi <= 150 ? 'Be Careful' : 
                 data.max_forecast_aqi <= 200 ? 'Stay Inside' : 'Dangerous!'}
              </div>
              <div className="text-sm text-white/60">Max Level: {data.max_forecast_aqi}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Action Cards */}
      <div className="space-y-4">
        {data.recommendations && data.recommendations.length > 0 ? (
          <div className="grid gap-4">
            {data.recommendations.slice(0, 6).map((rec, index) => {
              // Determine action type and emoji
              const lowerRec = rec.toLowerCase()
              let actionEmoji = '💡'
              let actionType = 'General Tip'
              let bgColor = 'bg-blue-500/20'
              
              if(lowerRec.includes('outdoor') || lowerRec.includes('exercise') || lowerRec.includes('activity')) {
                actionEmoji = '🏃‍♂️'
                actionType = 'Outdoor Activities'
                bgColor = 'bg-green-500/20'
              } else if(lowerRec.includes('indoor') || lowerRec.includes('inside') || lowerRec.includes('home')) {
                actionEmoji = '🏠'
                actionType = 'Indoor Tips'
                bgColor = 'bg-purple-500/20'
              } else if(lowerRec.includes('mask') || lowerRec.includes('sensitive') || lowerRec.includes('children')) {
                actionEmoji = '😷'
                actionType = 'Special Care'
                bgColor = 'bg-orange-500/20'
              } else if(lowerRec.includes('health') || lowerRec.includes('breathing')) {
                actionEmoji = '❤️'
                actionType = 'Health Tip'
                bgColor = 'bg-red-500/20'
              }
              
              return (
                <div key={index} className={`glass-card p-6 ${bgColor} hover:scale-105 transition-transform cursor-pointer`}>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{actionEmoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white/70">{actionType}</span>
                        <CheckCircle className="text-green-400" size={16} />
                      </div>
                      <p className="text-white text-base leading-relaxed">{rec}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="glass-card p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🤷‍♂️</div>
              <h3 className="text-xl font-semibold mb-2">No Tips Available</h3>
              <p className="text-white/70">We're working on getting personalized recommendations for you!</p>
            </div>
          </div>
        )}
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
