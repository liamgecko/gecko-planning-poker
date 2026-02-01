import type { Participant, Room, Vote } from "@/features/poker/schema"

const GLOBAL_ROOMS_KEY = "__planning_poker_rooms__"

function getRooms(): Map<string, Room> {
  if (typeof globalThis !== "undefined") {
    const existing = (globalThis as unknown as Record<string, Map<string, Room> | undefined>)[
      GLOBAL_ROOMS_KEY
    ]
    if (existing) return existing
    const map = new Map<string, Room>()
    ;(globalThis as unknown as Record<string, Map<string, Room>>)[GLOBAL_ROOMS_KEY] = map
    return map
  }
  return new Map<string, Room>()
}

const rooms = getRooms()

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  if (rooms.has(code)) return generateCode()
  return code
}

function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Create a new room. Returns the room and facilitator participant.
 */
export function createRoom(facilitatorName?: string): { room: Room; facilitatorId: string } {
  const facilitatorId = generateId()
  const code = generateCode()
  const facilitator: Participant = {
    id: facilitatorId,
    name: facilitatorName,
    role: "facilitator",
    hasVoted: false,
  }
  const room: Room = {
    code,
    facilitatorId,
    participants: [facilitator],
    revealed: false,
    createdAt: Date.now(),
  }
  rooms.set(code, room)
  return { room, facilitatorId }
}

/**
 * Get a room by code.
 */
export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase())
}

/**
 * Join a room as voter or spectator.
 */
export function joinRoom(
  code: string,
  asSpectator: boolean,
  name?: string
): { room: Room; participantId: string } | { error: string } {
  const room = rooms.get(code.toUpperCase())
  if (!room) return { error: "Room not found" }

  const participantId = generateId()
  const participant: Participant = {
    id: participantId,
    name,
    role: asSpectator ? "spectator" : "voter",
    hasVoted: false,
  }
  room.participants.push(participant)
  return { room, participantId }
}

/**
 * Submit or update a vote.
 */
export function submitVote(
  code: string,
  participantId: string,
  vote: Vote
): Room | { error: string } {
  const room = rooms.get(code.toUpperCase())
  if (!room) return { error: "Room not found" }
  if (room.revealed) return { error: "Votes already revealed" }

  const participant = room.participants.find((p) => p.id === participantId)
  if (!participant) return { error: "Participant not found" }
  if (participant.role !== "voter")
    return { error: "Only voters can vote" }

  participant.vote = vote
  participant.hasVoted = true

  if (allVotersHaveSubmitted(room)) {
    room.revealed = true
  }
  return room
}

/**
 * Reveal votes (facilitator only).
 */
export function revealVotes(code: string, facilitatorId: string): Room | { error: string } {
  const room = rooms.get(code.toUpperCase())
  if (!room) return { error: "Room not found" }
  if (room.facilitatorId !== facilitatorId) return { error: "Only facilitator can reveal" }

  room.revealed = true
  return room
}

/**
 * Start next round (facilitator only).
 */
export function nextIssue(code: string, facilitatorId: string): Room | { error: string } {
  const room = rooms.get(code.toUpperCase())
  if (!room) return { error: "Room not found" }
  if (room.facilitatorId !== facilitatorId) return { error: "Only facilitator can start next round" }

  room.revealed = false
  for (const p of room.participants) {
    p.hasVoted = false
    p.vote = undefined
  }
  return room
}

/**
 * End planning session (facilitator only). Removes the room.
 */
export function endRoom(code: string, facilitatorId: string): { success: true } | { error: string } {
  const room = rooms.get(code.toUpperCase())
  if (!room) return { error: "Room not found" }
  if (room.facilitatorId !== facilitatorId) return { error: "Only facilitator can end planning" }

  rooms.delete(code.toUpperCase())
  return { success: true }
}

/**
 * Check if all voters have submitted.
 */
export function allVotersHaveSubmitted(room: Room): boolean {
  const voters = room.participants.filter((p) => p.role === "voter")
  if (voters.length === 0) return true
  return voters.every((v) => v.hasVoted)
}
