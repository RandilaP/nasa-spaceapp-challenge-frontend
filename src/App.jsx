import React from 'react'
import axios from 'axios'
import { Bell } from 'lucide-react'
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
  const [showAlerts, setShowAlerts] = React.useState(false)
  const [alerts, setAlerts] = React.useState([])
  const [recs, setRecs] = React.useState(null)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE || 'https://nasa-spaceapp-challenge-1.onrender.com'

  React.useEffect(()=>{
    axios.get(`${API_BASE}/current`).then(r=> setSummary(r.data)).catch(()=>{})
    axios.get(`${API_BASE}/alerts?threshold=100`).then(r=> setAlerts(r.data.alerts || [])).catch(()=>{})
    axios.get(`${API_BASE}/health-recommendations`).then(r=> setRecs(r.data)).catch(()=>{})
    // Fetch sensor data for USA sensor
    ;(async function(){
      try{
        await fetchSensorData(sensorId)
      }catch(e){ console.warn('sensor data fetch failed', e) }
    })()
  },[])

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
          <div className="card">
            <h3 className="text-sm text-white/80">Overview</h3>
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-xs text-white/70">Sensor Data</div>
                <div className="text-xs">Sensor ID: {sensorId}</div>
                <button onClick={()=>fetchSensorData(sensorId)} className="ml-2 px-2 py-1 text-xs rounded bg-white/10">Refresh Sensor</button>
                <div className="ml-auto text-xs text-white/70">{sensorData ? `Measurements: ${sensorData.measurements?.results?.length || 0} • Hours: ${sensorData.hours?.results?.length || 0} • Days: ${sensorData.days?.results?.length || 0}` : 'Loading sensor data...'}</div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="panel-sm text-center">
                  <div className="text-xs text-white/70">AQI</div>
                  <div className="text-xl font-semibold">{summary && Number.isFinite(summary.aqi) ? Math.round(summary.aqi) : '—'}</div>
                  {summary?.recent_aqi && <div className="mt-2 h-6"><Line data={{ labels: summary.recent_aqi.map((_,i)=>i), datasets:[{ data: summary.recent_aqi, borderColor:'#60a5fa', tension:0.4, pointRadius:0 }] }} options={{ plugins:{ legend:{ display:false } }, scales:{ x:{ display:false }, y:{ display:false } }, elements:{ line:{ borderWidth:2 } } }} /></div>}
                </div>
                <div className="panel-sm text-center">
                  <div className="text-xs text-white/70">PM2.5</div>
                  <div className="text-xl font-semibold">{summary?.pollutants?.pm25 ? Math.round(summary.pollutants.pm25) : '—'}</div>
                </div>
                <div className="panel-sm text-center">
                  <div className="text-xs text-white/70">O₃</div>
                  <div className="text-xl font-semibold">{summary?.pollutants?.o3 ? Math.round(summary.pollutants.o3) : '—'}</div>
                </div>
              </div>
              
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm text-white/80">Alerts</h3>
            <div className="mt-3 text-sm text-white/70">No active alerts</div>
          </div>
          {recs && (
            <div className="card">
              <h3 className="text-sm text-white/80">Recommendation</h3>
              <div className="mt-2 text-sm">
                <div className="font-medium">{recs.recommendations?.[0] || 'Stay informed'}</div>
                <div className="mt-2 text-xs text-white/70">Current AQI: {recs.current_aqi}</div>
                <div className="mt-3"><button onClick={()=>setRoute('recs')} className="px-3 py-1 rounded-md bg-nasa-300 text-[#071a2b] text-sm">See all</button></div>
              </div>
            </div>
          )}
        </section>

        <section className="lg:col-span-2 space-y-4">
          {route==='current' && <Current currentData={summary} sensorData={sensorData} />}
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
