import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { HeartIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '',
    age: '', gender: '', height: '', weight: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender || undefined,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
      }
      await register(payload)
      toast.success('Account created successfully! Welcome aboard 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/30">
              <HeartIcon className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 mt-2">Start tracking your health journey today</p>
        </div>

        <form id="register-form" onSubmit={handleSubmit} className="card space-y-5">
          {/* Personal info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">1</span>
              Account Details
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="reg-fullName" className="label">Full Name</label>
                <input
                  id="reg-fullName" name="fullName" required
                  className="input" placeholder="John Doe"
                  value={form.fullName} onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="label">Email Address</label>
                <input
                  id="reg-email" name="email" type="email" required
                  className="input" placeholder="you@example.com"
                  value={form.email} onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="label">Password</label>
                <div className="relative">
                  <input
                    id="reg-password" name="password" type={showPass ? 'text' : 'password'} required
                    className="input pr-12" placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={form.password} onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                  >
                    {showPass ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {form.password && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map(i => {
                      const strength = [
                        form.password.length >= 8,
                        /[A-Z]/.test(form.password),
                        /[0-9]/.test(form.password),
                        /[^A-Za-z0-9]/.test(form.password),
                      ].filter(Boolean).length
                      return (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength
                              ? strength <= 1 ? 'bg-red-500' : strength <= 2 ? 'bg-yellow-500' : strength <= 3 ? 'bg-blue-500' : 'bg-primary-500'
                              : 'bg-dark-600'
                          }`}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Health info */}
          <div className="pt-2 border-t border-dark-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              Health Profile <span className="text-slate-500 font-normal">(optional)</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-age" className="label">Age</label>
                <input
                  id="reg-age" name="age" type="number" min="1" max="120"
                  className="input" placeholder="25"
                  value={form.age} onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="reg-gender" className="label">Gender</label>
                <select id="reg-gender" name="gender" className="input" value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="reg-height" className="label">Height (cm)</label>
                <input
                  id="reg-height" name="height" type="number" step="0.1" min="50" max="300"
                  className="input" placeholder="170"
                  value={form.height} onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="reg-weight" className="label">Weight (kg)</label>
                <input
                  id="reg-weight" name="weight" type="number" step="0.1" min="1" max="500"
                  className="input" placeholder="70"
                  value={form.weight} onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating your account...
              </>
            ) : 'Create Account — It\'s Free'}
          </button>

          <p className="text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
