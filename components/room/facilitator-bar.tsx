"use client"

import { useState, useRef } from "react"
import { Eye, ArrowBigRightDash } from "lucide-react"
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
import { revealVotes, nextIssue, updateIssueName } from "@/app/actions"

type Props = {
  code: string
  facilitatorId: string
  revealed: boolean
  allowIssueNames?: boolean
  currentIssueName?: string
  onAction?: () => void
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
  const issueNameInputRef = useRef<HTMLInputElement>(null)

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

  async function handleIssueNameBlur() {
    if (!allowIssueNames) return
    const value = issueNameInputRef.current?.value ?? ""
    const trimmed = value.trim()
    if (trimmed === (currentIssueName ?? "")) return
    await updateIssueName(code, facilitatorId, trimmed || undefined)
    onAction?.()
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {allowIssueNames && (
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <Label htmlFor="issueName">Current issue</Label>
            <Input
              ref={issueNameInputRef}
              key={currentIssueName ?? "empty"}
              id="issueName"
              placeholder="e.g. API integration"
              maxLength={100}
              defaultValue={currentIssueName ?? ""}
              onBlur={handleIssueNameBlur}
              className="font-medium"
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          {!revealed && (
            <Button variant="default" size="default" onClick={handleReveal}>
              <Eye className="size-4" />
              Reveal votes
            </Button>
          )}
          <Button
            variant="outline"
            size="default"
            onClick={handleNextClick}
            disabled={loading}
          >
            <ArrowBigRightDash className="size-4" />
            Next issue
          </Button>
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
