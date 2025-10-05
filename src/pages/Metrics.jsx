import React from 'react'
import axios from 'axios'
import { BarChart3, TrendingUp, Target, Zap, Brain, AlertCircle, RefreshCw } from 'lucide-react'
import { MdModelTraining, MdPrecisionManufacturing, MdSpeed } from 'react-icons/md'
import { FaChartLine, FaBullseye, FaCog } from 'react-icons/fa'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://nasa-spaceapp-challenge-1.onrender.com'

export default function Metrics(){
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const fetchMetrics = () => {
    setLoading(true)
    axios.get(`${API_BASE}/metrics`)
      .then(r=> setData(r.data))
      .catch(e=> setError(e.message))
      .finally(()=> setLoading(false))
  }

  React.useEffect(()=>{ fetchMetrics() },[])

  const getMetricQuality = (value, type) => {
    switch(type) {
      case 'rmse':
      case 'mae':
        if(value < 10) return { quality: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' }
        if(value < 20) return { quality: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' }
        if(value < 40) return { quality: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
        return { quality: 'Poor', color: 'text-red-400', bg: 'bg-red-500/20' }
      case 'r2':
        if(value > 0.9) return { quality: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' }
        if(value > 0.8) return { quality: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' }
        if(value > 0.6) return { quality: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
        return { quality: 'Poor', color: 'text-red-400', bg: 'bg-red-500/20' }
      default:
        return { quality: 'Unknown', color: 'text-white/70', bg: 'bg-white/10' }
    }
  }

  const formatFeatureName = (name) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  if(loading) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-blue-400" size={24} />
          <p className="text-white/80">Loading model performance metrics...</p>
        </div>
      </div>
    )
  }

  if(error) {
    return (
      <div className="glass-card p-6 border-l-4 border-l-red-500">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-400 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-red-400">Metrics Unavailable</h3>
            <p className="text-white/70 text-sm mt-1">{error}</p>
            <button 
              onClick={fetchMetrics}
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
          <BarChart3 className="mx-auto mb-3 text-blue-400" size={48} />
          <h3 className="text-lg font-semibold text-blue-400 mb-2">No Metrics Available</h3>
          <p className="text-white/70">Model performance data is not available</p>
        </div>
      </div>
    )
  }

  const rmseQuality = getMetricQuality(parseFloat(data.rmse), 'rmse')
  const maeQuality = getMetricQuality(parseFloat(data.mae), 'mae')
  const r2Quality = getMetricQuality(parseFloat(data.r2), 'r2')

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Brain className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Model Performance</h2>
              <p className="text-white/70 text-sm">AI prediction accuracy and performance metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <MdModelTraining className="text-purple-400" size={16} />
            <span className="text-sm font-medium">{data.model_name}</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RMSE */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="text-blue-400" size={20} />
              <h3 className="font-semibold">RMSE</h3>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${rmseQuality.bg} ${rmseQuality.color}`}>
              {rmseQuality.quality}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">{parseFloat(data.rmse).toFixed(2)}</div>
            <div className="text-xs text-white/60">Root Mean Square Error</div>
            <div className="text-xs text-white/50 mt-1">Lower is better</div>
          </div>
        </div>

        {/* MAE */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaBullseye className="text-green-400" size={16} />
              <h3 className="font-semibold">MAE</h3>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${maeQuality.bg} ${maeQuality.color}`}>
              {maeQuality.quality}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">{parseFloat(data.mae).toFixed(2)}</div>
            <div className="text-xs text-white/60">Mean Absolute Error</div>
            <div className="text-xs text-white/50 mt-1">Lower is better</div>
          </div>
        </div>

        {/* R² Score */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaChartLine className="text-orange-400" size={16} />
              <h3 className="font-semibold">R² Score</h3>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${r2Quality.bg} ${r2Quality.color}`}>
              {r2Quality.quality}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-1">{parseFloat(data.r2).toFixed(3)}</div>
            <div className="text-xs text-white/60">Coefficient of Determination</div>
            <div className="text-xs text-white/50 mt-1">Higher is better (0-1)</div>
          </div>
        </div>
      </div>

      {/* Feature Importance */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Zap className="text-indigo-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Feature Importance</h3>
            <p className="text-white/70 text-sm">Most influential factors in air quality prediction</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {Object.entries(data.feature_importance || {})
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8)
            .map(([feature, importance], index) => {
              const percentage = (importance * 100).toFixed(1)
              return (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{formatFeatureName(feature)}</span>
                      <span className="text-indigo-400 font-semibold text-sm">{percentage}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>

      {/* Model Summary */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaCog className="text-gray-400" size={20} />
          <h3 className="text-lg font-semibold">Model Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2 text-white/90">Performance Overview</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex justify-between">
                <span>Prediction Accuracy:</span>
                <span className={r2Quality.color}>{(parseFloat(data.r2) * 100).toFixed(1)}%</span>
              </li>
              <li className="flex justify-between">
                <span>Average Error:</span>
                <span className={maeQuality.color}>{parseFloat(data.mae).toFixed(1)} AQI points</span>
              </li>
              <li className="flex justify-between">
                <span>Model Type:</span>
                <span className="text-purple-400">{data.model_name}</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-white/90">Key Features</h4>
            <ul className="space-y-1 text-sm text-white/70">
              {Object.keys(data.feature_importance || {}).slice(0, 4).map(feature => (
                <li key={feature} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                  {formatFeatureName(feature)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
