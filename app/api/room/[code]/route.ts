import { NextResponse } from "next/server"
import { getRoom } from "@/data/room-repository"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const room = await getRoom(code)
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }
  return NextResponse.json(room)
}
