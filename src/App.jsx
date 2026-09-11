import { NavLink, Routes, Route } from 'react-router-dom'
import ListView from './pages/ListView.jsx'
import BranchView from './pages/BranchView.jsx'
import DepartmentView from './pages/DepartmentView.jsx'
import ShareView from './pages/ShareView.jsx'
import AddAssetView from './pages/AddAssetView.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'All assets', end: true },
  { to: '/add', label: 'Add asset' },
  { to: '/branch', label: 'By branch and satellite' },
  { to: '/department', label: 'By department' },
  { to: '/share', label: 'Share view' },
]

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
                <div className="sidebar-brand">
          <img src="/icons/logo-sidebar.png" alt="PHCCI" className="sidebar-logo" />
          <span className="sidebar-brand-text">Fixed Asset Registry</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main">
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/add" element={<AddAssetView />} />
          <Route path="/branch" element={<BranchView />} />
          <Route path="/department" element={<DepartmentView />} />
          <Route path="/share" element={<ShareView />} />
        </Routes>
      </main>
    </div>
  )
}