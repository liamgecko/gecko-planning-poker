import { NextResponse } from "next/server"
import { getRoom, recordHeartbeat } from "@/data/room-repository"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const { searchParams } = new URL(request.url)
  const participantId = searchParams.get("pid")
  if (participantId) {
    recordHeartbeat(code, participantId)
  }
  const room = getRoom(code)
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }
  return NextResponse.json(room)
}
