import React from 'react'
import axios from 'axios'
import { Bell, AlertTriangle, RefreshCw, Settings, TrendingUp } from 'lucide-react'
import { MdWarning, MdInfo, MdError } from 'react-icons/md'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://nasa-spaceapp-challenge-1.onrender.com'

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
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Bell className="text-red-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Air Quality Alerts</h2>
              <p className="text-white/70 text-sm">Real-time pollution warnings and notifications</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
              <Settings size={16} className="text-white/70" />
              <span className="text-sm text-white/70">Threshold:</span>
              <input 
                type="number" 
                value={threshold} 
                onChange={e=>setThreshold(Number(e.target.value))} 
                className="w-16 px-2 py-1 bg-white/20 border border-white/30 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
                min="0"
                max="500"
              />
            </div>
            <button 
              onClick={fetchAlerts} 
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Checking...' : 'Refresh'}
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
          {/* Summary Card */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-orange-400" size={24} />
                <div>
                  <h3 className="text-lg font-semibold">Alert Summary</h3>
                  <p className="text-white/70 text-sm">
                    Found <span className="font-semibold text-orange-400">{data.alert_count}</span> alerts above AQI {data.threshold}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-400">{data.alert_count}</div>
                <div className="text-xs text-white/60">Active Alerts</div>
              </div>
            </div>
          </div>

          {/* Alerts List */}
          {data.alerts && data.alerts.length > 0 ? (
            <div className="space-y-3">
              {data.alerts.map((alert, index) => (
                <div key={alert.timestamp || index} className={`glass-card p-4 border-l-4 ${getSeverityColor(alert.category)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(alert.category)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/70">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                              AQI {alert.predicted_aqi}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.category?.toLowerCase().includes('hazardous') ? 'bg-red-500/20 text-red-300' :
                              alert.category?.toLowerCase().includes('very unhealthy') ? 'bg-purple-500/20 text-purple-300' :
                              alert.category?.toLowerCase().includes('unhealthy') ? 'bg-red-400/20 text-red-300' :
                              'bg-orange-400/20 text-orange-300'
                            }`}>
                              {alert.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-white/90 text-sm">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
