import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import AssetCard from '../components/AssetCard.jsx'

export default function DepartmentView() {
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDepartments() {
      const { data } = await supabase.from('departments').select('*').order('name')
      setDepartments(data || [])
    }
    loadDepartments()
  }, [])

  useEffect(() => {
    let active = true
    async function loadAssets() {
      setLoading(true)
      let query = supabase.from('assets').select('*').is('branch_id', null).order('name')
      if (selectedDept) query = query.eq('department_id', selectedDept)
      const { data, error } = await query
      if (active) {
        if (!error) setAssets(data || [])
        setLoading(false)
      }
    }
    loadAssets()
    return () => { active = false }
  }, [selectedDept])

  return (
    <>
      <div className="page-header">
        <div>
          <h1>By department</h1>
          <p>Head Office assets grouped by department (assets with no branch assigned). Branch and satellite assets aren't tracked by department.</p>
        </div>
      </div>

      <div className="filter-row">
        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="status-line">Loading assets…</p>
      ) : assets.length === 0 ? (
        <div className="empty-state">No assets found for this department yet.</div>
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