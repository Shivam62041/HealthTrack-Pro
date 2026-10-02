import { useState, useEffect } from 'react'
import { userApi } from '../api/userApi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  UserIcon,
  ShieldCheckIcon,
  CalculatorIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const BMI_STYLES = {
  Underweight: { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', bar: 'bg-blue-400' },
  Normal:      { badge: 'bg-primary-500/20 text-primary-400 border-primary-500/30', bar: 'bg-primary-400' },
  Overweight:  { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', bar: 'bg-yellow-400' },
  Obese:       { badge: 'bg-red-500/20 text-red-400 border-red-500/30', bar: 'bg-red-400' },
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({
    fullName: '', age: '', gender: '', height: '', weight: ''
  })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [bmiHistory, setBmiHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [bmiLoading, setBmiLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [p, bmi] = await Promise.all([
          userApi.getProfile(),
          userApi.getBmiHistory()
        ])
        setProfile(p)
        setForm({
          fullName: p.fullName || '',
          age: p.age ?? '',
          gender: p.gender ?? '',
          height: p.height ?? '',
          weight: p.weight ?? ''
        })
        setBmiHistory(bmi)
      } catch {
        toast.error('Failed to load profile')
      }
    }
    load()
  }, [])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updated = await userApi.updateProfile({
        fullName: form.fullName,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender || null,
        height: form.height ? parseFloat(form.height) : null,
        weight: form.weight ? parseFloat(form.weight) : null
      })
      setProfile(updated)
      updateUser({ fullName: updated.fullName })
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwLoading(true)
    try {
      await userApi.changePassword(pwForm)
      toast.success('Password changed successfully!')
      setPwForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Password change failed')
    } finally {
      setPwLoading(false)
    }
  }

  const handleCalculateBmi = async () => {
    setBmiLoading(true)
    try {
      const bmi = await userApi.calculateBmi()
      setBmiHistory(prev => [bmi, ...prev])
      setProfile(p => ({ ...p, bmi: bmi.bmi, bmiCategory: bmi.category }))
      toast.success(`BMI calculated: ${bmi.bmi} — ${bmi.category}`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Set height & weight in your profile first')
    } finally {
      setBmiLoading(false)
    }
  }

  const latest = bmiHistory[0]
  const bmiStyles = BMI_STYLES[latest?.category] || BMI_STYLES.Normal

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-slate-400 mt-1">Manage your personal information and security</p>
      </div>

      {/* BMI Card */}
      <div className="card-hover">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-dark-700 rounded-2xl flex flex-col items-center justify-center border border-dark-600">
              <span className="text-xl font-bold text-white leading-none">
                {latest ? latest.bmi : '—'}
              </span>
              <span className="text-xs text-slate-500 mt-0.5">BMI</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Body Mass Index</p>
              {latest ? (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${bmiStyles.badge}`}>
                  {latest.category}
                </span>
              ) : (
                <p className="text-slate-500 text-sm mt-1">Not calculated yet</p>
              )}
            </div>
          </div>
          <button
            id="calculate-bmi-btn"
            onClick={handleCalculateBmi}
            disabled={bmiLoading}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <CalculatorIcon className="h-4 w-4" />
            {bmiLoading ? 'Calculating...' : latest ? 'Recalculate' : 'Calculate BMI'}
          </button>
        </div>

        {/* BMI Scale Bar */}
        {latest && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-400 flex-1" />
              <div className="h-full bg-primary-400 flex-1" />
              <div className="h-full bg-yellow-400 flex-1" />
              <div className="h-full bg-red-400 flex-1" />
            </div>
            <div
              className="flex justify-start mt-1"
              style={{ marginLeft: `${Math.min(Math.max(((latest.bmi - 10) / 30) * 100, 0), 98)}%` }}
            >
              <div className="w-2 h-2 bg-white rounded-full -mt-3.5 border-2 border-dark-800" />
            </div>
          </div>
        )}
      </div>

      {/* Personal Info Form */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 bg-primary-500/10 rounded-xl flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Personal Information</h2>
            <p className="text-slate-500 text-sm">Update your physical details</p>
          </div>
        </div>

        <form id="profile-form" onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="fullName" className="label">Full Name</label>
            <input
              id="fullName"
              className="input"
              required
              value={form.fullName}
              onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="age" className="label">Age</label>
            <input
              id="age"
              type="number"
              min="1"
              max="120"
              className="input"
              placeholder="25"
              value={form.age}
              onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="gender" className="label">Gender</label>
            <select
              id="gender"
              className="input"
              value={form.gender}
              onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="height" className="label">Height (cm)</label>
            <input
              id="height"
              type="number"
              step="0.1"
              min="50"
              max="300"
              className="input"
              placeholder="170"
              value={form.height}
              onChange={e => setForm(p => ({ ...p, height: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="weight" className="label">Weight (kg)</label>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="20"
              max="500"
              className="input"
              placeholder="70"
              value={form.weight}
              onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <button
              id="update-profile-btn"
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
            {profile && (
              <p className="text-slate-500 text-xs">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 bg-primary-500/10 rounded-xl flex items-center justify-center">
            <ShieldCheckIcon className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Change Password</h2>
            <p className="text-slate-500 text-sm">Keep your account secure</p>
          </div>
        </div>

        <form id="change-password-form" onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="current-password" className="label">Current Password</label>
            <input
              id="current-password"
              type="password"
              required
              className="input"
              placeholder="••••••••"
              value={pwForm.currentPassword}
              onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="new-password" className="label">New Password</label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              className="input"
              placeholder="Min 8 characters, 1 uppercase"
              value={pwForm.newPassword}
              onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
            />
          </div>
          <button
            id="change-password-btn"
            type="submit"
            disabled={pwLoading}
            className="btn-primary"
          >
            {pwLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* BMI History */}
      {bmiHistory.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="h-5 w-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-white">BMI History</h2>
          </div>
          <div className="space-y-3">
            {bmiHistory.slice(0, 6).map((b, idx) => {
              const s = BMI_STYLES[b.category] || BMI_STYLES.Normal
              return (
                <div
                  key={b.id || idx}
                  className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.badge}`}>
                      {b.category}
                    </span>
                    <span className="text-slate-400 text-sm">{b.calculatedDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">{b.bmi}</span>
                    <span className="text-slate-500 text-xs ml-1">
                      {b.weight}kg · {b.height}cm
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
