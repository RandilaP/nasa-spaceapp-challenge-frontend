import React from 'react'
import axios from 'axios'
import { Bell } from 'lucide-react'
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiWindy } from 'react-icons/wi'
import { FaLeaf, FaRunning, FaMask, FaHome } from 'react-icons/fa'
import { MdAir, MdLocationOn } from 'react-icons/md'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)
import Current from './pages/Current'
import Forecast from './pages/Forecast'
import Metrics from './pages/Metrics'
import Alerts from './pages/Alerts'
import Recs from './pages/Recommendations'
import isoToId, { countries } from './lib/countryMap'

export default function App(){
  const [route, setRoute] = React.useState('current')
  const routes = ['current','forecast','metrics','alerts','recs']
  const [summary, setSummary] = React.useState(null)
  const [sensorData, setSensorData] = React.useState(null)
  const [sensorId] = React.useState(3917) // USA sensor
  const [weather, setWeather] = React.useState(null)
  const [location, setLocation] = React.useState({ city: 'Los Angeles', lat: 34.0522, lon: -118.2437 })
  const [showAlerts, setShowAlerts] = React.useState(false)
  const [alerts, setAlerts] = React.useState([])
  const [recs, setRecs] = React.useState(null)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE || 'https://nasa-spaceapp-challenge-1.onrender.com'

  React.useEffect(()=>{
    axios.get(`${API_BASE}/current`).then(r=> setSummary(r.data)).catch(()=>{})
    axios.get(`${API_BASE}/alerts?threshold=100`).then(r=> setAlerts(r.data.alerts || [])).catch(()=>{})
    axios.get(`${API_BASE}/health-recommendations`).then(r=> setRecs(r.data)).catch(()=>{})
    
    // Fetch weather and sensor data
    ;(async function(){
      try{
        await fetchWeatherData(location.lat, location.lon)
        await fetchSensorData(sensorId)
      }catch(e){ console.warn('data fetch failed', e) }
    })()
  },[])

  // helper to fetch weather data using OpenWeatherMap free API
  async function fetchWeatherData(lat, lon){
    // Using a demo API key - in production, this should be secured
    const apiKey = 'b8a1c1f7d4c2e5f8a9b3c6d1e7f2a4b5'
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    
    try{
      const resp = await fetch(url)
      if(resp.ok){
        const data = await resp.json()
        setWeather({
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          wind_speed: data.wind.speed,
          wind_deg: data.wind.deg,
          weather: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          visibility: data.visibility / 1000 // convert to km
        })
      }
    }catch(err){
      console.warn('Weather fetch failed', err)
      // Use mock weather data as fallback
      setWeather({
        temp: 22,
        feels_like: 25,
        humidity: 65,
        pressure: 1013,
        wind_speed: 3.2,
        weather: 'Clear',
        description: 'clear sky',
        visibility: 10
      })
    }
  }

  // helper to fetch OpenAQ sensor data using sensor endpoints via dev proxy
  async function fetchSensorData(sensorId){
    const apiKey = '0d8f7617cc27466bd352cc539d45a5a4b0eb3025811b100b22f8e56e8cf0eed4'
    
    try{
      // Use dev proxy endpoints that will automatically add X-API-Key header
      const endpoints = {
        measurements: `/openaq/v3/sensors/${sensorId}/measurements?limit=100`,
        hours: `/openaq/v3/sensors/${sensorId}/hours?limit=24`, 
        days: `/openaq/v3/sensors/${sensorId}/days?limit=30`,
        years: `/openaq/v3/sensors/${sensorId}/years?limit=5`
      }
      
      const results = {}
      
      // Fetch all sensor data endpoints
      for(const [key, url] of Object.entries(endpoints)){
        try{
          // Try proxy first, fallback to direct API with headers if proxy fails
          let resp
          try {
            resp = await fetch(url)
          } catch(proxyError) {
            // Fallback to direct API call with headers
            const directUrl = `https://api.openaq.org${url.replace('/openaq', '')}`
            resp = await fetch(directUrl, { headers: { 'X-API-Key': apiKey } })
          }
          
          if(resp.ok){
            results[key] = await resp.json()
          }else{
            let bodyText = ''
            try{ const j = await resp.json(); bodyText = JSON.stringify(j) }catch(e){ try{ bodyText = await resp.text(); }catch(e2){} }
            console.warn(`Sensor ${key} fetch failed: ${resp.status} ${bodyText}`)
            results[key] = null
          }
        }catch(err){
          console.warn(`Sensor ${key} fetch error:`, err)
          results[key] = null
        }
      }
      
      setSensorData({ sensorId, ...results, error: null })
    }catch(err){
      console.warn('Sensor data fetch failed', err)
      setSensorData({ sensorId, error: String(err) })
    }
  }

  // Function to get weather icon component
  function getWeatherIcon(weatherType, size = 32) {
    const iconProps = { size, color: '#60a5fa' }
    switch(weatherType?.toLowerCase()) {
      case 'clear': return <WiDaySunny {...iconProps} />
      case 'clouds': return <WiCloudy {...iconProps} />
      case 'rain': return <WiRain {...iconProps} />
      case 'snow': return <WiSnow {...iconProps} />
      case 'thunderstorm': return <WiThunderstorm {...iconProps} />
      default: return <WiDaySunny {...iconProps} />
    }
  }

  // Smart recommendations based on AQI + Weather
  function getSmartRecommendations() {
    const aqi = summary?.aqi || 0
    const temp = weather?.temp || 20
    const humidity = weather?.humidity || 50
    const windSpeed = weather?.wind_speed || 0
    
    const recommendations = []
    
    // Air quality based recommendations
    if (aqi <= 50) {
      recommendations.push({ icon: <FaRunning color="#10b981" />, text: "Perfect for outdoor activities!", type: "good" })
    } else if (aqi <= 100) {
      recommendations.push({ icon: <FaLeaf color="#f59e0b" />, text: "Outdoor activities OK, consider reducing intensity", type: "moderate" })
    } else if (aqi <= 150) {
      recommendations.push({ icon: <FaMask color="#ef4444" />, text: "Sensitive individuals should wear masks outdoors", type: "unhealthy" })
    } else {
      recommendations.push({ icon: <FaHome color="#dc2626" />, text: "Stay indoors and avoid outdoor activities", type: "dangerous" })
    }
    
    // Weather-based modifications
    if (temp > 30) {
      recommendations.push({ icon: <WiDaySunny color="#f59e0b" />, text: "Stay hydrated! Very hot weather", type: "warning" })
    } else if (temp < 0) {
      recommendations.push({ icon: <WiSnow color="#3b82f6" />, text: "Bundle up! Freezing temperatures", type: "warning" })
    }
    
    if (humidity > 80) {
      recommendations.push({ icon: <WiCloudy color="#6b7280" />, text: "High humidity may worsen air quality effects", type: "info" })
    }
    
    if (windSpeed < 1) {
      recommendations.push({ icon: <WiWindy color="#8b5cf6" />, text: "Low wind may trap pollutants", type: "warning" })
    }
    
    return recommendations
  }

  return (
    <div className="min-h-screen bg-space bg-[var(--space-gradient)] text-white">
      <header className="container mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-nasa-500 flex items-center justify-center shadow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="white"/></svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Clear Skies</h1>
            <p className="text-xs text-white/70">NASA Air Quality Dashboard</p>
          </div>
        </div>

        <nav className="hidden sm:flex gap-2">
          {routes.map(r=> (
            <button key={r} onClick={()=>setRoute(r)} className={`px-3 py-1 rounded-md text-sm ${route===r? 'bg-nasa-300 text-[#071a2b]':'bg-white/10 text-white/80 hover:bg-white/20'}`}>{r.charAt(0).toUpperCase()+r.slice(1)}</button>
          ))}
        </nav>
        
        <div className="flex items-center gap-3">
          <button onClick={()=>setShowAlerts(v=>!v)} className="p-2 rounded-md bg-white/10">
            <Bell size={18} />
          </button>
          <button className="sm:hidden p-2 rounded-md bg-white/10" onClick={()=>setMobileOpen(v=>!v)} aria-label="Open menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="#e6f0ff" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
          {showAlerts && (
            <div className="absolute right-4 top-16 w-80 bg-[#061422] border border-white/10 rounded-md shadow-lg p-3 z-50">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Notifications</div>
                <button onClick={()=>setShowAlerts(false)} className="text-xs text-white/60">Close</button>
              </div>
              <div className="mt-2 text-xs">
                {alerts.length===0 && <div className="text-white/70">No alerts</div>}
                {alerts.map(a=> (
                  <div key={a.timestamp} className="p-2 mt-2 bg-[#02121a] rounded-md">
                    <div className="flex justify-between text-xs"><div>{new Date(a.timestamp).toLocaleString()}</div><div className="font-semibold">{a.predicted_aqi}</div></div>
                    <div className="text-[11px] text-white/70 mt-1">{a.message}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right"><button onClick={()=>setRoute('recs')} className="text-xs underline">View recommendations</button></div>
            </div>
          )}
        </div>
      </header>

      {alerts.length>0 && (
        <div className="container mx-auto mb-4">
          <div className="card bg-rose-700/50 border-rose-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Active Air Quality Alerts</div>
                <div className="text-xs text-white/80">{alerts.length} active • highest predicted AQI: {Math.max(...alerts.map(a=>a.predicted_aqi))}</div>
              </div>
              <div>
                <button onClick={()=>setRoute('alerts')} className="px-3 py-1 bg-white/10 rounded-md">View details</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* mobile nav drawer */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setMobileOpen(false)} />
          <div className="absolute left-0 top-0 w-64 h-full bg-[#061422] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Menu</div>
              <button onClick={()=>setMobileOpen(false)} className="text-sm">Close</button>
            </div>
            <div className="flex flex-col gap-2">
              {routes.map(r=> (
                <button key={r} onClick={()=>{ setRoute(r); setMobileOpen(false) }} className={`text-left px-3 py-2 rounded-md ${route===r? 'bg-white/10':'hover:bg-white/5'}`}>{r.charAt(0).toUpperCase()+r.slice(1)}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 py-4">
        <section className="lg:col-span-1 space-y-4">
          {/* Current Conditions Card */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <MdLocationOn size={20} color="#60a5fa" />
              <h3 className="text-lg font-semibold">{location.city}</h3>
              <button onClick={()=>fetchWeatherData(location.lat, location.lon)} className="ml-auto px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20">
                Refresh
              </button>
            </div>
            
            {/* Air Quality Status */}
            <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{summary && Number.isFinite(summary.aqi) ? Math.round(summary.aqi) : '—'}</div>
                  <div className="text-sm text-white/80">Air Quality Index</div>
                </div>
                <div className="text-right">
                  <MdAir size={32} color="#60a5fa" />
                  <div className="text-xs text-white/70 mt-1">
                    {summary?.aqi <= 50 ? 'Good' : summary?.aqi <= 100 ? 'Moderate' : summary?.aqi <= 150 ? 'Unhealthy for Sensitive' : 'Unhealthy'}
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Status */}
            {weather && (
              <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{weather.temp}°C</div>
                    <div className="text-sm text-white/80 capitalize">{weather.description}</div>
                    <div className="text-xs text-white/60">Feels like {weather.feels_like}°C</div>
                  </div>
                  <div className="text-right">
                    {getWeatherIcon(weather.weather, 36)}
                    <div className="text-xs text-white/70 mt-1">
                      {weather.humidity}% humidity
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="panel-sm text-center">
                <div className="text-xs text-white/70">PM2.5</div>
                <div className="text-lg font-semibold">{summary?.pollutants?.pm25 ? Math.round(summary.pollutants.pm25) : '—'} µg/m³</div>
              </div>
              <div className="panel-sm text-center">
                <div className="text-xs text-white/70">Wind</div>
                <div className="text-lg font-semibold">{weather?.wind_speed ? Math.round(weather.wind_speed) : '—'} m/s</div>
              </div>
            </div>
          </div>

          {/* Smart Recommendations Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaLeaf color="#10b981" />
              Health Recommendations
            </h3>
            <div className="space-y-3">
              {getSmartRecommendations().slice(0, 3).map((rec, idx) => (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${
                  rec.type === 'good' ? 'bg-green-500/20 border border-green-500/30' :
                  rec.type === 'moderate' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                  rec.type === 'unhealthy' ? 'bg-red-500/20 border border-red-500/30' :
                  rec.type === 'dangerous' ? 'bg-red-600/20 border border-red-600/30' :
                  'bg-blue-500/20 border border-blue-500/30'
                }`}>
                  <div className="mt-0.5">{rec.icon}</div>
                  <div className="text-sm">{rec.text}</div>
                </div>
              ))}
              <button onClick={()=>setRoute('recs')} className="w-full mt-3 px-3 py-2 rounded-md bg-nasa-300 text-[#071a2b] text-sm font-medium hover:bg-nasa-400 transition-colors">
                View All Recommendations
              </button>
            </div>
          </div>

          {/* Alerts Card */}
          {alerts.length > 0 && (
            <div className="card border-l-4 border-red-500">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-400">
                <Bell size={18} />
                Active Alerts
              </h3>
              <div className="space-y-2">
                {alerts.slice(0, 2).map(alert => (
                  <div key={alert.timestamp} className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                    <div className="flex justify-between items-start">
                      <div className="text-sm">{alert.message}</div>
                      <div className="text-xs text-red-300 font-semibold">AQI {alert.predicted_aqi}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="lg:col-span-2 space-y-4">
          {route==='current' && <Current currentData={summary} sensorData={sensorData} weatherData={weather} />}
          {route==='forecast' && <Forecast />}
          {route==='metrics' && <Metrics />}
          {route==='alerts' && <Alerts />}
          {route==='recs' && <Recs />}
        </section>
      </main>

      <footer className="container mx-auto text-center text-xs text-white/60 py-6">
        Data served from the deployed API • <a className="underline" href="https://nasa-spaceapp-challenge-1.onrender.com">API</a>
      </footer>
    </div>
  )
}
