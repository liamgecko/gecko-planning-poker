"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { setStoredParticipantId } from "@/features/poker/use-room"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createRoom } from "@/app/actions"

export function CreateRoomForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await createRoom({ facilitatorName: name || undefined })
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
        <Label htmlFor="name">Your name (optional)</Label>
        <Input
          id="name"
          placeholder="e.g. Scrum Master"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
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
