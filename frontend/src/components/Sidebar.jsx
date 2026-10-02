import { NavLink } from 'react-router-dom'
import {
  HomeIcon, ChartBarIcon, FlagIcon, DocumentTextIcon,
  UserIcon, ShieldCheckIcon, XMarkIcon, HeartIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { to: '/metrics', icon: ChartBarIcon, label: 'Health Metrics' },
  { to: '/goals', icon: FlagIcon, label: 'Goals' },
  { to: '/reports', icon: DocumentTextIcon, label: 'Reports' },
  { to: '/profile', icon: UserIcon, label: 'Profile' },
]

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-700
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          lg:translate-x-0 lg:relative lg:z-auto lg:shrink-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <HeartIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">HealthTrack</p>
              <p className="text-xs text-primary-400 font-semibold mt-0.5">Pro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-700 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-3">Navigation</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              id={`nav-${label.toLowerCase().replace(/ /g, '-')}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                 ${isActive
                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25 shadow-sm shadow-primary-500/10'
                    : 'text-slate-400 hover:bg-dark-700 hover:text-white border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
                  <span>{label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mt-5 mb-3">Administration</p>
              <NavLink
                to="/admin"
                onClick={onClose}
                id="nav-admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                   ${isActive
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                      : 'text-slate-400 hover:bg-dark-700 hover:text-white border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <ShieldCheckIcon className={`h-5 w-5 shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                    <span>Admin Panel</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-400" />
                    )}
                  </>
                )}
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-dark-700 shrink-0">
          <div className="bg-gradient-to-br from-primary-500/10 to-emerald-500/5 rounded-xl p-4 border border-primary-500/15">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
              <p className="text-xs font-semibold text-primary-400">All systems healthy</p>
            </div>
            <p className="text-xs text-slate-500">HealthTrack Pro v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
