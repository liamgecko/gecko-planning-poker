"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DoorOpen } from "lucide-react"
import {
  useRoom,
  getStoredParticipantId,
  clearStoredParticipantId,
} from "@/features/poker/use-room"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty"
import { JoinForm } from "./join-form"
import { GameView } from "./game-view"

type Props = {
  code: string
  participantId?: string
  showShareDialog?: boolean
}

export function RoomView({ code, participantId, showShareDialog }: Props) {
  const router = useRouter()
  const { room, error, loading, refetch } = useRoom(code)

  useEffect(() => {
    if (participantId || !room) return
    const stored = getStoredParticipantId(code)
    if (stored && room.participants.some((p) => p.id === stored)) {
      router.replace(`/room/${code}?pid=${stored}`)
    }
  }, [code, participantId, room, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading room...</p>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <DoorOpen />
            </EmptyMedia>
            <EmptyTitle>Room not found</EmptyTitle>
            <EmptyDescription>
              We couldn&apos;t find that room. Try creating a new one to get
              started.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild variant="default">
              <Link href="/">Create new</Link>
            </Button>
          </EmptyContent>
        </Empty>
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
            <JoinForm
              code={room.code}
              voterCount={
                room.participants.filter((p) => p.role === "voter").length
              }
              voterLimit={7}
            />
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
