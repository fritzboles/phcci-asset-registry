import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

/**
 * Opens the phone's camera inside the app and decodes a QR code the
 * moment it sees one, then hands the decoded text back via onScan.
 */
export default function QRScanner({ onScan, onClose }) {
  const containerId = 'qr-scanner-view'
  const scannerRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId)
    scannerRef.current = scanner
    let stopped = false

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          if (stopped) return
          stopped = true
          scanner.stop().catch(() => {})
          onScan(decodedText)
        },
        () => {
          // fires continuously while no code is found - ignore
        }
      )
      .catch((err) => {
        setError(
          'Could not start the camera. Make sure you allowed camera access, and that you are using https or localhost.'
        )
      })

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [onScan])

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-panel">
        <div className="qr-scanner-header">
          <h2>Scan QR code</h2>
          <button type="button" className="qr-scanner-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div id={containerId} className="qr-scanner-view" />
        {error && <p className="status-line error">{error}</p>}
        <p className="status-line">Point your camera at the asset's QR sticker.</p>
      </div>
    </div>
  )
}