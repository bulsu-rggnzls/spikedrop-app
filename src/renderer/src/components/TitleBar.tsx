import { memo } from 'react'
import { Minus, Square, X } from 'lucide-react'

export interface TitleBarProps {
  appName?: string
  subtitle?: string
}

export const TitleBar = memo(function TitleBar({
  appName = 'SpikeDrop',
  subtitle = 'Audio Switcher'
}: TitleBarProps) {
  return (
    <header className="h-[var(--size-titlebar-height)] bg-theme-header flex items-center justify-between px-3 select-none drag-region border-b border-theme-border-subtle z-50">
      <div className="flex items-center gap-2">
        <div
          className="w-[var(--size-badge-sm)] h-[var(--size-badge-sm)] rounded-xs bg-theme-primary flex items-center justify-center font-bold text-2xs text-white shadow-sm"
          aria-hidden="true"
        >
          SD
        </div>
        <span className="text-sm font-semibold tracking-wider text-theme-text-main uppercase flex items-center gap-1.5">
          {appName} <span className="text-theme-text-dim font-normal">| {subtitle}</span>
        </span>
      </div>

      <nav aria-label="Window controls" className="flex items-center gap-1 no-drag">
        <button
          type="button"
          onClick={() => window.api.minimizeWindow()}
          className="w-[var(--size-btn-icon)] h-[var(--size-btn-icon)] flex items-center justify-center rounded-xs hover:bg-theme-surface-elevated text-theme-text-muted hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-primary"
          title="Minimize window"
          aria-label="Minimize window"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => window.api.maximizeWindow()}
          className="w-[var(--size-btn-icon)] h-[var(--size-btn-icon)] flex items-center justify-center rounded-xs hover:bg-theme-surface-elevated text-theme-text-muted hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-primary"
          title="Maximize window"
          aria-label="Maximize window"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => window.api.closeWindow()}
          className="w-[var(--size-btn-icon)] h-[var(--size-btn-icon)] flex items-center justify-center rounded-xs hover:bg-theme-primary text-theme-text-muted hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-primary"
          title="Hide to tray"
          aria-label="Hide to tray"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </nav>
    </header>
  )
})
