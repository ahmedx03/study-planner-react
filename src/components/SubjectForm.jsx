import { useState } from 'react'
import { todayISO } from '../utils/dates'

export default function SubjectForm({ subjects, onAdd }) {
  const [name,     setName]     = useState('')
  const [hours,    setHours]    = useState('')
  const [diff,     setDiff]     = useState('2')
  const [examDate, setExamDate] = useState('')
  const [error,    setError]    = useState('')

  function handleSubmit() {
    const trimmed = name.trim()
    const h = parseInt(hours) || 0

    if (!trimmed)              return setError('Please enter a subject name.')
    if (trimmed.length < 2)    return setError('Name must be at least 2 characters.')
    if (h < 1 || h > 20)       return setError('Hours must be between 1 and 20.')
    if (isDuplicate(trimmed))  return setError(`"${trimmed}" is already in your list.`)
    if (examDate) {
      const d = new Date(examDate)
      const today = new Date(); today.setHours(0,0,0,0)
      if (d < today) return setError('Exam date cannot be in the past.')
    }

    onAdd(trimmed, h, parseInt(diff), examDate || null)
    setName(''); setHours(''); setDiff('2'); setExamDate(''); setError('')
  }

  function isDuplicate(val) {
    return subjects.some(s => s.name.toLowerCase() === val.toLowerCase())
  }

  return (
    <>
      <h2 className="panel-title">Add Subject</h2>

      <div className="form-group">
        <label htmlFor="subject-name">Subject Name</label>
        <input
          id="subject-name"
          type="text"
          placeholder="e.g. Mathematics"
          maxLength={40}
          autoComplete="off"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="study-hours">Hours / Week</label>
          <input
            id="study-hours"
            type="number"
            placeholder="e.g. 4"
            min="1" max="20"
            value={hours}
            onChange={e => setHours(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            value={diff}
            onChange={e => setDiff(e.target.value)}
          >
            <option value="1">🟢 Easy</option>
            <option value="2">🟡 Medium</option>
            <option value="3">🔴 Hard</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="exam-date">
          Exam Date <span className="label-optional">(optional)</span>
        </label>
        <input
          id="exam-date"
          type="date"
          min={todayISO()}
          value={examDate}
          onChange={e => setExamDate(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" onClick={handleSubmit}>
        + Add Subject
      </button>

      {error && (
        <p className="error-msg" role="alert">{error}</p>
      )}
    </>
  )
}
