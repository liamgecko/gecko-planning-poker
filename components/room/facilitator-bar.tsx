"use client"

import { useState, useRef, useEffect } from "react"
import { Eye, ArrowBigRightDash, CircleCheckBig, Eraser } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { revealVotes, nextIssue, resetVotes, updateIssueName } from "@/app/actions"

type Props = {
  code: string
  facilitatorId: string
  revealed: boolean
  allowIssueNames?: boolean
  currentIssueName?: string
  onAction?: () => void
}

function IssueNameInput({
  code,
  facilitatorId,
  currentIssueName,
  onAction,
}: {
  code: string
  facilitatorId: string
  currentIssueName?: string
  onAction?: () => void
}) {
  const [issueNameValue, setIssueNameValue] = useState(currentIssueName ?? "")
  const [updatingIssue, setUpdatingIssue] = useState(false)
  const [issueNameSaved, setIssueNameSaved] = useState(false)
  const issueNameInputRef = useRef<HTMLInputElement>(null)

  // Sync input when currentIssueName changes (e.g. after "Next issue")
  useEffect(() => {
    const next = currentIssueName ?? ""
    const id = requestAnimationFrame(() => setIssueNameValue(next))
    return () => cancelAnimationFrame(id)
  }, [currentIssueName])

  const hasIssueNameEdit =
    issueNameValue.trim() !== (currentIssueName ?? "")

  async function handleUpdateIssueName() {
    if (!hasIssueNameEdit) return
    const trimmed = issueNameValue.trim()
    setUpdatingIssue(true)
    await updateIssueName(code, facilitatorId, trimmed || undefined)
    setUpdatingIssue(false)
    setIssueNameSaved(true)
    setTimeout(() => setIssueNameSaved(false), 2000)
    onAction?.()
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      <Label htmlFor="issueName">Current issue</Label>
      <div className="flex items-center gap-1">
        <Input
          ref={issueNameInputRef}
          id="issueName"
          placeholder="e.g. API integration"
          maxLength={100}
          value={issueNameValue}
          onChange={(e) => setIssueNameValue(e.target.value)}
          onBlur={handleUpdateIssueName}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), handleUpdateIssueName())
          }
          className="font-medium"
        />
        <Tooltip open={issueNameSaved}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={handleUpdateIssueName}
              disabled={!hasIssueNameEdit || updatingIssue}
              aria-label="Update issue name"
            >
              <CircleCheckBig className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Issue name saved!</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export function FacilitatorBar({
  code,
  facilitatorId,
  revealed,
  allowIssueNames,
  currentIssueName,
  onAction,
}: Props) {
  const [nextIssueDialogOpen, setNextIssueDialogOpen] = useState(false)
  const [nextIssueName, setNextIssueName] = useState("")
  const [loading, setLoading] = useState(false)
  const [resettingVotes, setResettingVotes] = useState(false)

  async function handleReveal() {
    await revealVotes(code, facilitatorId)
    onAction?.()
  }

  function handleNextClick() {
    if (allowIssueNames) {
      setNextIssueName("")
      setNextIssueDialogOpen(true)
    } else {
      handleNextSubmit()
    }
  }

  async function handleNextSubmit() {
    setLoading(true)
    const result = await nextIssue(
      code,
      facilitatorId,
      allowIssueNames ? nextIssueName.trim() || undefined : undefined
    )
    setLoading(false)
    if ("error" in result) return
    setNextIssueDialogOpen(false)
    onAction?.()
  }

  async function handleResetVotes() {
    setResettingVotes(true)
    await resetVotes(code, facilitatorId)
    setResettingVotes(false)
    onAction?.()
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {allowIssueNames && (
          <IssueNameInput
            key={code}
            code={code}
            facilitatorId={facilitatorId}
            currentIssueName={currentIssueName}
            onAction={onAction}
          />
        )}
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="default"
                onClick={handleReveal}
                disabled={revealed}
                aria-label="Reveal votes"
              >
                <Eye className="size-4" />
                Reveal votes
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reveal votes</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetVotes}
                disabled={resettingVotes}
                aria-label="Reset votes"
              >
                <Eraser className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset votes</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextClick}
                disabled={loading}
                aria-label="Next issue"
              >
                <ArrowBigRightDash className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next issue</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Dialog open={nextIssueDialogOpen} onOpenChange={setNextIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name the next issue</DialogTitle>
            <DialogDescription>
              Enter a name for the issue you&apos;re about to estimate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="nextIssueName">Issue name</Label>
            <Input
              id="nextIssueName"
              placeholder="e.g. Login flow"
              maxLength={100}
              value={nextIssueName}
              onChange={(e) => setNextIssueName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNextSubmit()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNextIssueDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleNextSubmit} disabled={loading}>
              {loading ? "Starting..." : "Start next issue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
