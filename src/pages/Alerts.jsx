import React from 'react'
import axios from 'axios'
import { Bell, AlertTriangle, RefreshCw, Settings, TrendingUp, CheckCircle } from 'lucide-react'
import { MdWarning, MdInfo, MdError } from 'react-icons/md'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://nasa-spaceapp-challenge.fly.dev'

export default function Alerts(){
  const [threshold, setThreshold] = React.useState(100)
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const fetchAlerts = ()=>{
    setLoading(true); setError(null)
    axios.get(`${API_BASE}/alerts?threshold=${threshold}`)
      .then(r=> setData(r.data))
      .catch(e=> setError(e.message))
      .finally(()=> setLoading(false))
  }

  React.useEffect(()=>{ fetchAlerts() }, [])

  const getSeverityIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'hazardous': return <MdError className="text-red-500" size={20} />
      case 'very unhealthy': return <MdWarning className="text-purple-500" size={20} />
      case 'unhealthy': return <MdWarning className="text-red-400" size={20} />
      case 'unhealthy for sensitive groups': return <MdWarning className="text-orange-400" size={20} />
      default: return <MdInfo className="text-blue-400" size={20} />
    }
  }

  const getSeverityColor = (category) => {
    switch(category?.toLowerCase()) {
      case 'hazardous': return 'border-l-red-500 bg-red-50/10'
      case 'very unhealthy': return 'border-l-purple-500 bg-purple-50/10'
      case 'unhealthy': return 'border-l-red-400 bg-red-50/10'
      case 'unhealthy for sensitive groups': return 'border-l-orange-400 bg-orange-50/10'
      default: return 'border-l-blue-400 bg-blue-50/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 rounded-full">
              <Bell className="text-orange-400" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Air Quality Warnings</h2>
              <p className="text-white/80 text-base">Get notified when air quality affects your health</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAlerts} 
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 shadow-lg text-lg font-medium"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Checking...' : 'Check Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card p-8">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-blue-400" size={24} />
            <p className="text-white/80">Analyzing air quality data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-card p-6 border-l-4 border-l-red-500">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-400 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-red-400">Unable to Load Alerts</h3>
              <p className="text-white/70 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-4">
          {/* Simple Status Card */}
          <div className="glass-card p-8">
            <div className="text-center">
              {data.alert_count === 0 ? (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-green-400" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">All Clear! 🌿</h3>
                  <p className="text-white/80 text-lg">The air quality is good for everyone to enjoy outdoor activities.</p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="text-red-400" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-red-400 mb-2">Air Quality Warning! ⚠️</h3>
                  <p className="text-white/80 text-lg">
                    We found <span className="font-bold text-red-300">{data.alert_count}</span> times when the air quality may affect your health.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Simple Alerts List */}
          {data.alerts && data.alerts.length > 0 ? (
            <div className="space-y-4">
              {data.alerts.map((alert, index) => {
                const alertLevel = alert.predicted_aqi > 200 ? 'dangerous' : 
                                 alert.predicted_aqi > 150 ? 'unhealthy' : 
                                 alert.predicted_aqi > 100 ? 'sensitive' : 'moderate'
                const alertColor = alertLevel === 'dangerous' ? 'bg-red-500/20 border-red-400' :
                                 alertLevel === 'unhealthy' ? 'bg-orange-500/20 border-orange-400' :
                                 alertLevel === 'sensitive' ? 'bg-yellow-500/20 border-yellow-400' :
                                 'bg-blue-500/20 border-blue-400'
                const alertEmoji = alertLevel === 'dangerous' ? '🚨' :
                                 alertLevel === 'unhealthy' ? '⚠️' :
                                 alertLevel === 'sensitive' ? '😷' : '⚡'
                
                return (
                  <div key={alert.timestamp || index} className={`glass-card p-6 border-l-4 ${alertColor}`}>
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{alertEmoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-white">
                            {alertLevel === 'dangerous' ? 'Stay Inside!' :
                             alertLevel === 'unhealthy' ? 'Limit Outdoor Time' :
                             alertLevel === 'sensitive' ? 'Sensitive People Be Careful' :
                             'Be Aware'}
                          </h4>
                          <span className="text-sm text-white/70">
                            {new Date(alert.timestamp).toLocaleDateString()} at {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-white/90 text-base leading-relaxed mb-2">{alert.message}</p>
                        <div className="text-sm text-white/60">
                          Air Quality Level: <span className="font-medium">{Math.round(alert.predicted_aqi)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="glass-card p-8">
              <div className="text-center">
                <Bell className="mx-auto mb-3 text-green-400" size={48} />
                <h3 className="text-lg font-semibold text-green-400 mb-2">No Alerts</h3>
                <p className="text-white/70">Air quality is within acceptable limits for the threshold of {data.threshold}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
