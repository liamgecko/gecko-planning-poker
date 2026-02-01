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
}

export function JoinForm({ code }: Props) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [asSpectator, setAsSpectator] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
        <Label htmlFor="name">Your name (optional)</Label>
        <Input
          id="name"
          placeholder="e.g. Developer"
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
            <SelectItem value="voter">Voter (can vote)</SelectItem>
            <SelectItem value="spectator">Spectator (watch only)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Joining..." : "Join Room"}
      </Button>
    </form>
  )
}
