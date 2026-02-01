"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  useRoom,
  getStoredParticipantId,
  clearStoredParticipantId,
} from "@/features/poker/use-room"
import { JoinForm } from "./join-form"
import { GameView } from "./game-view"

type Props = {
  code: string
  participantId?: string
  showShareDialog?: boolean
}

export function RoomView({ code, participantId, showShareDialog }: Props) {
  const router = useRouter()
  const { room, error, loading, refetch } = useRoom(code, participantId)

  useEffect(() => {
    if (participantId || !room) return
    const stored = getStoredParticipantId(code)
    if (stored && room.participants.some((p) => p.id === stored)) {
      router.replace(`/room/${code}?pid=${stored}`)
    }
  }, [code, participantId, room, router])

  useEffect(() => {
    if (!participantId || typeof window === "undefined") return
    const pid = participantId
    function handleUnload() {
      navigator.sendBeacon(
        `/api/room/${code}/leave?pid=${encodeURIComponent(pid)}`
      )
    }
    window.addEventListener("pagehide", handleUnload)
    return () => window.removeEventListener("pagehide", handleUnload)
  }, [code, participantId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading room...</p>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-xl font-semibold">Room not found</h1>
        <p className="text-muted-foreground">
          {error ?? "This room may have been closed."}
        </p>
        <a
          href="/"
          className="text-primary underline underline-offset-4 hover:no-underline"
        >
          Create a new room
        </a>
      </div>
    )
  }

  const participant = participantId
    ? room.participants.find((p) => p.id === participantId)
    : null

  if (participantId && !participant) {
    clearStoredParticipantId(room.code)
  }

  if (!participant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Join Room {room.code}</h1>
            <p className="mt-2 text-muted-foreground">
              Enter your details to join the planning session.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <JoinForm code={room.code} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <GameView
      room={room}
      participantId={participant.id}
      isFacilitator={participant.role === "facilitator"}
      refetch={refetch}
      showShareDialog={showShareDialog}
    />
  )
}
