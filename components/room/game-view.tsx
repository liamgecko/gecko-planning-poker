"use client"

import Link from "next/link"
import { CircleCheckBig, LogOut, Share2, Users } from "lucide-react"
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
  const tableParticipants = room.participants.filter(
    (p) => p.role === "facilitator" || p.role === "voter"
  )
  const spectators = room.participants.filter((p) => p.role === "spectator")
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
        roomName={room.name}
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
          {spectators.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
                  aria-label={`${spectators.length} spectator${spectators.length === 1 ? "" : "s"}`}
                >
                  <Users className="size-3.5" />
                  <span className="font-medium tabular-nums">
                    {spectators.length}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium mb-1">
                  Spectator{spectators.length === 1 ? "" : "s"}
                </p>
                <ul className="text-sm text-muted-foreground space-y-0.5">
                  {spectators.map((s) => (
                    <li key={s.id}>
                      {s.name ?? "Anonymous"}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          )}
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
                    size="icon-sm"
                    onClick={handleCopyUrl}
                    aria-label="Copy room URL"
                  >
                    {urlCopied ? (
                      <CircleCheckBig className="size-4 text-emerald-400" />
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
        {(room.name || room.currentIssueName) && (
          <div className="mb-8 text-center">
            {room.name && (
              <h2 className="text-xl font-semibold">{room.name}</h2>
            )}
            {room.currentIssueName && (
              <p className="mt-1 text-muted-foreground">
                {room.currentIssueName}
              </p>
            )}
          </div>
        )}
        <TableLayout>
          {tableParticipants.map((p) => (
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
              allowIssueNames={room.allowIssueNames}
              currentIssueName={room.currentIssueName}
              onAction={refetch}
            />
          </div>
        )}
      </main>
    </div>
  )
}
