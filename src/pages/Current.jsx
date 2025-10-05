import React from 'react'
import { Cloud, Wind, Droplet, AlertTriangle, Activity } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip)

export default function Current({ currentData, sensorData }){
  const [data, setData] = React.useState(currentData || null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [view, setView] = React.useState('satellite') // 'satellite' or 'sensor'
  const [selectedPeriod, setSelectedPeriod] = React.useState('measurements') // 'measurements', 'hours', 'days', 'years'

  // if no data provided, fetch (backwards compatible)
  React.useEffect(()=>{
    if(!currentData){
      setLoading(true)
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://nasa-spaceapp-challenge-1.onrender.com'
      fetch(`${API_BASE}/current`).then(r=>r.json()).then(js=> setData(js)).catch(e=> setError(e.message)).finally(()=> setLoading(false))
    }
  },[currentData])

  // keep local data in sync when parent summary (currentData) updates
  React.useEffect(()=>{
    if(currentData) setData(currentData)
  },[currentData])

  // Helper function to get sensor data for the selected period
  function getSensorDataForPeriod(){
    if(!sensorData || !sensorData[selectedPeriod]) return null
    return sensorData[selectedPeriod]
  }

  // Helper function to calculate average value from sensor data
  function calculateAverageValue(data, parameter = 'pm25'){
    if(!data || !data.results) return null
    const values = data.results
      .filter(item => item.parameter?.name === parameter)
      .map(item => item.value)
      .filter(val => typeof val === 'number' && !isNaN(val))
    
    return values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null
  }

  if(loading) return <div className="card">Loading current conditions...</div>
  if(error) return <div className="card">Error: {error}</div>
  if(!data) return <div className="card">No data</div>

  const aqi = Number.isFinite(data?.aqi) ? Math.round(data.aqi) : null
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

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={()=>setView('satellite')} className={`px-3 py-1 rounded-md text-sm ${view==='satellite' ? 'bg-white/10':'bg-transparent'}`}>Satellite (TEMPO)</button>
          <button onClick={()=>setView('sensor')} className={`px-3 py-1 rounded-md text-sm ${view==='sensor' ? 'bg-white/10':'bg-transparent'}`}>Sensor Data</button>
        </div>
        <div className="text-xs text-white/70">Source: {view==='satellite' ? 'TEMPO (satellite)' : view==='sensor' ? 'OpenAQ Sensor' : 'Ground sensors'}</div>
      </div>

      {view === 'sensor' && (
        <div className="mt-2 flex gap-2">
          <button onClick={()=>setSelectedPeriod('measurements')} className={`px-2 py-1 rounded-md text-xs ${selectedPeriod==='measurements'? 'bg-white/20 text-white':'bg-white/10 text-white/70'}`}>Measurements</button>
          <button onClick={()=>setSelectedPeriod('hours')} className={`px-2 py-1 rounded-md text-xs ${selectedPeriod==='hours'? 'bg-white/20 text-white':'bg-white/10 text-white/70'}`}>Hours</button>
          <button onClick={()=>setSelectedPeriod('days')} className={`px-2 py-1 rounded-md text-xs ${selectedPeriod==='days'? 'bg-white/20 text-white':'bg-white/10 text-white/70'}`}>Days</button>
          <button onClick={()=>setSelectedPeriod('years')} className={`px-2 py-1 rounded-md text-xs ${selectedPeriod==='years'? 'bg-white/20 text-white':'bg-white/10 text-white/70'}`}>Years</button>
        </div>
      )}

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
            {view==='satellite' && (
              <> {Object.entries(pollutants).length === 0 && <div className="text-white/60">No pollutant data</div>}
                {Object.entries(pollutants).map(([k,v])=> (
                  <div key={k} className="flex items-center justify-between bg-white/3 p-2 rounded-md">
                    <div className="text-xs text-white/80">{k.toUpperCase()}</div>
                    <div className="font-semibold">{round(v)}</div>
                  </div>
                ))}
              </>
            )}

            {view==='sensor' && (
              <>
                {(() => {
                  const currentSensorData = getSensorDataForPeriod()
                  const avgPM25 = calculateAverageValue(currentSensorData, 'pm25')
                  
                  if(!sensorData) {
                    return <div className="text-white/60">Loading sensor data...</div>
                  }
                  
                  if(sensorData.error) {
                    return <div className="text-white/60">Error loading sensor data: {sensorData.error}</div>
                  }
                  
                  if(!currentSensorData || !currentSensorData.results || currentSensorData.results.length === 0) {
                    return <div className="text-white/60">No {selectedPeriod} data available for sensor {sensorData.sensorId}</div>
                  }
                  
                  return (
                    <>
                      <div className="col-span-2 text-sm">Sensor {sensorData.sensorId} ({selectedPeriod})</div>
                      <div className="col-span-2 text-xs text-white/70 mt-1">Showing {currentSensorData.results.length} data points</div>
                      {avgPM25 && (
                        <div className="col-span-2 text-sm mt-2">Average PM2.5: <strong>{avgPM25} µg/m³</strong></div>
                      )}
                      <div className="col-span-2 mt-3">
                        {currentSensorData.results.slice(0, 10).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs py-1 border-b border-white/5">
                            <span>{item.parameter?.name || 'unknown'}</span>
                            <span>{item.value} {item.parameter?.units || 'µg/m³'}</span>
                            <span className="text-white/50">{new Date(item.period?.datetimeFrom?.utc || item.datetime).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                })()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
