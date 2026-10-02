import { useEffect, useState } from 'react'
import { goalsApi } from '../api/goalsApi'
import Modal from '../components/Modal'
import ProgressRing from '../components/ProgressRing'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon, CheckBadgeIcon, FlagIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const GOAL_TYPES = [
  'STEPS', 'CALORIES_BURNED', 'WATER_INTAKE',
  'SLEEP_HOURS', 'WEIGHT_LOSS', 'WEIGHT_GAIN', 'HEART_RATE'
]

const GOAL_COLORS = {
  STEPS: '#22c55e',
  CALORIES_BURNED: '#f97316',
  WATER_INTAKE: '#3b82f6',
  SLEEP_HOURS: '#8b5cf6',
  WEIGHT_LOSS: '#ec4899',
  WEIGHT_GAIN: '#14b8a6',
  HEART_RATE: '#ef4444'
}

const GOAL_UNITS = {
  STEPS: 'steps',
  CALORIES_BURNED: 'kcal',
  WATER_INTAKE: 'L',
  SLEEP_HOURS: 'hrs',
  WEIGHT_LOSS: 'kg',
  WEIGHT_GAIN: 'kg',
  HEART_RATE: 'bpm'
}

export default function GoalsPage() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [progressModal, setProgressModal] = useState(null)
  const [form, setForm] = useState({
    goalType: 'STEPS',
    targetValue: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    description: ''
  })
  const [progressValue, setProgressValue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const data = await goalsApi.getAll()
      setGoals(data)
    } catch {
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await goalsApi.create({ ...form, targetValue: parseFloat(form.targetValue) })
      toast.success('Goal created successfully!')
      setModalOpen(false)
      setForm({ goalType: 'STEPS', targetValue: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '', description: '' })
      await load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create goal')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return
    try {
      await goalsApi.delete(id)
      toast.success('Goal deleted')
      await load()
    } catch {
      toast.error('Failed to delete goal')
    }
  }

  const handleProgressSave = async () => {
    if (!progressValue) return
    try {
      await goalsApi.updateProgress(progressModal.id, parseFloat(progressValue))
      toast.success('Progress updated!')
      setProgressModal(null)
      await load()
    } catch {
      toast.error('Failed to update progress')
    }
  }

  const active = goals.filter(g => !g.isAchieved)
  const achieved = goals.filter(g => g.isAchieved)

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Health Goals</h1>
          <p className="text-slate-400 mt-1">
            {active.length} active · {achieved.length} achieved
          </p>
        </div>
        <button
          id="add-goal-btn"
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" /> New Goal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="card text-center py-16">
          <FlagIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-medium">No goals set yet</p>
          <p className="text-slate-500 text-sm mt-1">Start by creating your first health goal</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary mt-6">
            Create First Goal
          </button>
        </div>
      ) : (
        <>
          {/* Active Goals */}
          {active.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">🎯 Active Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map(goal => (
                  <div key={goal.id} className="card-hover relative group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="font-semibold text-white">
                          {goal.goalType.replace(/_/g, ' ')}
                        </p>
                        {goal.description && (
                          <p className="text-slate-400 text-sm mt-0.5 line-clamp-1">
                            {goal.description}
                          </p>
                        )}
                      </div>
                      <button
                        id={`delete-goal-${goal.id}`}
                        onClick={() => handleDelete(goal.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1 ml-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <ProgressRing
                        percentage={goal.progressPercentage}
                        size={76}
                        strokeWidth={7}
                        color={GOAL_COLORS[goal.goalType] || '#22c55e'}
                      />
                      <div>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                          Progress
                        </p>
                        <p className="text-white font-bold text-lg">
                          {goal.currentProgress}
                          <span className="text-slate-400 text-sm font-normal">
                            {' '}/ {goal.targetValue} {GOAL_UNITS[goal.goalType]}
                          </span>
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {goal.startDate && format(new Date(goal.startDate), 'MMM d')} –{' '}
                          {goal.endDate && format(new Date(goal.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <button
                      id={`update-progress-${goal.id}`}
                      onClick={() => {
                        setProgressModal(goal)
                        setProgressValue(goal.currentProgress.toString())
                      }}
                      className="w-full btn-secondary text-sm py-2"
                    >
                      Update Progress
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achieved Goals */}
          {achieved.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">✅ Achieved Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achieved.map(goal => (
                  <div
                    key={goal.id}
                    className="card border-primary-500/30 bg-gradient-to-br from-primary-500/5 to-emerald-500/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                        <CheckBadgeIcon className="h-6 w-6 text-primary-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {goal.goalType.replace(/_/g, ' ')}
                        </p>
                        <p className="text-primary-400 text-sm">
                          100% Complete — {goal.targetValue} {GOAL_UNITS[goal.goalType]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Goal Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Goal">
        <form id="goal-form" onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Goal Type</label>
            <select name="goalType" className="input" value={form.goalType} onChange={handleChange}>
              {GOAL_TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">
              Target Value ({GOAL_UNITS[form.goalType]})
            </label>
            <input
              name="targetValue"
              type="number"
              step="0.1"
              min="0"
              required
              className="input"
              placeholder={form.goalType === 'STEPS' ? '10000' : '3.0'}
              value={form.targetValue}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                name="startDate"
                type="date"
                required
                className="input"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                name="endDate"
                type="date"
                required
                className="input"
                value={form.endDate}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <input
              name="description"
              className="input"
              placeholder="What's your goal about?"
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              id="create-goal-submit"
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? 'Creating...' : 'Create Goal'}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Progress Modal */}
      <Modal
        open={!!progressModal}
        onClose={() => setProgressModal(null)}
        title="Update Progress"
        size="sm"
      >
        {progressModal && (
          <div className="space-y-4">
            <div className="bg-dark-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Goal</p>
              <p className="text-white font-semibold">{progressModal.goalType.replace(/_/g, ' ')}</p>
              <p className="text-slate-400 text-sm mt-1">
                Target: <span className="text-white font-medium">
                  {progressModal.targetValue} {GOAL_UNITS[progressModal.goalType]}
                </span>
              </p>
            </div>
            <div>
              <label className="label">
                Current Progress ({GOAL_UNITS[progressModal.goalType]})
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="input"
                value={progressValue}
                onChange={e => setProgressValue(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                id="save-progress-btn"
                onClick={handleProgressSave}
                className="btn-primary flex-1"
              >
                Save Progress
              </button>
              <button
                onClick={() => setProgressModal(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
