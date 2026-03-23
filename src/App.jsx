import { useState, useEffect, useCallback } from 'react'
import Header       from './components/Header'
import SubjectForm  from './components/SubjectForm'
import SubjectList  from './components/SubjectList'
import Timetable    from './components/Timetable'
import ExamBanner   from './components/ExamBanner'
import StatsBar     from './components/StatsBar'
import Toast        from './components/Toast'
import { loadSubjects, saveSubjects, loadTheme, saveTheme, loadIntensity, saveIntensity } from './utils/storage'
import { isExamDone } from './utils/dates'
import { buildSmartSchedule, COLORS } from './utils/scheduling'
import { DAYS, WEEKDAYS } from './utils/dates'

export default function App() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [subjects,    setSubjects]    = useState([])
  const [colorIndex,  setColorIndex]  = useState(0)
  const [theme,       setTheme]       = useState('dark')
  const [intensity,   setIntensity]   = useState('normal')
  const [showWeekend, setShowWeekend] = useState(true)
  const [schedule,    setSchedule]    = useState(null)
  const [toast,       setToast]       = useState({ msg: '', key: 0 })
  const [lastSaved,   setLastSaved]   = useState('')

  // ── Load from storage on mount ─────────────────────────────────────────────
  useEffect(() => {
    const { subjects: saved, colorIndex: ci } = loadSubjects()
    setSubjects(saved)
    setColorIndex(ci)

    const savedTheme = loadTheme()
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)

    const savedIntensity = loadIntensity()
    setIntensity(savedIntensity)
  }, [])

  // ── Sync theme to <html> attribute ────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // ── Save subjects whenever they change ────────────────────────────────────
  useEffect(() => {
    if (subjects.length === 0) return
    saveSubjects(subjects, colorIndex)
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setLastSaved(`Last saved ${t}`)
  }, [subjects, colorIndex])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToast(prev => ({ msg, key: prev.key + 1 }))
  }, [])

  const activeSubjects = subjects.filter(s => !isExamDone(s))

  // ── Generate timetable ─────────────────────────────────────────────────────
  const generate = useCallback((silent = false) => {
    const active = subjects.filter(s => !isExamDone(s))
    if (!active.length) {
      showToast('⚠️ All subjects are done — nothing to schedule!')
      return
    }
    const days = showWeekend ? DAYS : WEEKDAYS
    const newSchedule = buildSmartSchedule(active, days, intensity)
    setSchedule(newSchedule)
    if (!silent) showToast('📅 Timetable generated!')
  }, [subjects, showWeekend, intensity, showToast])

  // Re-generate automatically when intensity or weekend toggle changes
  useEffect(() => {
    if (schedule) generate(true)
  }, [intensity, showWeekend])

  // ── Add subject ────────────────────────────────────────────────────────────
  function addSubject(name, hours, difficulty, examDate) {
    const next = [
      ...subjects,
      {
        id: Date.now(),
        name, hours, difficulty, examDate,
        color: COLORS[colorIndex % COLORS.length],
      },
    ]
    setSubjects(next)
    setColorIndex(ci => ci + 1)
    showToast(`✅ "${name}" added`)
  }

  // ── Remove subject ─────────────────────────────────────────────────────────
  function removeSubject(id) {
    const subj = subjects.find(s => s.id === id)
    const next = subjects.filter(s => s.id !== id)
    setSubjects(next)
    if (subj) showToast(`🗑 "${subj.name}" removed`)
  }

  // ── Remove done subjects ───────────────────────────────────────────────────
  function removeDone() {
    const count = subjects.filter(isExamDone).length
    setSubjects(subjects.filter(s => !isExamDone(s)))
    showToast(`🗑 Removed ${count} completed subject${count !== 1 ? 's' : ''}`)
  }

  // ── Clear all ──────────────────────────────────────────────────────────────
  function clearAll() {
    if (!window.confirm('Clear all subjects? This cannot be undone.')) return
    setSubjects([])
    setColorIndex(0)
    setSchedule(null)
    saveSubjects([], 0)
    showToast('🗑 All subjects cleared')
  }

  // ── Theme toggle ───────────────────────────────────────────────────────────
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    saveTheme(next)
    showToast(next === 'dark' ? '🌙 Dark mode' : '☀️ Light mode')
  }

  // ── Intensity change ───────────────────────────────────────────────────────
  function changeIntensity(val) {
    setIntensity(val)
    saveIntensity(val)
  }

  // ── Weekend toggle ─────────────────────────────────────────────────────────
  function toggleWeekend() {
    setShowWeekend(prev => !prev)
    showToast(showWeekend ? '📅 Weekends hidden' : '📅 Weekends shown')
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app-wrapper">

      {/* Ambient background */}
      <div className="bg-shapes" aria-hidden="true">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="main-grid">

        {/* ── LEFT PANEL ── */}
        <section className="panel panel-input" aria-label="Add subject">
          <SubjectForm
            subjects={subjects}
            onAdd={addSubject}
          />
          <SubjectList
            subjects={subjects}
            onRemove={removeSubject}
            onRemoveDone={removeDone}
            onClearAll={clearAll}
            onGenerate={generate}
            activeCount={activeSubjects.length}
          />
        </section>

        {/* ── RIGHT PANEL ── */}
        <section className="panel panel-timetable" aria-label="Timetable">
          <div className="timetable-header">
            <h2 className="panel-title">Weekly Timetable</h2>
            {schedule && (
              <div className="timetable-actions">
                <select
                  className="intensity-select"
                  value={intensity}
                  onChange={e => changeIntensity(e.target.value)}
                  title="Study intensity"
                >
                  <option value="light">🌿 Light</option>
                  <option value="normal">⚡ Normal</option>
                  <option value="intense">🔥 Intense</option>
                </select>
                <button className="btn-ghost" onClick={() => generate()}>🔄 Regenerate</button>
                <button className="btn-ghost" onClick={toggleWeekend}>
                  {showWeekend ? 'Hide Weekends' : 'Show Weekends'}
                </button>
                <button className="btn-ghost" onClick={() => window.print()}>🖨 Export</button>
              </div>
            )}
          </div>

          {schedule && (
            <ExamBanner subjects={subjects} />
          )}

          {!schedule ? (
            <div className="timetable-placeholder">
              <div className="placeholder-icon">🗓️</div>
              <p>
                Your smart timetable will appear here.<br />
                Add subjects and click <strong>Generate Timetable</strong>.
              </p>
            </div>
          ) : (
            <>
              <Timetable
                schedule={schedule}
                showWeekend={showWeekend}
              />
              <StatsBar
                schedule={schedule}
                subjects={subjects}
                activeSubjects={activeSubjects}
              />
            </>
          )}
        </section>

      </main>

      <footer className="app-footer">
        <span>StudyFlow · React + Vite · localStorage</span>
        <span className="last-saved">{lastSaved}</span>
      </footer>

      <Toast msg={toast.msg} toastKey={toast.key} />

    </div>
  )
}
