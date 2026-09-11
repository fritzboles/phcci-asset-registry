import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import AssetCard from '../components/AssetCard.jsx'

export default function DepartmentView() {
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [headOfficeId, setHeadOfficeId] = useState(null)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOptions() {
      const [{ data: deptData }, { data: hoData }] = await Promise.all([
        supabase.from('departments').select('*').order('name'),
        supabase.from('branches').select('*').eq('location_type', 'head_office').maybeSingle(),
      ])
      setDepartments(deptData || [])
      setHeadOfficeId(hoData?.id || null)
    }
    loadOptions()
  }, [])

  useEffect(() => {
    let active = true
    async function loadAssets() {
      setLoading(true)
      let query = supabase.from('assets').select('*').order('name')
      if (headOfficeId) query = query.eq('branch_id', headOfficeId)
      if (selectedDept) query = query.eq('department_id', selectedDept)
      const { data, error } = await query
      if (active) {
        if (!error) setAssets(data || [])
        setLoading(false)
      }
    }
    if (headOfficeId !== null) loadAssets()
    return () => { active = false }
  }, [selectedDept, headOfficeId])

  return (
    <>
      <div className="page-header">
        <div>
          <h1>By department</h1>
          <p>Head Office assets grouped by department. Branch and satellite assets aren't tracked by department.</p>
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
      ) : !headOfficeId ? (
        <div className="empty-state">
          No Head Office branch is set up yet. In Supabase's branches table, set one row's location_type to head_office.
        </div>
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