"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { setStoredParticipantId } from "@/features/poker/use-room"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { joinRoom } from "@/app/actions"

type Props = {
  code: string
  voterCount?: number
  voterLimit?: number
}

export function JoinForm({ code, voterCount = 0, voterLimit = 7 }: Props) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [asSpectator, setAsSpectator] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const voterSlotsFull = voterCount >= voterLimit

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!asSpectator && voterSlotsFull) return
    setLoading(true)
    setError(null)
    const result = await joinRoom({
      code,
      name: name || undefined,
      asSpectator,
    })
    setLoading(false)
    if ("error" in result) {
      setError(result.error ?? "Something went wrong")
      return
    }
    setStoredParticipantId(code, result.participantId)
    router.push(`/room/${code}?pid=${result.participantId}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Your name</Label>
        <Input
          id="name"
          placeholder="e.g. Developer"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label>Join as</Label>
        <Select
          value={asSpectator ? "spectator" : "voter"}
          onValueChange={(v) => setAsSpectator(v === "spectator")}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="voter" disabled={voterSlotsFull}>
              Voter (can vote)
            </SelectItem>
            <SelectItem value="spectator">Spectator (watch only)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {voterSlotsFull && !asSpectator && (
        <p className="text-sm text-muted-foreground">
          Voter slots are full. Join as a spectator to watch.
        </p>
      )}
      <Button
        type="submit"
        disabled={loading || (!asSpectator && voterSlotsFull)}
      >
        {loading ? "Joining..." : "Join Room"}
      </Button>
    </form>
  )
}
