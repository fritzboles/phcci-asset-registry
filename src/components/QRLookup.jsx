import { useState } from 'react'
import { supabase } from '../supabaseClient.js'
import QRScanner from './QRScanner.jsx'

/**
 * Staff can either tap "Scan" to open the camera and read the QR code
 * automatically, or paste a code they got some other way.
 */
export default function QRLookup({ onFound }) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState(null) // { type: 'error' | 'info', message }
  const [loading, setLoading] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)

  async function lookupCode(rawCode) {
    const trimmed = rawCode.trim()
    if (!trimmed) return

    setLoading(true)
    setStatus(null)

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('qr_code', trimmed)
      .maybeSingle()

    setLoading(false)

    if (error) {
      setStatus({ type: 'error', message: 'Lookup failed. Check your connection and try again.' })
      return
    }
    if (!data) {
      setStatus({ type: 'error', message: 'No asset is registered under that code yet.' })
      return
    }

    setStatus(null)
    setCode('')
    onFound?.(data)
  }

  function handleSubmit(e) {
    e.preventDefault()
    lookupCode(code)
  }

  function handleScanResult(decodedText) {
    setScannerOpen(false)
    lookupCode(decodedText)
  }

  return (
    <>
      <form className="qr-lookup" onSubmit={handleSubmit}>
        <button
          type="button"
          className="qr-scan-button"
          onClick={() => setScannerOpen(true)}
        >
          📷 Scan
        </button>
        <input
          type="text"
          inputMode="text"
          placeholder="...or paste the scanned QR code here"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label="QR code"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Looking up…' : 'Find asset'}
        </button>
        {status && (
          <span className={`status-line ${status.type === 'error' ? 'error' : ''}`} role="status">
            {status.message}
          </span>
        )}
      </form>

      {scannerOpen && (
        <QRScanner onScan={handleScanResult} onClose={() => setScannerOpen(false)} />
      )}
    </>
  )
}