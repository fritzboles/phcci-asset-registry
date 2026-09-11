import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'

const STATUS_OPTIONS = ['Active', 'Under Repair', 'Disposed', 'Missing']

export default function AddAssetView() {
  const [branches, setBranches] = useState([])
  const [departments, setDepartments] = useState([])
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)

  const [form, setForm] = useState({
    name: '',
    qr_code: '',
    serial_number: '',
    branch_id: '',
    department_id: '',
    assigned_to: '',
    status: 'Active',
    other_specifications: '',
  })
  const [photoFile, setPhotoFile] = useState(null)

  useEffect(() => {
    async function loadOptions() {
      const [{ data: branchData }, { data: deptData }] = await Promise.all([
        supabase.from('branches').select('*').order('name'),
        supabase.from('departments').select('*').order('name'),
      ])
      setBranches(branchData || [])
      setDepartments(deptData || [])
    }
    loadOptions()
  }, [])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setResult(null)

    if (!form.name.trim() || !form.qr_code.trim()) {
      setResult({ type: 'error', message: 'Asset name and QR code are required.' })
      return
    }

    setSaving(true)

    let photo_url = null

    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop()
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('asset-photos')
        .upload(filePath, photoFile)

      if (uploadError) {
        setSaving(false)
        setResult({ type: 'error', message: 'Photo upload failed: ' + uploadError.message })
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('asset-photos')
        .getPublicUrl(filePath)

      photo_url = publicUrlData.publicUrl
    }

    const { error: insertError } = await supabase.from('assets').insert({
      name: form.name.trim(),
      qr_code: form.qr_code.trim(),
      serial_number: form.serial_number.trim() || null,
      branch_id: form.branch_id || null,
      department_id: form.department_id || null,
      assigned_to: form.assigned_to.trim() || null,
      status: form.status,
      other_specifications: form.other_specifications.trim() || null,
      photo_url,
    })

    setSaving(false)

    if (insertError) {
      setResult({ type: 'error', message: 'Could not save asset: ' + insertError.message })
      return
    }

    setResult({ type: 'success', message: `"${form.name}" was added to the registry.` })
    setForm({
      name: '',
      qr_code: '',
      serial_number: '',
      branch_id: '',
      department_id: '',
      assigned_to: '',
      status: 'Active',
      other_specifications: '',
    })
    setPhotoFile(null)
    e.target.reset()
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Add asset</h1>
          <p>Register a new fixed asset. Fill in what you have — you can always edit it later.</p>
        </div>
      </div>

      <form className="asset-form" onSubmit={handleSubmit}>
        <label>
          Asset name *
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g. Dell Laptop, Office Aircon"
          />
        </label>

        <label>
          QR code *
          <input
            type="text"
            value={form.qr_code}
            onChange={(e) => updateField('qr_code', e.target.value)}
            placeholder="Paste the code from the asset's QR sticker"
          />
        </label>

        <label>
          Serial number
          <input
            type="text"
            value={form.serial_number}
            onChange={(e) => updateField('serial_number', e.target.value)}
          />
        </label>

        <label>
          Branch or Satellite Office
          <select
            value={form.branch_id}
            onChange={(e) => updateField('branch_id', e.target.value)}
          >
            <option value="">Select branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </label>

        <label>
          Department for Head Office
          <select
            value={form.department_id}
            onChange={(e) => updateField('department_id', e.target.value)}
          >
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>

        <label>
          Assigned to
          <input
            type="text"
            value={form.assigned_to}
            onChange={(e) => updateField('assigned_to', e.target.value)}
            placeholder="Staff name"
          />
        </label>

        <label>
          Status
          <select
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label>
          Other specifications
          <textarea
            rows={3}
            value={form.other_specifications}
            onChange={(e) => updateField('other_specifications', e.target.value)}
            placeholder="input brand, color and other applicable specs"
          />
        </label>

        <label>
          Photo of asset
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save asset'}
        </button>

        {result && (
          <p className={`status-line ${result.type === 'error' ? 'error' : ''}`} role="status">
            {result.message}
          </p>
        )}
      </form>
    </>
  )
}