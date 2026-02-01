"use client"

import { useCallback, useEffect, useState } from "react"
import type { Room } from "./schema"

const POLL_INTERVAL_MS = 1500
const STORAGE_KEY_PREFIX = "planning-poker-pid-"

export function getStoredParticipantId(code: string): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(`${STORAGE_KEY_PREFIX}${code}`)
}

export function setStoredParticipantId(code: string, participantId: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${code}`, participantId)
}

export function clearStoredParticipantId(code: string) {
  if (typeof window === "undefined") return
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${code}`)
}

export function useRoom(code: string, participantId?: string | null) {
  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRoom = useCallback(async () => {
    try {
      const url = participantId
        ? `/api/room/${code}?pid=${encodeURIComponent(participantId)}`
        : `/api/room/${code}`
      const res = await fetch(url)
      if (!res.ok) {
        if (res.status === 404) {
          setError("Room not found")
          setRoom(null)
        }
        return
      }
      const data = (await res.json()) as Room
      setRoom(data)
      setError(null)
    } catch {
      setError("Failed to load room")
    } finally {
      setLoading(false)
    }
  }, [code, participantId])

  useEffect(() => {
    fetchRoom()
    const interval = setInterval(fetchRoom, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchRoom])

  return { room, error, loading, refetch: fetchRoom }
}
