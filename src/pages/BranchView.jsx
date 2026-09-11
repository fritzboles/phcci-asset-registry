import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import AssetCard from '../components/AssetCard.jsx'

const TYPE_OPTIONS = [
  { value: '', label: 'All branches & satellites' },
  { value: 'branch', label: 'Branches only' },
  { value: 'satellite', label: 'Satellites only' },
]

export default function BranchView() {
  const [locations, setLocations] = useState([])
  const [selectedType, setSelectedType] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLocations() {
      const { data } = await supabase
        .from('branches')
        .select('*')
        .in('location_type', ['branch', 'satellite'])
        .order('name')
      setLocations(data || [])
    }
    loadLocations()
  }, [])

  const visibleLocations = selectedType
    ? locations.filter((l) => l.location_type === selectedType)
    : locations

  useEffect(() => {
    let active = true
    async function loadAssets() {
      setLoading(true)
      let query = supabase.from('assets').select('*').order('name')

      if (selectedLocation) {
        query = query.eq('branch_id', selectedLocation)
      } else {
        const ids = visibleLocations.map((l) => l.id)
        if (ids.length > 0) query = query.in('branch_id', ids)
      }

      const { data, error } = await query
      if (active) {
        if (!error) setAssets(data || [])
        setLoading(false)
      }
    }
    loadAssets()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, selectedType, locations])

  return (
    <>
      <div className="page-header">
        <div>
          <h1>By branch and satellite</h1>
          <p>Assets grouped by the branch or satellite office they're assigned to.</p>
        </div>
      </div>

      <div className="filter-row">
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value)
            setSelectedLocation('')
          }}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
          <option value="">All in this list</option>
          {visibleLocations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="status-line">Loading assets…</p>
      ) : assets.length === 0 ? (
        <div className="empty-state">No assets found here yet.</div>
      ) : (
        <div className="asset-grid">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </>
  )
}