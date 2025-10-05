import React from 'react'
import { Cloud, Wind, Droplet, AlertTriangle, Activity, Thermometer, Eye, TrendingUp, Info, RefreshCw } from 'lucide-react'
import { WiHumidity, WiBarometer, WiStrongWind, WiDaySunny, WiCloudy, WiRain } from 'react-icons/wi'
import { FaLeaf, FaRunning, FaMask, FaHome, FaChartLine, FaExclamationTriangle } from 'react-icons/fa'
import { MdAir, MdVisibility, MdTrendingUp, MdTrendingDown, MdTrendingFlat } from 'react-icons/md'
import { BiHealth, BiTime, BiMap } from 'react-icons/bi'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, ArcElement)

export default function Current({ currentData, sensorData, weatherData }){
  const [data, setData] = React.useState(currentData || null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [activeTab, setActiveTab] = React.useState('overview') // 'overview', 'satellite', 'sensor', 'trends'
  const [selectedPeriod, setSelectedPeriod] = React.useState('measurements')
  const [refreshing, setRefreshing] = React.useState(false)

  // Sync with parent data
  React.useEffect(() => {
    if(currentData) setData(currentData)
  }, [currentData])

  // Helper functions
  const round = (val) => typeof val === 'number' && !isNaN(val) ? Math.round(val) : null
  
  const getAQIStatus = (aqi) => {
    if(aqi <= 50) return { level: 'Good', color: 'bg-green-500', textColor: 'text-green-400', icon: <FaLeaf /> }
    if(aqi <= 100) return { level: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-400', icon: <Activity /> }
    if(aqi <= 150) return { level: 'Unhealthy for Sensitive', color: 'bg-orange-500', textColor: 'text-orange-400', icon: <FaMask /> }
    if(aqi <= 200) return { level: 'Unhealthy', color: 'bg-red-500', textColor: 'text-red-400', icon: <FaExclamationTriangle /> }
    return { level: 'Very Unhealthy', color: 'bg-purple-600', textColor: 'text-purple-400', icon: <AlertTriangle /> }
  }

  const getSensorDataForPeriod = () => {
    if(!sensorData || !sensorData[selectedPeriod]) return null
    return sensorData[selectedPeriod]
  }

  const getWeatherIcon = (weather) => {
    if(!weather) return <WiDaySunny size={24} />
    switch(weather.toLowerCase()) {
      case 'clear': return <WiDaySunny size={24} color="#f59e0b" />
      case 'clouds': return <WiCloudy size={24} color="#6b7280" />
      case 'rain': return <WiRain size={24} color="#3b82f6" />
      default: return <WiDaySunny size={24} />
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000)
  }

  if(loading) return <div className="card">Loading current conditions...</div>
  if(error) return <div className="card">Error: {error}</div>
  if(!data) return <div className="card">No data</div>

  const aqi = Number.isFinite(data?.aqi) ? Math.round(data.aqi) : null
  const aqiStatus = getAQIStatus(aqi)
  const w = weatherData || data.weather || {}
  const pollutants = data.pollutants || {}

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MdAir size={28} color="#60a5fa" />
            Current Air Quality
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Real-time data • Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Just now'}
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-nasa-300 text-[#071a2b] rounded-lg font-medium hover:bg-nasa-400 disabled:opacity-50 transition-all"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Updating...' : 'Refresh Data'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: <BiHealth size={16} /> },
          { id: 'satellite', label: 'Satellite Data', icon: <MdAir size={16} /> },
          { id: 'sensor', label: 'Ground Sensors', icon: <Activity size={16} /> },
          { id: 'trends', label: 'Trends', icon: <TrendingUp size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-nasa-300 text-[#071a2b]' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AQI Status Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Air Quality Index</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${aqiStatus.color} text-white`}>
                {aqiStatus.level}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-white/10">
                <span className="text-3xl font-bold">{aqi || '—'}</span>
              </div>
              <div className="flex-1">
                <div className="text-sm text-white/70 mb-2">Health Impact</div>
                <div className={`text-lg font-medium ${aqiStatus.textColor} flex items-center gap-2`}>
                  {aqiStatus.icon}
                  {aqiStatus.level}
                </div>
                <div className="text-xs text-white/60 mt-1">
                  {aqi <= 50 ? 'Air quality is satisfactory' : 
                   aqi <= 100 ? 'Acceptable for most people' :
                   aqi <= 150 ? 'Sensitive groups may experience symptoms' :
                   'Everyone may experience health effects'}
                </div>
              </div>
            </div>
          </div>

          {/* Weather Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {getWeatherIcon(w.weather)}
              Weather Conditions
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Temperature</span>
                <span className="text-xl font-semibold">{round(w.temp || w.temperature) || '—'}°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Feels like</span>
                <span className="font-medium">{round(w.feels_like) || '—'}°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Humidity</span>
                <span className="font-medium">{round(w.humidity) || '—'}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Wind Speed</span>
                <span className="font-medium">{round(w.wind_speed) || '—'} m/s</span>
              </div>
            </div>
          </div>

          {/* Pollutants Grid */}
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Air Pollutants</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', color: 'from-red-500/20 to-orange-500/20' },
                { key: 'pm10', label: 'PM10', unit: 'µg/m³', color: 'from-orange-500/20 to-yellow-500/20' },
                { key: 'o3', label: 'Ozone', unit: 'µg/m³', color: 'from-blue-500/20 to-cyan-500/20' },
                { key: 'no2', label: 'NO₂', unit: 'µg/m³', color: 'from-purple-500/20 to-pink-500/20' }
              ].map(pollutant => (
                <div key={pollutant.key} className={`p-4 rounded-lg bg-gradient-to-br ${pollutant.color} border border-white/10`}>
                  <div className="text-sm text-white/70">{pollutant.label}</div>
                  <div className="text-2xl font-bold mt-1">
                    {round(pollutants[pollutant.key]) || '—'}
                  </div>
                  <div className="text-xs text-white/60">{pollutant.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Satellite Data Tab */}
      {activeTab === 'satellite' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">TEMPO Satellite Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(pollutants).length === 0 ? 
              <div className="col-span-full text-center text-white/60 py-8">No satellite data available</div> :
              Object.entries(pollutants).map(([k, v]) => (
                <div key={k} className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-white/10">
                  <div className="text-sm text-white/70 uppercase">{k}</div>
                  <div className="text-2xl font-bold mt-1">{round(v) || '—'}</div>
                  <div className="text-xs text-white/60">µg/m³</div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Sensor Data Tab */}
      {activeTab === 'sensor' && (
        <div className="space-y-4">
          {/* Period Selection */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
            {['measurements', 'hours', 'days', 'years'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                  selectedPeriod === period 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Sensor Data Display */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Ground Sensor Data</h3>
            {(() => {
              const currentSensorData = getSensorDataForPeriod()
              
              if(!sensorData) {
                return <div className="text-center text-white/60 py-8">Loading sensor data...</div>
              }
              
              if(sensorData.error) {
                return <div className="text-center text-white/60 py-8">Error loading sensor data: {sensorData.error}</div>
              }
              
              if(!currentSensorData || !currentSensorData.results || currentSensorData.results.length === 0) {
                return <div className="text-center text-white/60 py-8">No {selectedPeriod} data available</div>
              }
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>Sensor ID: {sensorData.sensorId}</span>
                    <span>{currentSensorData.results.length} data points</span>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentSensorData.results.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <MdAir size={16} color="#60a5fa" />
                          <span className="font-medium">{item.parameter?.name || 'Unknown'}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{item.value} {item.parameter?.units || 'µg/m³'}</div>
                          <div className="text-xs text-white/50">
                            {new Date(item.period?.datetimeFrom?.utc || item.datetime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartLine color="#60a5fa" />
            Air Quality Trends
          </h3>
          {data.recent_aqi ? (
            <div className="h-64">
              <Line 
                data={{
                  labels: data.recent_aqi.map((_, i) => `${i}h ago`),
                  datasets: [{
                    label: 'AQI',
                    data: data.recent_aqi,
                    borderColor: '#60a5fa',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    tension: 0.4,
                    fill: true
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: { 
                      beginAtZero: true,
                      grid: { color: 'rgba(255, 255, 255, 0.1)' },
                      ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    },
                    x: {
                      grid: { color: 'rgba(255, 255, 255, 0.1)' },
                      ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-center text-white/60 py-8">No trend data available</div>
          )}
        </div>
      )}
    </div>
  )
}
