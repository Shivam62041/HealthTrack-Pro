import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { HeartIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { authApi } from '../api/authApi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
    } catch {
      // Silently ignore to prevent email enumeration
    } finally {
      setLoading(false)
      setSubmitted(true)
      toast.success('Reset instructions sent if email exists!')
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="fixed top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/30">
              <HeartIcon className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Reset Password</h1>
              <p className="text-slate-400 mt-2 max-w-sm mx-auto">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form id="forgot-password-form" onSubmit={handleSubmit} className="card space-y-5">
              <div>
                <label htmlFor="forgot-email" className="label">Email Address</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-11"
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                id="forgot-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : 'Send Reset Link'}
              </button>

              <Link
                to="/login"
                className="block text-center text-slate-400 hover:text-white text-sm transition-colors py-1"
              >
                ← Back to Sign In
              </Link>
            </form>
          </>
        ) : (
          <div className="card text-center space-y-5">
            <div className="h-20 w-20 bg-primary-500/15 rounded-3xl flex items-center justify-center mx-auto border border-primary-500/30">
              <CheckCircleIcon className="h-10 w-10 text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Check your email</h2>
              <p className="text-slate-400 mt-2">
                We've sent a password reset link to{' '}
                <span className="text-white font-semibold">{email}</span>
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Don't see it? Check your spam folder.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setSubmitted(false)}
                className="btn-secondary w-full text-sm"
              >
                Try a different email
              </button>
              <Link to="/login" className="block">
                <button className="btn-primary w-full">Back to Sign In</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
