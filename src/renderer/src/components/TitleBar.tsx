import React from 'react'
import { Minus, Square, X, SlidersHorizontal } from 'lucide-react'

export const TitleBar: React.FC = () => {
  return (
    <div className="h-10 bg-[#0b1219] flex items-center justify-between px-3 select-none drag-region border-b border-[#1b2733] z-50">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-valorant-red flex items-center justify-center font-bold text-xs text-white shadow-sm">
          SD
        </div>
        <span className="text-xs font-semibold tracking-wider text-valorant-text uppercase flex items-center gap-1.5">
          SpikeDrop <span className="text-gray-500 font-normal">| Audio Switcher</span>
        </span>
      </div>

      <div className="flex items-center gap-1 no-drag">
        <button
          onClick={() => window.api.minimizeWindow()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1b2733] text-gray-400 hover:text-white transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => window.api.maximizeWindow()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1b2733] text-gray-400 hover:text-white transition-colors"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={() => window.api.closeWindow()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-valorant-red text-gray-400 hover:text-white transition-colors"
          title="Close (Hide to Tray)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

