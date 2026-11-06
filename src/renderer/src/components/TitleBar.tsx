import React from 'react'
import { Minus, Square, X } from 'lucide-react'

export const TitleBar: React.FC = () => {
  return (
    <header className="h-[var(--size-titlebar-height)] bg-theme-header flex items-center justify-between px-3 select-none drag-region border-b border-theme-border-subtle z-50">
      <div className="flex items-center gap-2">
        <div className="w-[var(--size-badge-sm)] h-[var(--size-badge-sm)] rounded-xs bg-theme-primary flex items-center justify-center font-bold text-2xs text-white shadow-sm">
          SD
        </div>
        <span className="text-sm font-semibold tracking-wider text-theme-text-main uppercase flex items-center gap-1.5">
          SpikeDrop <span className="text-theme-text-dim font-normal">| Audio Switcher</span>
        </span>
      </div>

      <div className="flex items-center gap-1 no-drag">
        <button
          type="button"
          onClick={() => window.api.minimizeWindow()}
          className="w-[var(--size-btn-icon)] h-[var(--size-btn-icon)] flex items-center justify-center rounded-xs hover:bg-theme-surface-elevated text-theme-text-muted hover:text-white transition-colors"
          title="Minimize"
          aria-label="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => window.api.maximizeWindow()}
          className="w-[var(--size-btn-icon)] h-[var(--size-btn-icon)] flex items-center justify-center rounded-xs hover:bg-theme-surface-elevated text-theme-text-muted hover:text-white transition-colors"
          title="Maximize"
          aria-label="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => window.api.closeWindow()}
          className="w-[var(--size-btn-icon)] h-[var(--size-btn-icon)] flex items-center justify-center rounded-xs hover:bg-theme-primary text-theme-text-muted hover:text-white transition-colors"
          title="Close (Hide to Tray)"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  )
}
