import { useState, useEffect } from 'react'

export default function Toast({ msg, toastKey }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!msg) return
    setVisible(true)
    const id = setTimeout(() => setVisible(false), 2600)
    return () => clearTimeout(id)
  }, [toastKey]) // re-trigger on every new toast even if same message

  return (
    <div
      className={`toast${visible ? ' show' : ''}`}
      aria-live="assertive"
      role="status"
    >
      {msg}
    </div>
  )
}
