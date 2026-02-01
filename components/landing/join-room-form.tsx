"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function JoinRoomForm() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = code.trim()
    if (!trimmed) {
      setError("Enter a room ID")
      return
    }
    router.push(`/room/${trimmed}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="code">Room ID</Label>
        <Input
          id="code"
          placeholder="e.g. ABC123"
          maxLength={10}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase())
            setError(null)
          }}
          className="font-mono"
          autoComplete="off"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button type="submit">
        Go to Room
      </Button>
    </form>
  )
}
