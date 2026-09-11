import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import AssetCard from '../components/AssetCard.jsx'
import QRLookup from '../components/QRLookup.jsx'

const SCOPE_OPTIONS = [
  { value: '', label: 'All locations' },
  { value: 'head_office', label: 'Head Office (by department)' },
  { value: 'branch', label: 'Branch' },
  { value: 'satellite', label: 'Satellite' },
]

export default function ListView() {
  const [assets, setAssets] = useState([])
  const [branches, setBranches] = useState([])
  const [departments, setDepartments] = useState([])
  const [highlighted, setHighlighted] = useState(null)
  const [loading, setLoading] = useState(true)

  const [scope, setScope] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedDept, setSelectedDept] = useState('')

  useEffect(() => {
    async function loadLookups() {
      const [{ data: branchData }, { data: deptData }] = await Promise.all([
        supabase.from('branches').select('*').order('name'),
        supabase.from('departments').select('*').order('name'),
      ])
      setBranches(branchData || [])
      setDepartments(deptData || [])
    }
    loadLookups()
  }, [])

  useEffect(() => {
    let active = true
    async function load() {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })
      if (active) {
        if (!error) setAssets(data || [])
        setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const locationOptions = useMemo(() => {
    if (!scope) return []
    return branches.filter((b) => b.location_type === scope)
  }, [branches, scope])

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (scope) {
        const branch = branches.find((b) => b.id === a.branch_id)
        if (!branch || branch.location_type !== scope) return false
      }
      if (selectedLocation && a.branch_id !== selectedLocation) return false
      if (scope === 'head_office' && selectedDept && a.department_id !== selectedDept) return false
      return true
    })
  }, [assets, branches, scope, selectedLocation, selectedDept])

  function handleScopeChange(value) {
    setScope(value)
    setSelectedLocation('')
    setSelectedDept('')
  }

  function handleFound(asset) {
    setHighlighted(asset)
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>All assets</h1>
          <p>Every fixed asset registered across PHCCI branches and Head Office.</p>
        </div>
      </div>

      <QRLookup onFound={handleFound} />

      {highlighted && (
        <>
          <p className="status-line">Found via QR code:</p>
          <div className="asset-grid" style={{ marginBottom: 24 }}>
            <AssetCard asset={highlighted} />
          </div>
        </>
      )}

      <div className="filter-row">
        <select value={scope} onChange={(e) => handleScopeChange(e.target.value)}>
          {SCOPE_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {(scope === 'branch' || scope === 'satellite') && (
          <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
            <option value="">All {scope === 'branch' ? 'branches' : 'satellites'}</option>
            {locationOptions.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        )}

        {scope === 'head_office' && (
          <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <p className="status-line">Loading assets…</p>
      ) : filteredAssets.length === 0 ? (
        <div className="empty-state">
          No assets match this filter yet.
        </div>
      ) : (
        <div className="asset-grid">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </>
  )
}