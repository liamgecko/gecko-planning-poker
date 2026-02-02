"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { setStoredParticipantId } from "@/features/poker/use-room"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createRoom } from "@/app/actions"

export function CreateRoomForm() {
  const router = useRouter()
  const [roomName, setRoomName] = useState("")
  const [facilitatorName, setFacilitatorName] = useState("")
  const [allowIssueNames, setAllowIssueNames] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await createRoom({
      roomName: roomName.trim() || undefined,
      facilitatorName: facilitatorName.trim() || undefined,
      allowIssueNames,
    })
    setLoading(false)
    if ("error" in result) {
      setError(result.error ?? "Something went wrong")
      return
    }
    setStoredParticipantId(result.room.code, result.facilitatorId)
    router.push(`/room/${result.room.code}?pid=${result.facilitatorId}&created=1`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="roomName">Room name</Label>
        <Input
          id="roomName"
          placeholder="e.g. Sprint 42 estimation"
          maxLength={100}
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="flex items-center gap-4">
        <Switch
          id="allowIssueNames"
          checked={allowIssueNames}
          onCheckedChange={setAllowIssueNames}
          disabled={loading}
        />
        <div className="space-y-0.5">
          <Label htmlFor="allowIssueNames">Name each issue</Label>
          <p className="text-sm text-muted-foreground">
            Add a name for each item you estimate
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="facilitatorName">Your name</Label>
        <Input
          id="facilitatorName"
          placeholder="e.g. Scrum Master"
          maxLength={100}
          value={facilitatorName}
          onChange={(e) => setFacilitatorName(e.target.value)}
          disabled={loading}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Room"}
      </Button>
    </form>
  )
}
