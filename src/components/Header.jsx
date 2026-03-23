export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">StudyFlow</span>
        </div>
        <p className="tagline">Plan smart. Study better.</p>
      </div>
      <div className="header-right">
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title="Toggle dark/light mode"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  )
}
