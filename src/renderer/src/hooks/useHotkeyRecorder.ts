import { useState, useEffect, useCallback, useRef } from 'react'

export interface UseHotkeyRecorderOptions {
  currentHotkey: string
  onSave: (hotkey: string) => Promise<boolean>
  successDurationMs?: number
}

export interface UseHotkeyRecorderReturn {
  isRecording: boolean
  saveSuccess: boolean
  errorMessage: string | null
  startRecording: () => void
  cancelRecording: () => void
  applyHotkey: (hotkey: string) => Promise<void>
}

/**
 * Headless hook managing global hotkey recording and keyboard event normalization.
 */
export function useHotkeyRecorder({
  currentHotkey,
  onSave,
  successDurationMs = 2000
}: UseHotkeyRecorderOptions): UseHotkeyRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const successTimeoutRef = useRef<number | null>(null)

  const clearSuccessTimeout = () => {
    if (successTimeoutRef.current !== null) {
      window.clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = null
    }
  }

  useEffect(() => {
    return () => clearSuccessTimeout()
  }, [])

  const applyHotkey = useCallback(
    async (keyCombination: string) => {
      setErrorMessage(null)
      clearSuccessTimeout()

      const success = await onSave(keyCombination)
      if (success) {
        setSaveSuccess(true)
        successTimeoutRef.current = window.setTimeout(() => {
          setSaveSuccess(false)
          successTimeoutRef.current = null
        }, successDurationMs)
      } else {
        setErrorMessage(
          `Failed to register ${keyCombination}. It may be reserved by Windows or another active application.`
        )
      }
    },
    [onSave, successDurationMs]
  )

  const startRecording = useCallback(() => {
    setErrorMessage(null)
    setIsRecording(true)
  }, [])

  const cancelRecording = useCallback(() => {
    setIsRecording(false)
  }, [])

  useEffect(() => {
    if (!isRecording) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Escape cancels recording
      if (e.key === 'Escape') {
        cancelRecording()
        return
      }

      // Ignore lone modifier keys
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return
      }

      const parts: string[] = []
      if (e.ctrlKey) parts.push('Ctrl')
      if (e.altKey) parts.push('Alt')
      if (e.shiftKey) parts.push('Shift')
      if (e.metaKey) parts.push('Super')

      let keyName = e.key
      if (keyName.length === 1) {
        keyName = keyName.toUpperCase()
      } else if (keyName.toLowerCase().startsWith('f') && keyName.length <= 3) {
        keyName = keyName.toUpperCase()
      } else if (keyName === ' ') {
        keyName = 'Space'
      }

      parts.push(keyName)
      const combined = parts.join('+')

      setIsRecording(false)
      void applyHotkey(combined)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRecording, applyHotkey, cancelRecording])

  return {
    isRecording,
    saveSuccess,
    errorMessage,
    startRecording,
    cancelRecording,
    applyHotkey
  }
}
