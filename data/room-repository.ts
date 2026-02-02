import { redis } from "@/lib/redis"
import type { Participant, Room, Vote } from "@/features/poker/schema"

const ROOM_KEY_PREFIX = "room:"
const CODES_KEY = "room:codes"
const MAX_VOTERS = 7

function roomKey(code: string): string {
  return `${ROOM_KEY_PREFIX}${code.toUpperCase()}`
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function generateId(): string {
  return crypto.randomUUID()
}

/** In-memory fallback for local dev when Redis is not configured */
const GLOBAL_ROOMS_KEY = "__planning_poker_rooms__"

function getInMemoryRooms(): Map<string, Room> {
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

const inMemoryRooms = getInMemoryRooms()

function useRedis(): boolean {
  return redis !== null
}

/**
 * Create a new room. Returns the room and facilitator participant.
 */
export async function createRoom(
  facilitatorName?: string,
  roomName?: string,
  allowIssueNames?: boolean
): Promise<{ room: Room; facilitatorId: string }> {
  const facilitatorId = generateId()
  let code = generateCode()

  if (useRedis()) {
    while (true) {
      const existing = await redis!.get(roomKey(code))
      if (!existing) break
      code = generateCode()
    }
  } else {
    while (inMemoryRooms.has(code)) {
      code = generateCode()
    }
  }

  const facilitator: Participant = {
    id: facilitatorId,
    name: facilitatorName,
    role: "facilitator",
    hasVoted: false,
  }
  const room: Room = {
    code,
    name: roomName,
    allowIssueNames: allowIssueNames ?? false,
    facilitatorId,
    participants: [facilitator],
    revealed: false,
    createdAt: Date.now(),
  }

  if (useRedis()) {
    await redis!.set(roomKey(code), JSON.stringify(room))
    await redis!.sadd(CODES_KEY, code)
  } else {
    inMemoryRooms.set(code, room)
  }

  return { room, facilitatorId }
}

/**
 * Get a room by code.
 */
export async function getRoom(code: string): Promise<Room | undefined> {
  const key = code.toUpperCase()

  if (useRedis()) {
    const data = await redis!.get<string>(roomKey(key))
    if (!data) return undefined
    return typeof data === "string" ? (JSON.parse(data) as Room) : data
  }

  return inMemoryRooms.get(key)
}

/**
 * Join a room as voter or spectator.
 * Max 1 facilitator, 7 voters. Spectators unlimited.
 */
export async function joinRoom(
  code: string,
  asSpectator: boolean,
  name?: string
): Promise<{ room: Room; participantId: string } | { error: string }> {
  const room = await getRoom(code)
  if (!room) return { error: "Room not found" }

  if (!asSpectator) {
    const voterCount = room.participants.filter((p) => p.role === "voter").length
    if (voterCount >= MAX_VOTERS) {
      return { error: "Room is full. Join as a spectator to watch." }
    }
  }

  const participantId = generateId()
  const participant: Participant = {
    id: participantId,
    name,
    role: asSpectator ? "spectator" : "voter",
    hasVoted: false,
  }
  room.participants.push(participant)

  if (useRedis()) {
    await redis!.set(roomKey(code.toUpperCase()), JSON.stringify(room))
  }

  return { room, participantId }
}

/**
 * Submit or update a vote.
 */
export async function submitVote(
  code: string,
  participantId: string,
  vote: Vote
): Promise<Room | { error: string }> {
  const room = await getRoom(code)
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

  if (useRedis()) {
    await redis!.set(roomKey(code.toUpperCase()), JSON.stringify(room))
  }

  return room
}

/**
 * Reveal votes (facilitator only).
 */
export async function revealVotes(
  code: string,
  facilitatorId: string
): Promise<Room | { error: string }> {
  const room = await getRoom(code)
  if (!room) return { error: "Room not found" }
  if (room.facilitatorId !== facilitatorId) return { error: "Only facilitator can reveal" }

  room.revealed = true

  if (useRedis()) {
    await redis!.set(roomKey(code.toUpperCase()), JSON.stringify(room))
  }

  return room
}

/**
 * Start next round (facilitator only).
 */
export async function nextIssue(
  code: string,
  facilitatorId: string,
  issueName?: string
): Promise<Room | { error: string }> {
  const room = await getRoom(code)
  if (!room) return { error: "Room not found" }
  if (room.facilitatorId !== facilitatorId) return { error: "Only facilitator can start next round" }

  room.revealed = false
  if (room.allowIssueNames && issueName !== undefined) {
    room.currentIssueName = issueName.trim() || undefined
  }
  for (const p of room.participants) {
    p.hasVoted = false
    p.vote = undefined
  }

  if (useRedis()) {
    await redis!.set(roomKey(code.toUpperCase()), JSON.stringify(room))
  }

  return room
}

/**
 * Update current issue name (facilitator only).
 */
export async function updateIssueName(
  code: string,
  facilitatorId: string,
  issueName?: string
): Promise<Room | { error: string }> {
  const room = await getRoom(code)
  if (!room) return { error: "Room not found" }
  if (room.facilitatorId !== facilitatorId) return { error: "Only facilitator can update issue name" }
  if (!room.allowIssueNames) return { error: "Issue naming is not enabled for this room" }

  room.currentIssueName = issueName?.trim() || undefined

  if (useRedis()) {
    await redis!.set(roomKey(code.toUpperCase()), JSON.stringify(room))
  }

  return room
}

/**
 * End planning session (facilitator only). Removes the room.
 */
export async function endRoom(
  code: string,
  facilitatorId: string
): Promise<{ success: true } | { error: string }> {
  const room = await getRoom(code)
  if (!room) return { error: "Room not found" }
  if (room.facilitatorId !== facilitatorId) return { error: "Only facilitator can end planning" }

  const key = code.toUpperCase()

  if (useRedis()) {
    await redis!.del(roomKey(key))
    await redis!.srem(CODES_KEY, key)
  } else {
    inMemoryRooms.delete(key)
  }

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
