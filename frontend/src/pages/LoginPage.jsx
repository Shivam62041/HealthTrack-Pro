import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, HeartIcon, BoltIcon, ChartBarIcon, FlagIcon } from '@heroicons/react/24/outline'

const features = [
  { icon: ChartBarIcon, title: 'Real-time Analytics', desc: 'Track steps, calories, sleep & more' },
  { icon: FlagIcon, title: 'Goal Tracking', desc: 'Set and achieve your health milestones' },
  { icon: BoltIcon, title: 'PDF Reports', desc: 'Export comprehensive health reports' },
]

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      toast.success(`Welcome back, ${data.fullName}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-800 via-primary-900/20 to-dark-900 relative overflow-hidden flex-col justify-between p-12 border-r border-dark-700">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/5 rounded-full blur-2xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/40">
            <HeartIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-xl block leading-none">HealthTrack</span>
            <span className="text-primary-400 font-bold text-sm">Pro</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-5xl font-bold text-white leading-tight mb-4">
              Your Health,<br />
              <span className="bg-gradient-to-r from-primary-400 to-emerald-300 bg-clip-text text-transparent">
                Visualized.
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Track every metric that matters. From daily steps to sleep patterns — all in one beautiful dashboard.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-2xl border border-dark-600/50 backdrop-blur-sm">
                <div className="h-10 w-10 bg-primary-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-slate-400 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['A','B','C','D'].map((l, i) => (
                <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500/40 to-emerald-500/40 border-2 border-dark-800 flex items-center justify-center text-xs font-bold text-white">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm"><span className="text-white font-semibold">10,000+</span> health enthusiasts trust us</p>
          </div>
        </div>

        <p className="relative text-slate-500 text-xs">© 2024 HealthTrack Pro. All rights reserved.</p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <HeartIcon className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white">HealthTrack Pro</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="text-slate-400 mt-2">Sign in to your health dashboard</p>
          </div>

          <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="label">Email address</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="label">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="input pr-12"
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In to Dashboard'}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Create one free
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-dark-800 rounded-2xl border border-dark-700">
            <p className="text-xs text-slate-500 text-center font-semibold mb-3 uppercase tracking-wider">Demo Credentials</p>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => setForm({ email: 'alice@example.com', password: 'User@123' })}
                className="w-full text-left flex justify-between items-center px-3 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 transition-colors group"
              >
                <span className="text-slate-400 group-hover:text-white transition-colors">User account</span>
                <span className="text-primary-400 font-mono">alice@example.com</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ email: 'admin@healthtrackpro.com', password: 'Admin@123' })}
                className="w-full text-left flex justify-between items-center px-3 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 transition-colors group"
              >
                <span className="text-slate-400 group-hover:text-white transition-colors">Admin account</span>
                <span className="text-purple-400 font-mono">admin@healthtrackpro.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
