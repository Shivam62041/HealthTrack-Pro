import { useState } from 'react'
import { reportsApi } from '../api/reportsApi'
import toast from 'react-hot-toast'
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  UserIcon,
  FlagIcon,
  CalculatorIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const REPORT_FEATURES = [
  {
    icon: UserIcon,
    title: 'Personal Information',
    desc: 'Your profile — name, age, height, weight'
  },
  {
    icon: ChartBarIcon,
    title: 'Health Metrics',
    desc: 'Complete daily measurements record'
  },
  {
    icon: FlagIcon,
    title: 'Goal Progress',
    desc: 'All goals with completion percentages'
  },
  {
    icon: CalculatorIcon,
    title: 'BMI History',
    desc: 'Historical BMI calculations and categories'
  }
]

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const downloadPdf = async () => {
    setLoading(true)
    try {
      const blob = await reportsApi.downloadPdf()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `healthtrack-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Report downloaded successfully!')
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 4000)
    } catch {
      toast.error('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Health Reports</h1>
        <p className="text-slate-400 mt-1">
          Download a comprehensive PDF summary of your health data
        </p>
      </div>

      {/* Main Report Card */}
      <div className="card">
        <div className="text-center py-8">
          {/* Icon */}
          <div className="h-20 w-20 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <DocumentArrowDownIcon className="h-10 w-10 text-primary-400" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Complete Health Report
          </h2>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto">
            A professionally formatted PDF containing all your health metrics, goals, and BMI history.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8 text-left max-w-lg mx-auto">
            {REPORT_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-dark-700 rounded-xl p-4 flex gap-3 items-start"
              >
                <div className="h-8 w-8 bg-primary-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Download Button */}
          <button
            id="download-pdf-btn"
            onClick={downloadPdf}
            disabled={loading}
            className={`flex items-center gap-3 mx-auto px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 ${
              downloaded
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'btn-primary'
            }`}
          >
            {loading ? (
              <>
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Report...
              </>
            ) : downloaded ? (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Downloaded!
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="h-5 w-5" />
                Download PDF Report
              </>
            )}
          </button>

          <p className="text-slate-500 text-xs mt-4">
            Report includes data up to today · PDF format
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
        <div className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5">ℹ️</div>
        <div>
          <p className="text-blue-300 text-sm font-medium">Report Tip</p>
          <p className="text-slate-400 text-sm mt-1">
            Make sure your profile has complete height and weight information, and that you have
            logged some health metrics to get the most detailed report.
          </p>
        </div>
      </div>
    </div>
  )
}
