import { useEffect, useState } from 'react'
import { metricsApi } from '../api/metricsApi'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import {
  PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon,
  FunnelIcon, BoltIcon, FireIcon, BeakerIcon, MoonIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'
import { format, subDays, parseISO } from 'date-fns'

const EMPTY_FORM = {
  date: format(new Date(), 'yyyy-MM-dd'),
  steps: '', caloriesBurned: '', waterIntake: '', sleepHours: '',
  heartRate: '', systolicBP: '', diastolicBP: '',
  notes: ''
}

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

export default function MetricsPage() {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 29), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  })
  const [activeChart, setActiveChart] = useState('steps')

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const data = await metricsApi.getAll(dateRange.start, dateRange.end)
      setMetrics(data)
    } catch {
      toast.error('Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMetrics() }, [dateRange])

  const openAdd = () => {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (m) => {
    setEditItem(m)
    setForm({
      date: m.date,
      steps: m.steps ?? '',
      caloriesBurned: m.caloriesBurned ?? '',
      waterIntake: m.waterIntake ?? '',
      sleepHours: m.sleepHours ?? '',
      heartRate: m.heartRate ?? '',
      systolicBP: m.systolicBP ?? '',
      diastolicBP: m.diastolicBP ?? '',
      notes: m.notes ?? ''
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        date: form.date,
        steps: form.steps ? parseInt(form.steps) : undefined,
        caloriesBurned: form.caloriesBurned ? parseFloat(form.caloriesBurned) : undefined,
        waterIntake: form.waterIntake ? parseFloat(form.waterIntake) : undefined,
        sleepHours: form.sleepHours ? parseFloat(form.sleepHours) : undefined,
        heartRate: form.heartRate ? parseInt(form.heartRate) : undefined,
        systolicBP: form.systolicBP ? parseInt(form.systolicBP) : undefined,
        diastolicBP: form.diastolicBP ? parseInt(form.diastolicBP) : undefined,
        notes: form.notes || undefined,
      }
      if (editItem) {
        await metricsApi.update(editItem.id, payload)
        toast.success('Metrics updated!')
      } else {
        await metricsApi.create(payload)
        toast.success('Metrics logged!')
      }
      setModalOpen(false)
      fetchMetrics()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save metrics')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await metricsApi.delete(id)
      toast.success('Entry deleted')
      setDeleteId(null)
      fetchMetrics()
    } catch {
      toast.error('Failed to delete entry')
    }
  }

  const chartData = [...metrics].reverse().map(m => ({
    date: format(parseISO(m.date), 'MMM d'),
    Steps: m.steps || 0,
    Calories: Math.round(m.caloriesBurned || 0),
    Water: +(m.waterIntake || 0).toFixed(1),
    Sleep: +(m.sleepHours || 0).toFixed(1),
    'Heart Rate': m.heartRate || 0,
  }))

  const filtered = metrics.filter(m =>
    !search || m.date.includes(search) || (m.notes || '').toLowerCase().includes(search.toLowerCase())
  )

  const chartOptions = [
    { key: 'steps', label: 'Steps', color: '#22c55e', dataKey: 'Steps' },
    { key: 'calories', label: 'Calories', color: '#f97316', dataKey: 'Calories' },
    { key: 'water', label: 'Water', color: '#3b82f6', dataKey: 'Water' },
    { key: 'sleep', label: 'Sleep', color: '#a855f7', dataKey: 'Sleep' },
    { key: 'heartRate', label: 'Heart Rate', color: '#ef4444', dataKey: 'Heart Rate' },
  ]

  const selectedChart = chartOptions.find(c => c.key === activeChart) || chartOptions[0]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Health Metrics</h1>
          <p className="text-slate-400 text-sm mt-1">Log and track your daily health data</p>
        </div>
        <button id="add-metric-btn" onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Log Metrics
        </button>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h2 className="text-base font-semibold text-white">Trend Analysis</h2>
          <div className="flex gap-2 flex-wrap">
            {chartOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setActiveChart(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeChart === opt.key
                    ? 'text-white shadow-md'
                    : 'bg-dark-700 text-slate-400 hover:text-white'
                }`}
                style={activeChart === opt.key ? { background: opt.color } : {}}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedChart.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={selectedChart.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={selectedChart.dataKey}
                stroke={selectedChart.color}
                strokeWidth={2.5}
                fill="url(#chartGrad)"
                dot={{ fill: selectedChart.color, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#0f172a', stroke: selectedChart.color, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-60 flex items-center justify-center text-slate-500 text-sm">
            No data available. Start logging your metrics!
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by date or notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10 text-sm"
          />
        </div>
        <div className="flex gap-2 items-center">
          <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="date"
            value={dateRange.start}
            onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))}
            className="input text-sm w-auto"
          />
          <span className="text-slate-500 text-sm">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))}
            className="input text-sm w-auto"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left text-slate-400 font-medium px-6 py-4">Date</th>
                <th className="text-right text-slate-400 font-medium px-4 py-4">
                  <span className="flex items-center justify-end gap-1"><BoltIcon className="h-3.5 w-3.5 text-primary-400" /> Steps</span>
                </th>
                <th className="text-right text-slate-400 font-medium px-4 py-4">
                  <span className="flex items-center justify-end gap-1"><FireIcon className="h-3.5 w-3.5 text-orange-400" /> Calories</span>
                </th>
                <th className="text-right text-slate-400 font-medium px-4 py-4">
                  <span className="flex items-center justify-end gap-1"><BeakerIcon className="h-3.5 w-3.5 text-blue-400" /> Water (L)</span>
                </th>
                <th className="text-right text-slate-400 font-medium px-4 py-4">
                  <span className="flex items-center justify-end gap-1"><MoonIcon className="h-3.5 w-3.5 text-purple-400" /> Sleep (h)</span>
                </th>
                <th className="text-right text-slate-400 font-medium px-4 py-4">HR (bpm)</th>
                <th className="text-right text-slate-400 font-medium px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-dark-700 rounded w-16 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <BoltIcon className="h-10 w-10 opacity-20 mx-auto mb-2" />
                    No metrics found. Log your first entry!
                  </td>
                </tr>
              ) : (
                filtered.map(m => (
                  <tr key={m.id} className="hover:bg-dark-700/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-white">
                      {format(parseISO(m.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-semibold ${m.steps >= 10000 ? 'text-primary-400' : 'text-white'}`}>
                        {m.steps?.toLocaleString() ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-white">{m.caloriesBurned ? Math.round(m.caloriesBurned).toLocaleString() : '—'}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-semibold ${m.waterIntake >= 2.5 ? 'text-blue-400' : 'text-white'}`}>
                        {m.waterIntake?.toFixed(1) ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-semibold ${m.sleepHours >= 7 ? 'text-purple-400' : 'text-white'}`}>
                        {m.sleepHours?.toFixed(1) ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-white">{m.heartRate ?? '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          id={`edit-metric-${m.id}`}
                          onClick={() => openEdit(m)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-600 transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          id={`delete-metric-${m.id}`}
                          onClick={() => setDeleteId(m.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Health Metrics' : 'Log Health Metrics'}
        size="lg"
      >
        <form id="metric-form" onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              required
              value={form.date}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1.5">
                <BoltIcon className="h-3.5 w-3.5 text-primary-400" /> Steps
              </label>
              <input type="number" min="0" placeholder="e.g. 8500"
                value={form.steps} onChange={e => setForm(p => ({ ...p, steps: e.target.value }))}
                className="input" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <FireIcon className="h-3.5 w-3.5 text-orange-400" /> Calories Burned
              </label>
              <input type="number" min="0" step="0.1" placeholder="e.g. 450"
                value={form.caloriesBurned} onChange={e => setForm(p => ({ ...p, caloriesBurned: e.target.value }))}
                className="input" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <BeakerIcon className="h-3.5 w-3.5 text-blue-400" /> Water Intake (L)
              </label>
              <input type="number" min="0" step="0.1" placeholder="e.g. 2.5"
                value={form.waterIntake} onChange={e => setForm(p => ({ ...p, waterIntake: e.target.value }))}
                className="input" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <MoonIcon className="h-3.5 w-3.5 text-purple-400" /> Sleep Hours
              </label>
              <input type="number" min="0" max="24" step="0.5" placeholder="e.g. 8"
                value={form.sleepHours} onChange={e => setForm(p => ({ ...p, sleepHours: e.target.value }))}
                className="input" />
            </div>
            <div>
              <label className="label">Heart Rate (bpm)</label>
              <input type="number" min="30" max="250" placeholder="e.g. 72"
                value={form.heartRate} onChange={e => setForm(p => ({ ...p, heartRate: e.target.value }))}
                className="input" />
            </div>
            <div>
              <label className="label">Blood Pressure (sys/dia)</label>
              <div className="flex gap-2">
                <input type="number" min="50" max="300" placeholder="Sys"
                  value={form.systolicBP} onChange={e => setForm(p => ({ ...p, systolicBP: e.target.value }))}
                  className="input" />
                <input type="number" min="30" max="200" placeholder="Dia"
                  value={form.diastolicBP} onChange={e => setForm(p => ({ ...p, diastolicBP: e.target.value }))}
                  className="input" />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              rows={3}
              placeholder="How are you feeling today?"
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="input resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button id="save-metric-btn" type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? (
                <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : editItem ? 'Save Changes' : 'Log Metrics'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Entry" size="sm">
        <div className="space-y-5">
          <p className="text-slate-400">Are you sure you want to delete this metric entry? This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button
              id="confirm-delete-btn"
              onClick={() => handleDelete(deleteId)}
              className="btn-danger flex-1 bg-red-500 hover:bg-red-600 text-white border-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
