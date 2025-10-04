import React from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://nasa-spaceapp-challenge-1.onrender.com'

export default function Metrics(){
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(()=>{
    setLoading(true)
    axios.get(`${API_BASE}/metrics`)
      .then(r=> setData(r.data))
      .catch(e=> setError(e.message))
      .finally(()=> setLoading(false))
  },[])

  if(loading) return <div className="card">Loading metrics...</div>
  if(error) return <div className="card">Error: {error}</div>
  if(!data) return <div className="card">No metrics available</div>

  return (
    <div className="card">
      <h2 className="text-xl font-semibold">Model Metrics</h2>
      <p className="text-sm">Model: {data.model_name}</p>
      <div className="mt-3 grid grid-cols-3 gap-4">
        <div><div className="text-lg font-bold">{data.rmse}</div><div className="text-xs">RMSE</div></div>
        <div><div className="text-lg font-bold">{data.mae}</div><div className="text-xs">MAE</div></div>
        <div><div className="text-lg font-bold">{data.r2}</div><div className="text-xs">R²</div></div>
      </div>
      <div className="mt-4">
        <h3 className="font-medium">Top features</h3>
        <ul className="text-sm">
          {Object.entries(data.feature_importance).map(([k,v])=> (
            <li key={k}>{k}: {v}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
