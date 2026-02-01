import { NextResponse } from "next/server"
import { leaveRoom } from "@/data/room-repository"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const { searchParams } = new URL(request.url)
  const participantId = searchParams.get("pid")
  if (!participantId) {
    return NextResponse.json({ error: "Participant ID required" }, { status: 400 })
  }
  leaveRoom(code, participantId)
  return new Response(null, { status: 204 })
}
