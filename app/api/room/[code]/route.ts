import { NextResponse } from "next/server"
import { roomCodeSchema } from "@/features/poker/schema"
import { getRoom } from "@/data/room-repository"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const parsed = roomCodeSchema.safeParse(code?.trim() ?? "")
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid room code" },
      { status: 400 }
    )
  }
  const room = await getRoom(parsed.data)
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }
  return NextResponse.json(room)
}
