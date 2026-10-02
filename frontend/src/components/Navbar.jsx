import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bars3Icon, BellIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user?.fullName
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  return (
    <header className="bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between shrink-0">
      <button
        id="sidebar-toggle"
        onClick={onMenuClick}
        className="lg:hidden text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div className="hidden lg:block">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">H</span>
          </div>
          <h1 className="text-base font-bold text-white">HealthTrack Pro</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notification Bell */}
        <button
          id="notification-bell"
          className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-dark-700"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary-500 rounded-full animate-pulse" />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="user-menu-btn"
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-dark-700 transition-colors"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500/30 to-emerald-500/30 border border-primary-500/40 flex items-center justify-center">
              <span className="text-primary-400 font-bold text-xs">{initials}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-white leading-none">{user?.fullName}</p>
              <p className="text-xs text-slate-400 mt-0.5">{user?.role}</p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl shadow-black/50 py-1 z-50 animate-slide-up">
              <div className="px-4 py-3 border-b border-dark-700">
                <p className="text-sm font-semibold text-white">{user?.fullName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-700 hover:text-white transition-colors"
              >
                <UserCircleIcon className="h-4 w-4" />
                My Profile
              </Link>
              <button
                id="logout-btn"
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
