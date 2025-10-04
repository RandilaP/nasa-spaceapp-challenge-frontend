import React from 'react'
import axios from 'axios'

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

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Alerts</h2>
        <div className="flex items-center space-x-2">
          <input type="number" value={threshold} onChange={e=>setThreshold(Number(e.target.value))} className="w-20 p-1 rounded-md" />
          <button onClick={fetchAlerts} className="px-3 py-1 bg-sky-600 text-white rounded-md">Check</button>
        </div>
      </div>

      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4 text-red-600">Error: {error}</p>}

      {data && (
        <div className="mt-4 text-sm">
          <div>Found {data.alert_count} alerts above {data.threshold}</div>
          <ul className="mt-2 space-y-2">
            {data.alerts.map(a=> (
              <li key={a.timestamp} className="p-2 bg-white/50 rounded-md">
                <div className="flex justify-between"><div>{new Date(a.timestamp).toLocaleString()}</div><div>{a.predicted_aqi} • {a.category}</div></div>
                <div className="text-xs text-slate-600">{a.message}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
