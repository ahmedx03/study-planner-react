import { daysUntilExam, getUrgency, formatDate, isExamDone } from '../utils/dates'
import { DIFF_MULT } from '../utils/scheduling'

export default function SubjectList({
  subjects, onRemove, onRemoveDone, onClearAll, onGenerate, activeCount,
}) {
  const doneCount = subjects.filter(isExamDone).length

  return (
    <>
      <div className="subject-list-header">
        <h3>
          Your Subjects{' '}
          <span className="badge">{subjects.length}</span>
        </h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          {doneCount > 0 && (
            <button
              className="btn-ghost btn-ghost--danger"
              onClick={onRemoveDone}
            >
              Remove done ({doneCount})
            </button>
          )}
          <button className="btn-ghost" onClick={onClearAll}>
            Clear all
          </button>
        </div>
      </div>

      {activeCount > 10 && (
        <div className="overload-warning">
          ⚠️ Over 10 subjects — timetable may feel crowded.
        </div>
      )}

      <ul className="subject-list" aria-label="Subject list">
        {subjects.length === 0 ? (
          <li className="empty-state" id="empty-state">
            <span className="empty-icon">📚</span>
            <p>No subjects yet.<br />Add one above to get started.</p>
          </li>
        ) : (
          subjects.map(s => (
            <SubjectItem
              key={s.id}
              subject={s}
              onRemove={onRemove}
            />
          ))
        )}
      </ul>

      <button
        className="btn btn-accent"
        disabled={activeCount === 0}
        onClick={() => onGenerate()}
      >
        Generate Timetable →
      </button>
    </>
  )
}

function SubjectItem({ subject: s, onRemove }) {
  const done = isExamDone(s)

  if (done) {
    return (
      <li className="subject-item done">
        <span className="subject-dot" style={{ background: s.color, opacity: 0.4 }} />
        <div className="subject-info">
          <div className="subject-name">{s.name}</div>
          <div className="subject-meta">Exam was {formatDate(s.examDate)}</div>
          <div className="subject-tags">
            <span className="tag tag-done">✓ Done</span>
          </div>
        </div>
        <button
          className="delete-btn"
          onClick={() => onRemove(s.id)}
          aria-label={`Remove ${s.name}`}
        >×</button>
      </li>
    )
  }

  const diffLabel = s.difficulty === 3 ? 'Hard' : s.difficulty === 2 ? 'Medium' : 'Easy'
  const mult      = DIFF_MULT[s.difficulty] || 1
  const d         = s.examDate ? daysUntilExam(s.examDate) : null
  const urgency   = getUrgency(d)

  const examLabel = d === 0 ? 'Exam today!'
                  : d === 1 ? 'Exam tomorrow'
                  : d > 0   ? `Exam in ${d}d`
                  : null

  return (
    <li className={`subject-item${urgency !== 'none' ? ` urgency-${urgency}` : ''}`}>
      <span className="subject-dot" style={{ background: s.color }} />
      <div className="subject-info">
        <div className="subject-name">{s.name}</div>
        <div className="subject-meta">
          {s.hours}h/wk{s.examDate ? ` · ${formatDate(s.examDate)}` : ''}
        </div>
        <div className="subject-tags">
          <span className={`tag tag-${diffLabel.toLowerCase()}`}>{diffLabel}</span>
          {mult > 1 && (
            <span className="tag tag-freq" title={`Studied ${mult}× more than Easy`}>
              {mult}× sessions
            </span>
          )}
          {examLabel && urgency !== 'none' && (
            <span className={`tag tag-exam tag-exam--${urgency}`}>{examLabel}</span>
          )}
        </div>
      </div>
      <button
        className="delete-btn"
        onClick={() => onRemove(s.id)}
        aria-label={`Remove ${s.name}`}
      >×</button>
    </li>
  )
}
