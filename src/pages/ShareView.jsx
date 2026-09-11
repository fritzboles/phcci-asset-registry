import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../supabaseClient.js'

const SCOPE_OPTIONS = [
  { value: '', label: 'All locations' },
  { value: 'head_office', label: 'Head Office (by department)' },
  { value: 'branch', label: 'Branch' },
  { value: 'satellite', label: 'Satellite' },
]

export default function ShareView() {
  const [assets, setAssets] = useState([])
  const [branches, setBranches] = useState([])
  const [departments, setDepartments] = useState([])
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
        .order('branch_name', { ascending: true })
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
      if (scope === 'head_office') {
        if (a.branch_id !== null) return false
        if (selectedDept && a.department_id !== selectedDept) return false
        return true
      }
      if (scope === 'branch' || scope === 'satellite') {
        const branch = branches.find((b) => b.id === a.branch_id)
        if (!branch || branch.location_type !== scope) return false
        if (selectedLocation && a.branch_id !== selectedLocation) return false
        return true
      }
      return true
    })
  }, [assets, branches, scope, selectedLocation, selectedDept])

  function handleScopeChange(value) {
    setScope(value)
    setSelectedLocation('')
    setSelectedDept('')
  }

  function handleExport() {
    const rows = filteredAssets.map((a) => ({
      'Asset Number': a.qr_code,
      'Asset': a.name,
      'Serial No.': a.serial_number || '',
      'Branch': a.branch_name || 'Head Office',
      'Department': a.department_name || '',
      'Assigned To': a.assigned_to || '',
      'Status': a.status || '',
      'Other Specifications': a.other_specifications || '',
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets')

    const dateStr = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(workbook, `phcci-asset-registry-${dateStr}.xlsx`)
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Share view</h1>
          <p>Read-only master list combining every branch's assets — for reviews and audits.</p>
        </div>
        <button type="button" className="qr-scan-button" onClick={handleExport}>
          Export to Excel
        </button>
      </div>

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
        <div className="empty-state">No assets match this filter.</div>
      ) : (
        <table className="asset-table">
          <thead>
            <tr>
              <th>Asset Number</th>
              <th>Asset</th>
              <th>Serial no.</th>
              <th>Branch</th>
              <th>Department</th>
              <th>Assigned to</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((a) => (
              <tr key={a.id}>
                <td>{a.qr_code}</td>
                <td>{a.name}</td>
                <td>{a.serial_number || '—'}</td>
                <td>{a.branch_name || 'Head Office'}</td>
                <td>{a.department_name || '—'}</td>
                <td>{a.assigned_to || 'Unassigned'}</td>
                <td>{a.status || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}