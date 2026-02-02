"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { submitVote } from "@/app/actions"
import type { Vote, Unit } from "@/features/poker/schema"

type Props = {
  code: string
  participantId: string
  currentVote?: Vote
  hasVoted: boolean
  revealed: boolean
}

const UNITS: Unit[] = ["days", "weeks"]

export function VoteInput({
  code,
  participantId,
  currentVote,
  hasVoted,
  revealed,
}: Props) {
  const [value, setValue] = useState(
    currentVote?.value?.toString() ?? ""
  )
  const [unit, setUnit] = useState<Unit>(currentVote?.unit ?? "days")

  useEffect(() => {
    setValue(currentVote?.value?.toString() ?? "")
    setUnit(currentVote?.unit ?? "days")
  }, [currentVote?.value, currentVote?.unit])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const numValue = parseFloat(value)
  const roundedValue = !isNaN(numValue) ? Math.round(numValue * 100) / 100 : NaN
  const isValid = !isNaN(roundedValue) && roundedValue >= 0

  function handleValueChange(raw: string) {
    if (raw === "") {
      setValue("")
      return
    }
    const parts = raw.split(".")
    if (parts.length === 2 && parts[1].length > 2) return
    setValue(raw)
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!isValid || revealed) return
    setLoading(true)
    setError(null)
    const result = await submitVote({
      code,
      participantId,
      vote: { value: roundedValue, unit },
    })
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
  }

  if (revealed) return null

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          max={999}
          step="0.01"
          placeholder="0"
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          disabled={loading}
          className="w-24"
        />
        <Select
          value={unit}
          onValueChange={(v) => setUnit(v as Unit)}
          disabled={loading}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNITS.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        disabled={loading || !isValid}
        onClick={() => handleSubmit()}
      >
        {loading ? "Submitting..." : hasVoted ? "Update vote" : "Submit vote"}
      </Button>
    </form>
  )
}
