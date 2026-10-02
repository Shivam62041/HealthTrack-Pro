import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '../api/adminApi'
import toast from 'react-hot-toast'
import {
  UsersIcon,
  UserCircleIcon,
  ArrowTrendingUpIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import StatCard from '../components/StatCard'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const loadStats = async () => {
    try {
      const s = await adminApi.getStats()
      setStats(s)
    } catch {
      toast.error('Failed to load statistics')
    } finally {
      setStatsLoading(false)
    }
  }

  const loadUsers = useCallback(async (q = '', page = 0) => {
    setLoading(true)
    try {
      const data = await adminApi.getUsers(q, page, 15)
      setUsers(data.content || [])
      setTotalPages(data.totalPages || 0)
      setCurrentPage(data.number || 0)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
    loadUsers()
  }, [loadUsers])

  const handleSearch = (e) => {
    const q = e.target.value
    setSearch(q)
    loadUsers(q, 0)
  }

  const toggleUser = async (u) => {
    setActionLoading(u.id)
    try {
      if (u.isActive) {
        await adminApi.disableUser(u.id)
        toast.success(`${u.fullName} has been disabled`)
      } else {
        await adminApi.activateUser(u.id)
        toast.success(`${u.fullName} has been reactivated`)
      }
      await loadUsers(search, currentPage)
    } catch {
      toast.error('Action failed. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
          <ShieldCheckIcon className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Platform overview and user management</p>
        </div>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-dark-700 rounded w-3/4 mb-3" />
              <div className="h-8 bg-dark-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={UsersIcon}
            color="primary"
            subtitle="Registered accounts"
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={UserCircleIcon}
            color="blue"
            subtitle="Currently enabled"
          />
          <StatCard
            title="Daily Logins"
            value={stats.dailyLogins}
            icon={ArrowTrendingUpIcon}
            color="purple"
            subtitle="Last 24 hours"
          />
          <StatCard
            title="Goal Completion"
            value={`${stats.goalCompletionRate}%`}
            icon={FlagIcon}
            color="orange"
            subtitle="Overall rate"
          />
        </div>
      )}

      {/* Users Management */}
      <div className="card">
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">User Management</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {users.length} users shown
            </p>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="admin-search"
              type="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearch}
              className="input pl-10 w-full sm:w-72 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-dark-700 bg-dark-900/40">
                  {['ID', 'Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left text-slate-400 font-medium py-3 px-6 first:pl-6 last:pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr
                    key={u.id}
                    className="border-b border-dark-700/50 hover:bg-dark-700/20 transition-colors"
                  >
                    <td className="py-4 px-6 text-slate-500 text-xs">#{u.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-400 text-xs font-bold">
                            {u.fullName?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-white font-medium">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        u.isActive
                          ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-xs">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        id={`toggle-user-${u.id}`}
                        onClick={() => toggleUser(u)}
                        disabled={actionLoading === u.id || u.role === 'ADMIN'}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all
                          disabled:opacity-40 disabled:cursor-not-allowed ${
                          u.isActive
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                            : 'bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 border border-primary-500/30'
                        }`}
                      >
                        {actionLoading === u.id
                          ? '...'
                          : u.role === 'ADMIN'
                          ? 'Protected'
                          : u.isActive
                          ? 'Disable'
                          : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No users found{search ? ` matching "${search}"` : ''}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
            <p className="text-slate-400 text-sm">Page {currentPage + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => loadUsers(search, currentPage - 1)}
                disabled={currentPage === 0}
                className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => loadUsers(search, currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
