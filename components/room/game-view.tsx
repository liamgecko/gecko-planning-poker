"use client"

import Link from "next/link"
import { Check, LogOut, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlayerCard } from "./player-card"
import { VoteInput } from "./vote-input"
import { FacilitatorBar } from "./facilitator-bar"
import { TableLayout } from "./table-layout"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ShareRoomDialog } from "./share-room-dialog"
import { clearStoredParticipantId } from "@/features/poker/use-room"
import { endPlanning } from "@/app/actions"
import type { Room } from "@/features/poker/schema"

type Props = {
  room: Room
  participantId: string
  isFacilitator: boolean
  refetch?: () => void
  showShareDialog?: boolean
}

export function GameView({ room, participantId, isFacilitator, refetch, showShareDialog }: Props) {
  const router = useRouter()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [endingPlanning, setEndingPlanning] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)
  const [shareTooltipOpen, setShareTooltipOpen] = useState(false)

  useEffect(() => {
    if (showShareDialog && isFacilitator) {
      setShareDialogOpen(true)
    }
  }, [showShareDialog, isFacilitator])

  function handleLeaveRoom() {
    clearStoredParticipantId(room.code)
    router.push("/")
  }

  async function handleEndPlanning() {
    setEndingPlanning(true)
    const result = await endPlanning(room.code, participantId)
    if ("error" in result) {
      setEndingPlanning(false)
      return
    }
    clearStoredParticipantId(room.code)
    router.push("/")
  }

  const participant = room.participants.find((p) => p.id === participantId)
  const canVote = participant && participant.role === "voter"
  const roomUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/${room.code}`
      : ""

  function handleCopyUrl() {
    navigator.clipboard.writeText(roomUrl)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ShareRoomDialog
        roomCode={room.code}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <img
              src="/gecko-poker.svg"
              alt="Planning Poker"
              className="h-6 w-auto"
            />
          </Link>
          <span className="text-xs font-mono text-muted-foreground">
            Room {room.code}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isFacilitator && (
            <>
              <Tooltip
                open={urlCopied || shareTooltipOpen}
                onOpenChange={(open) => {
                  if (!urlCopied) setShareTooltipOpen(open)
                }}
              >
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyUrl}
                    aria-label="Copy room URL"
                  >
                    {urlCopied ? (
                      <Check className="size-4 text-emerald-400" />
                    ) : (
                      <Share2 className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {urlCopied ? "Link copied" : "Share room link"}
                </TooltipContent>
              </Tooltip>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={isFacilitator ? handleEndPlanning : handleLeaveRoom}
            disabled={isFacilitator && endingPlanning}
          >
            <LogOut className="size-4" />
            {isFacilitator && endingPlanning ? "Ending..." : isFacilitator ? "End planning" : "Leave room"}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <TableLayout>
          {room.participants.map((p) => (
            <PlayerCard
              key={p.id}
              participant={p}
              revealed={room.revealed}
              isCurrentUser={p.id === participantId}
            />
          ))}
        </TableLayout>

        {canVote && !room.revealed && (
          <div className="mt-12 p-6 rounded-lg border bg-card">
            <h3 className="text-sm font-medium mb-3">Your vote</h3>
            <VoteInput
              code={room.code}
              participantId={participantId}
              currentVote={participant?.vote}
              hasVoted={participant?.hasVoted ?? false}
              revealed={room.revealed}
            />
          </div>
        )}

        {isFacilitator && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <FacilitatorBar
              code={room.code}
              facilitatorId={participantId}
              revealed={room.revealed}
              onAction={refetch}
            />
          </div>
        )}
      </main>
    </div>
  )
}
