"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  roomCode: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareRoomDialog({ roomCode, open, onOpenChange }: Props) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const roomUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/${roomCode}`
      : ""

  function handleCopy() {
    navigator.clipboard.writeText(roomUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.delete("created")
      router.replace(url.pathname + url.search)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share room URL</DialogTitle>
          <DialogDescription>
            Share this URL with your team so they can join the planning session.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            readOnly
            value={roomUrl}
            className="font-mono text-sm"
          />
          <Tooltip open={copied} onOpenChange={(open) => !open && setCopied(false)}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="Copy URL"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="size-4 text-emerald-400" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Link copied</TooltipContent>
          </Tooltip>
        </div>
      </DialogContent>
    </Dialog>
  )
}
