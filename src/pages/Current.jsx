import React from 'react'
import { Cloud, Wind, Droplet, AlertTriangle, Activity } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip)

export default function Current({ currentData }){
  const [data, setData] = React.useState(currentData || null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  // if no data provided, fetch (backwards compatible)
  React.useEffect(()=>{
    if(currentData) return
    setLoading(true)
    const API_BASE = import.meta.env.VITE_API_BASE || 'https://nasa-spaceapp-challenge-1.onrender.com'
    fetch(`${API_BASE}/current`).then(r=>r.json()).then(js=> setData(js)).catch(e=> setError(e.message)).finally(()=> setLoading(false))
  },[currentData])

  if(loading) return <div className="card">Loading current conditions...</div>
  if(error) return <div className="card">Error: {error}</div>
  if(!data) return <div className="card">No data</div>

  const aqi = Math.round(data.aqi)
  const aqiCategory = data.aqi_category || 'Unknown'

  function aqiColor(score){
    if(score <= 50) return 'bg-green-500'
    if(score <= 100) return 'bg-yellow-400 text-black'
    if(score <= 150) return 'bg-orange-500'
    if(score <= 200) return 'bg-red-600'
    if(score <= 300) return 'bg-purple-700'
    return 'bg-rose-800'
  }

  // safe access + rounding helpers
  const w = data.weather || {}
  const pollutants = data.pollutants || {}

  const round = (n) => (typeof n === 'number' ? Math.round(n) : n)

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Current Conditions</h2>
          <p className="text-xs text-white/70">{data.timestamp ? new Date(data.timestamp).toLocaleString() : '—'}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`aqi-badge ${aqiColor(aqi)} text-lg`}>{round(aqi)}</div>
          <div className="text-sm text-white/70">{aqiCategory}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="panel-sm">
          <h3 className="text-sm font-medium">Weather</h3>
          <div className="mt-2 space-y-1 text-sm text-white/80">
            <div className="flex items-center justify-between"><span>Temperature</span><strong>{round(w.temperature) ?? '—'} °C</strong></div>
            <div className="flex items-center justify-between"><span>Wind</span><strong>{round(w.wind_speed) ?? '—'} m/s</strong></div>
            <div className="flex items-center justify-between"><span>Humidity</span><strong>{round(w.humidity) ?? '—'}%</strong></div>
          </div>
        </div>

        <div className="panel-sm">
          <h3 className="text-sm font-medium">Pollutants</h3>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(pollutants).length === 0 && <div className="text-white/60">No pollutant data</div>}
            {Object.entries(pollutants).map(([k,v])=> (
              <div key={k} className="flex items-center justify-between bg-white/3 p-2 rounded-md">
                <div className="text-xs text-white/80">{k.toUpperCase()}</div>
                <div className="font-semibold">{round(v)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
