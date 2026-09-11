export default function AssetCard({ asset }) {
  return (
    <div className="asset-card">
      <div className="photo">
        {asset.photo_url ? (
          <img src={asset.photo_url} alt={asset.name} />
        ) : (
          <span>No photo yet</span>
        )}
      </div>
      <div className="body">
        <p className="name">{asset.name}</p>
        <div className="meta">
          Serial: {asset.serial_number || '—'}<br />
          Assigned to: {asset.assigned_to || 'Unassigned'}<br />
          {asset.branch_name || 'Head Office'}
          {asset.department_name ? ` · ${asset.department_name}` : ''}
        </div>
        {asset.status && <span className="tag">{asset.status}</span>}
      </div>
    </div>
  )
}