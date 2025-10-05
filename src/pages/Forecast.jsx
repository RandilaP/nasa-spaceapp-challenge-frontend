import React from 'react'
import axios from 'axios'
import { TrendingUp, Clock, RefreshCw, Calendar, AlertCircle } from 'lucide-react'
import { WiTime4, WiTime8, WiTime12 } from 'react-icons/wi'
import { FaLeaf, FaMask, FaHome, FaExclamationTriangle } from 'react-icons/fa'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://nasa-spaceapp-challenge-1.onrender.com'

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
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Air Quality Forecast</h2>
              <p className="text-white/70 text-sm">Predicted air quality trends and recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Period Selection */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              {periodOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setHours(option.value)
                    setSelectedPeriod(option.value.toString())
                  }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-all ${
                    hours === option.value 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-white/70 hover:bg-white/20'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
            <button 
              onClick={fetchForecast} 
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
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

      {/* Forecast Results */}
      {!loading && !error && data.length > 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Forecast Period</h3>
                <p className="text-white/70 text-sm">Next {hours} hours • {data.length} predictions</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">{hours}H</div>
                <div className="text-xs text-white/60">Forecast Range</div>
              </div>
            </div>
          </div>

          {/* Forecast Timeline */}
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={item.timestamp || index} className={`glass-card p-4 border-l-4 ${getAQIColor(item.predicted_aqi)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTimeIcon(item.hours_ahead)}
                    <div>
                      <div className="font-medium text-white">
                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-sm text-white/70">+{item.hours_ahead} hours ahead</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {getAQIIcon(item.predicted_aqi)}
                        <span className="text-lg font-bold">{Math.round(item.predicted_aqi)}</span>
                      </div>
                      <div className={`text-xs font-medium ${
                        item.predicted_aqi <= 50 ? 'text-green-400' :
                        item.predicted_aqi <= 100 ? 'text-yellow-400' :
                        item.predicted_aqi <= 150 ? 'text-orange-400' :
                        item.predicted_aqi <= 200 ? 'text-red-400' : 'text-purple-400'
                      }`}>
                        {item.aqi_category}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white/5 rounded-lg">
                  <p className="text-sm text-white/90">{item.health_message}</p>
                </div>
              </div>
            ))}
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
