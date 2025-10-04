import React from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://nasa-spaceapp-challenge-1.onrender.com'

export default function Forecast(){
  const [hours, setHours] = React.useState(24)
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const fetchForecast = ()=>{
    setLoading(true); setError(null)
    axios.post(`${API_BASE}/forecast`, { hours })
      .then(r=> setData(r.data))
      .catch(e=> setError(e.message))
      .finally(()=> setLoading(false))
  }

  React.useEffect(()=>{ fetchForecast() }, [])

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Forecast</h2>
        <div className="flex items-center space-x-2">
          <input type="number" min={1} max={72} value={hours} onChange={e=>setHours(Number(e.target.value))} className="w-20 p-1 rounded-md" />
          <button onClick={fetchForecast} className="px-3 py-1 bg-sky-600 text-white rounded-md">Refresh</button>
        </div>
      </div>

      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4 text-red-600">Error: {error}</p>}

      <ul className="mt-4 space-y-2 text-sm">
        {data.map(item=> (
          <li key={item.timestamp} className="p-2 bg-white/50 rounded-md">
            <div className="flex justify-between">
              <div>{new Date(item.timestamp).toLocaleString()} • +{item.hours_ahead}h</div>
              <div className="font-semibold">{Math.round(item.predicted_aqi)} • {item.aqi_category}</div>
            </div>
            <div className="text-xs text-slate-600">{item.health_message}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
