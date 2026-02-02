"use client"

import { CircleCheckBig, HatGlasses, HelpCircle, ShieldUser } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Participant } from "@/features/poker/schema"

type Props = {
  participant: Participant
  revealed: boolean
  isCurrentUser?: boolean
}

export function PlayerCard({ participant, revealed, isCurrentUser }: Props) {
  const displayName =
    participant.name ?? (participant.role === "facilitator" ? "Facilitator" : "Anonymous")

  const showVoteLabel =
    participant.vote &&
    (revealed || (isCurrentUser && participant.role === "voter"))
  const showSubmitted =
    !revealed &&
    participant.hasVoted &&
    participant.role === "voter" &&
    !isCurrentUser

  const voteLabel =
    showVoteLabel && participant.vote
      ? `${participant.vote.value}${participant.vote.unit === "days" ? "d" : "w"}`
      : null

  const roleTooltip =
    participant.role === "spectator"
      ? "Spectator"
      : participant.role === "facilitator"
        ? "Facilitator"
        : null

  const card = (
    <Card
      className={cn(
        "w-full h-full min-w-0 py-0 flex flex-col items-center justify-center transition-all",
        isCurrentUser && "ring-2 ring-cyan-200 shadow-xl shadow-cyan-200/50"
      )}
    >
      <CardContent className="flex flex-col items-center justify-center p-2 w-full h-full">
        {showVoteLabel ? (
          <span className="text-xl font-bold">
            {voteLabel}
          </span>
        ) : showSubmitted ? (
          <CircleCheckBig className="size-6 text-muted-foreground" aria-label="Submitted" />
        ) : participant.role === "spectator" ? (
          <HatGlasses className="size-6 text-muted-foreground" aria-label="Spectator" />
        ) : participant.role === "facilitator" ? (
          <ShieldUser className="size-6 text-muted-foreground" aria-label="Facilitator" />
        ) : (
          <HelpCircle className="size-6 text-muted-foreground" aria-label="Not yet voted" />
        )}
      </CardContent>
    </Card>
  )

  const cardWrapper = (
    <div className="w-16 min-w-16 max-w-16 shrink-0 aspect-3/4 *:min-w-0">
      {card}
    </div>
  )

  return (
    <div className="flex flex-col items-center gap-2 w-full min-w-0 max-w-full">
      {roleTooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{cardWrapper}</TooltipTrigger>
          <TooltipContent>{roleTooltip}</TooltipContent>
        </Tooltip>
      ) : (
        cardWrapper
      )}
      <span className="text-sm font-medium text-center max-w-[100px] truncate">
        {displayName}
      </span>
    </div>
  )
}
