import React from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://nasa-spaceapp-challenge-1.onrender.com'

export default function Recs(){
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(()=>{
    setLoading(true)
    axios.get(`${API_BASE}/health-recommendations`)
      .then(r=> setData(r.data))
      .catch(e=> setError(e.message))
      .finally(()=> setLoading(false))
  },[])

  if(loading) return <div className="card">Loading recommendations...</div>
  if(error) return <div className="card">Error: {error}</div>
  if(!data) return <div className="card">No recommendations available</div>

  return (
    <div className="card">
      <h2 className="text-xl font-semibold">Health Recommendations</h2>
      <p className="text-sm">Current AQI: {data.current_aqi} • Max forecast: {data.max_forecast_aqi}</p>
      <ul className="mt-3 list-disc list-inside text-sm">
        {data.recommendations.map((r, i)=> <li key={i}>{r}</li>)}
      </ul>
    </div>
  )
}
