"use client"

import { Eye, ArrowBigRightDash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { revealVotes, nextIssue } from "@/app/actions"

type Props = {
  code: string
  facilitatorId: string
  revealed: boolean
  onAction?: () => void
}

export function FacilitatorBar({ code, facilitatorId, revealed, onAction }: Props) {
  async function handleReveal() {
    await revealVotes(code, facilitatorId)
    onAction?.()
  }

  async function handleNext() {
    await nextIssue(code, facilitatorId)
    onAction?.()
  }

  return (
    <div className="flex items-center gap-3">
      {!revealed && (
        <Button variant="default" size="default" onClick={handleReveal}>
          <Eye className="size-4" />
          Reveal votes
        </Button>
      )}
      <Button variant="outline" size="default" onClick={handleNext}>
        <ArrowBigRightDash className="size-4" />
        Next issue
      </Button>
    </div>
  )
}
