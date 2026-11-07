import { useState, useCallback } from 'react'

export interface UseSpotifyAuthOptions {
  initialClientId: string
  onUpdateClientId: (id: string) => Promise<void> | void
  onConnect: () => Promise<{ success: boolean; error?: string }>
  onDisconnect: () => Promise<void>
}

export interface UseSpotifyAuthReturn {
  isEditingClientId: boolean
  clientIdInput: string
  isConnecting: boolean
  errorMessage: string | null
  setClientIdInput: (val: string) => void
  toggleEditing: () => void
  saveClientId: () => Promise<void>
  handleConnect: () => Promise<void>
  handleDisconnect: () => Promise<void>
}

/**
 * Headless controller hook managing Spotify OAuth trigger states and client ID configuration.
 */
export function useSpotifyAuth({
  initialClientId,
  onUpdateClientId,
  onConnect,
  onDisconnect
}: UseSpotifyAuthOptions): UseSpotifyAuthReturn {
  const [isEditingClientId, setIsEditingClientId] = useState(false)
  const [clientIdInput, setClientIdInput] = useState(initialClientId)
  const [isConnecting, setIsConnecting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const toggleEditing = useCallback(() => {
    setIsEditingClientId((prev) => {
      if (!prev) setClientIdInput(initialClientId)
      return !prev
    })
  }, [initialClientId])

  const saveClientId = useCallback(async () => {
    const trimmed = clientIdInput.trim()
    await onUpdateClientId(trimmed)
    setIsEditingClientId(false)
  }, [clientIdInput, onUpdateClientId])

  const handleConnect = useCallback(async () => {
    setErrorMessage(null)
    setIsConnecting(true)

    try {
      if (clientIdInput.trim() !== initialClientId.trim()) {
        await onUpdateClientId(clientIdInput.trim())
      }
      const res = await onConnect()
      if (!res.success && res.error) {
        setErrorMessage(res.error)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Spotify connection failed'
      setErrorMessage(msg)
    } finally {
      setIsConnecting(false)
    }
  }, [clientIdInput, initialClientId, onUpdateClientId, onConnect])

  const handleDisconnect = useCallback(async () => {
    setErrorMessage(null)
    try {
      await onDisconnect()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Disconnection failed'
      setErrorMessage(msg)
    }
  }, [onDisconnect])

  return {
    isEditingClientId,
    clientIdInput,
    isConnecting,
    errorMessage,
    setClientIdInput,
    toggleEditing,
    saveClientId,
    handleConnect,
    handleDisconnect
  }
}
