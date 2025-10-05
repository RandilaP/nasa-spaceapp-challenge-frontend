import React from 'react'
import axios from 'axios'
import { TrendingUp, Clock, RefreshCw, Calendar, AlertCircle } from 'lucide-react'
import { WiTime4, WiTime8, WiTime12 } from 'react-icons/wi'
import { FaLeaf, FaMask, FaHome, FaExclamationTriangle } from 'react-icons/fa'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://nasa-spaceapp-challenge.fly.dev'

export default function Forecast(){
  const [hours, setHours] = React.useState(24)
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [selectedPeriod, setSelectedPeriod] = React.useState('24')

  const fetchForecast = ()=>{
    setLoading(true); setError(null)
    axios.post(`${API_BASE}/forecast`, { hours })
      .then(r=> setData(r.data))
      .catch(e=> setError(e.message))
      .finally(()=> setLoading(false))
  }

  React.useEffect(()=>{ fetchForecast() }, [])

  const getAQIIcon = (aqi) => {
    if(aqi <= 50) return <FaLeaf className="text-green-400" size={16} />
    if(aqi <= 100) return <Clock className="text-yellow-400" size={16} />
    if(aqi <= 150) return <FaMask className="text-orange-400" size={16} />
    if(aqi <= 200) return <FaExclamationTriangle className="text-red-400" size={16} />
    return <FaHome className="text-purple-400" size={16} />
  }

  const getAQIColor = (aqi) => {
    if(aqi <= 50) return 'border-l-green-400 bg-green-50/10'
    if(aqi <= 100) return 'border-l-yellow-400 bg-yellow-50/10'
    if(aqi <= 150) return 'border-l-orange-400 bg-orange-50/10'
    if(aqi <= 200) return 'border-l-red-400 bg-red-50/10'
    return 'border-l-purple-400 bg-purple-50/10'
  }

  const getTimeIcon = (hoursAhead) => {
    if(hoursAhead <= 8) return <WiTime4 size={20} className="text-blue-400" />
    if(hoursAhead <= 24) return <WiTime8 size={20} className="text-indigo-400" />
    return <WiTime12 size={20} className="text-purple-400" />
  }

  const periodOptions = [
    { value: 6, label: '6H', icon: <WiTime4 size={16} /> },
    { value: 12, label: '12H', icon: <WiTime8 size={16} /> },
    { value: 24, label: '24H', icon: <WiTime12 size={16} /> },
    { value: 48, label: '48H', icon: <Calendar size={16} /> },
    { value: 72, label: '72H', icon: <Calendar size={16} /> }
  ]

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <TrendingUp className="text-blue-400" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold">What's Coming Next? 🔮</h2>
              <p className="text-white/80 text-base">See how the air quality will change in the coming hours</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Simple Time Selection */}
            <div className="flex items-center gap-2 bg-white/10 rounded-full p-1">
              <button
                onClick={() => setHours(6)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  hours === 6 ? 'bg-blue-600 text-white shadow-lg' : 'text-white/70 hover:bg-white/20'
                }`}
              >
                Next 6 Hours
              </button>
              <button
                onClick={() => setHours(24)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  hours === 24 ? 'bg-blue-600 text-white shadow-lg' : 'text-white/70 hover:bg-white/20'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setHours(48)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  hours === 48 ? 'bg-blue-600 text-white shadow-lg' : 'text-white/70 hover:bg-white/20'
                }`}
              >
                Tomorrow
              </button>
            </div>
            <button 
              onClick={fetchForecast} 
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 shadow-lg text-lg font-medium"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading...' : 'Update'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card p-8">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-blue-400" size={24} />
            <p className="text-white/80">Generating forecast predictions...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-card p-6 border-l-4 border-l-red-500">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-red-400">Forecast Unavailable</h3>
              <p className="text-white/70 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Simple Forecast Cards */}
      {!loading && !error && data.length > 0 && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="glass-card p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Next {hours === 6 ? '6 Hours' : hours === 24 ? 'Day' : '2 Days'}</h3>
              <p className="text-white/70">Here's what to expect with air quality</p>
            </div>
          </div>

          {/* Weather-Style Forecast Cards */}
          <div className="grid gap-4">
            {data.slice(0, hours === 6 ? 6 : hours === 24 ? 8 : 12).map((item, index) => {
              const aqiLevel = item.predicted_aqi <= 50 ? { emoji: '😊', text: 'Great!', color: 'text-green-400', bg: 'bg-green-500/20' } :
                             item.predicted_aqi <= 100 ? { emoji: '😐', text: 'OK', color: 'text-yellow-400', bg: 'bg-yellow-500/20' } :
                             item.predicted_aqi <= 150 ? { emoji: '😷', text: 'Be Careful', color: 'text-orange-400', bg: 'bg-orange-500/20' } :
                             item.predicted_aqi <= 200 ? { emoji: '😨', text: 'Stay Inside', color: 'text-red-400', bg: 'bg-red-500/20' } :
                             { emoji: '🚨', text: 'Dangerous!', color: 'text-purple-400', bg: 'bg-purple-500/20' }
              
              const timeStr = hours <= 24 ? 
                new Date(item.timestamp).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'}) :
                `${new Date(item.timestamp).toLocaleDateString([], {weekday: 'short'})} ${new Date(item.timestamp).toLocaleTimeString([], {hour: 'numeric'})}`
              
              return (
                <div key={item.timestamp || index} className={`glass-card p-6 ${aqiLevel.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{aqiLevel.emoji}</div>
                      <div>
                        <div className="font-semibold text-lg text-white">{timeStr}</div>
                        <div className={`font-bold text-xl ${aqiLevel.color}`}>{aqiLevel.text}</div>
                        <div className="text-sm text-white/60">Air level: {Math.round(item.predicted_aqi)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/70 mb-1">
                        {item.hours_ahead <= 6 ? 'Soon' : 
                         item.hours_ahead <= 12 ? 'Later today' : 
                         item.hours_ahead <= 24 ? 'Tonight' : 'Tomorrow'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white/10 rounded-lg">
                    <p className="text-white/90 text-sm">{item.health_message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data.length === 0 && (
        <div className="glass-card p-8">
          <div className="text-center">
            <TrendingUp className="mx-auto mb-3 text-blue-400" size={48} />
            <h3 className="text-lg font-semibold text-blue-400 mb-2">No Forecast Data</h3>
            <p className="text-white/70">Unable to generate predictions for the selected time period</p>
          </div>
        </div>
      )}
    </div>
  )
}
