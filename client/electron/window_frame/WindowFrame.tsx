import { useEffect, useState } from 'react'
import './WindowFrame.css'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [ready, setReady] = useState(false)

  // Wait for electronAPI to be ready
  useEffect(() => {
    if (window.electronAPI) setReady(true)
  }, [])

  // Listen for maximize/unmaximize events
  useEffect(() => {
    if (!ready || !window.electronAPI?.on || !window.electronAPI?.off) return

    const handleMaximized = (maximized: boolean) => setIsMaximized(maximized)
    window.electronAPI.on('window:maximized', handleMaximized)
    return () => window.electronAPI.off('window:maximized', handleMaximized)
  }, [ready])

  // Button handlers
  const handleMinimize = () => window.electronAPI?.minimize?.()
  const handleMaximize = () => window.electronAPI?.maximize?.()
  const handleClose = () => window.electronAPI?.close?.()

  return (
    <div className="title-bar">
      {/* App icon */}
      <div className="title-bar-icon">
        <img style={{marginTop: -5 }} src='/icon.png' width="20" height="20" />
      </div>

      {/* Centered title */}
      <div className="title">eCommerce Shop 1.44.2</div>

      {/* Window control buttons */}
      <div className="window-controls">
        <button
          className="control-btn minimize"
          onClick={handleMinimize}
          disabled={!ready}
          aria-label="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1">
            <rect width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          className="control-btn maximize"
          onClick={handleMaximize}
          disabled={!ready}
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M2.5 2.5h5v5h-5z" stroke="currentColor" fill="none" strokeWidth="1" />
              <path d="M2.5 0.5h7v7" stroke="currentColor" fill="none" strokeWidth="1" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" fill="none" strokeWidth="1" />
            </svg>
          )}
        </button>
        <button
          className="control-btn close"
          onClick={handleClose}
          disabled={!ready}
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M0 0L10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
    </div>
  )
}