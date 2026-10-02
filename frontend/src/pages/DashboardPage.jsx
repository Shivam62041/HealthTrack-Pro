import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { metricsApi } from '../api/metricsApi'
import { goalsApi } from '../api/goalsApi'
import StatCard from '../components/StatCard'
import ProgressRing from '../components/ProgressRing'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts'
import {
  FireIcon, BeakerIcon, MoonIcon,
  BoltIcon, FlagIcon, HeartIcon, TrophyIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { format, subDays } from 'date-fns'
import { Link } from 'react-router-dom'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-700 border border-dark-600 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const end = format(new Date(), 'yyyy-MM-dd')
        const start = format(subDays(new Date(), 13), 'yyyy-MM-dd')
        const [m, g] = await Promise.all([
          metricsApi.getAll(start, end),
          goalsApi.getAll()
        ])
        setMetrics(m)
        setGoals(g)
      } catch (e) {
        console.error('Dashboard fetch error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const today = metrics[0]
  const chartData = [...metrics].reverse().slice(-7).map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    Steps: m.steps || 0,
    Calories: Math.round(m.caloriesBurned || 0),
    Water: +(m.waterIntake || 0).toFixed(1),
    Sleep: +(m.sleepHours || 0).toFixed(1),
  }))

  const activeGoals = goals.filter(g => !g.isAchieved).slice(0, 4)
  const achievedCount = goals.filter(g => g.isAchieved).length
  const goalCompletionRate = goals.length > 0 ? (achievedCount / goals.length) * 100 : 0

  const firstName = user?.fullName?.split(' ')[0] || 'there'

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-dark-700 rounded-xl w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-dark-800 rounded-2xl border border-dark-700" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-dark-800 rounded-2xl border border-dark-700" />
          <div className="h-72 bg-dark-800 rounded-2xl border border-dark-700" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting Header */}
      <div className="animate-slide-up flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {getGreeting()},{' '}
            <span className="gradient-text">{firstName}</span>
            {' '}👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · Here's your health overview
          </p>
        </div>
        <Link to="/metrics">
          <button className="btn-secondary text-sm flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-4 w-4" />
            Log Today's Metrics
          </button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Steps Today"
          value={today?.steps?.toLocaleString() ?? '—'}
          unit="steps"
          icon={BoltIcon}
          color="primary"
          subtitle={today?.steps >= 10000 ? '🎉 Goal reached!' : 'Target: 10,000'}
        />
        <StatCard
          title="Calories Burned"
          value={today?.caloriesBurned ? Math.round(today.caloriesBurned).toLocaleString() : '—'}
          unit="kcal"
          icon={FireIcon}
          color="orange"
          subtitle="Active energy"
        />
        <StatCard
          title="Water Intake"
          value={today?.waterIntake?.toFixed(1) ?? '—'}
          unit="L"
          icon={BeakerIcon}
          color="blue"
          subtitle="Target: 2.5L/day"
        />
        <StatCard
          title="Sleep Last Night"
          value={today?.sleepHours?.toFixed(1) ?? '—'}
          unit="hrs"
          icon={MoonIcon}
          color="purple"
          subtitle="Target: 7–9 hrs"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Steps Area Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">Steps — Last 7 Days</h2>
            <span className="badge-success">Daily activity</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Steps"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fill="url(#stepsGradient)"
                  dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2, fill: '#0f172a' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-slate-500 gap-2">
              <BoltIcon className="h-10 w-10 opacity-20" />
              <p className="text-sm">No step data yet. Start logging!</p>
            </div>
          )}
        </div>

        {/* Sleep + Water line chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">Sleep & Water — Last 7 Days</h2>
            <span className="badge-info">Wellness metrics</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                  formatter={(val) => <span style={{ color: '#94a3b8' }}>{val}</span>}
                />
                <Line
                  type="monotone" dataKey="Sleep" stroke="#a855f7" strokeWidth={2.5}
                  dot={{ fill: '#a855f7', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, stroke: '#a855f7', strokeWidth: 2, fill: '#0f172a' }}
                />
                <Line
                  type="monotone" dataKey="Water" stroke="#3b82f6" strokeWidth={2.5}
                  dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#0f172a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-slate-500 gap-2">
              <MoonIcon className="h-10 w-10 opacity-20" />
              <p className="text-sm">No wellness data yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Goals + BMI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Goals */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FlagIcon className="h-5 w-5 text-primary-400" />
              Active Goals
            </h2>
            <Link to="/goals" className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium">
              View all →
            </Link>
          </div>

          {activeGoals.length > 0 ? (
            <div className="space-y-4">
              {activeGoals.map(goal => {
                const pct = Math.min((goal.currentValue / goal.targetValue) * 100, 100)
                return (
                  <div key={goal.id} className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl border border-dark-600/50">
                    <ProgressRing percentage={pct} size={52} strokeWidth={5} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{goal.goalName}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </p>
                      <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-emerald-400 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      goal.priority === 'HIGH' ? 'bg-red-500/15 text-red-400' :
                      goal.priority === 'MEDIUM' ? 'bg-yellow-500/15 text-yellow-400' :
                      'bg-slate-500/15 text-slate-400'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500 gap-3">
              <FlagIcon className="h-12 w-12 opacity-20" />
              <p className="text-sm">No active goals. Set your first goal!</p>
              <Link to="/goals">
                <button className="btn-primary text-sm px-4 py-2">Create Goal</button>
              </Link>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="card flex flex-col gap-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-yellow-400" />
            Your Progress
          </h2>

          <div className="flex flex-col items-center gap-4">
            <ProgressRing
              percentage={goalCompletionRate}
              size={120}
              strokeWidth={10}
              color="#22c55e"
              label="Goals Done"
            />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{achievedCount} / {goals.length}</p>
              <p className="text-slate-400 text-sm">Goals Achieved</p>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-dark-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Metrics logged</span>
              <span className="text-white font-semibold">{metrics.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Active goals</span>
              <span className="text-white font-semibold">{activeGoals.length}</span>
            </div>
            {today?.bmi && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">BMI</span>
                <span className="text-white font-semibold">{today.bmi.toFixed(1)}</span>
              </div>
            )}
          </div>

          <Link to="/reports" className="mt-auto">
            <button className="btn-secondary w-full text-sm flex items-center justify-center gap-2">
              <HeartIcon className="h-4 w-4" />
              View Full Report
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
