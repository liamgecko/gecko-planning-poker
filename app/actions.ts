"use server"

import {
  createRoomSchema,
  joinRoomSchema,
  submitVoteSchema,
  type CreateRoomInput,
  type JoinRoomInput,
  type SubmitVoteInput,
} from "@/features/poker/schema"
import {
  createRoom as createRoomRepo,
  endRoom as endRoomRepo,
  getRoom,
  joinRoom as joinRoomRepo,
  nextIssue as nextIssueRepo,
  revealVotes as revealVotesRepo,
  submitVote as submitVoteRepo,
} from "@/data/room-repository"

export async function createRoom(input: CreateRoomInput) {
  const parsed = createRoomSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }
  const { room, facilitatorId } = createRoomRepo(parsed.data.facilitatorName)
  return { room, facilitatorId }
}

export async function joinRoom(input: JoinRoomInput) {
  const parsed = joinRoomSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }
  const result = joinRoomRepo(
    parsed.data.code,
    parsed.data.asSpectator,
    parsed.data.name
  )
  if ("error" in result) return { error: result.error }
  return result
}

export async function submitVote(input: SubmitVoteInput) {
  const parsed = submitVoteSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }
  const result = submitVoteRepo(
    parsed.data.code,
    parsed.data.participantId,
    parsed.data.vote
  )
  if ("error" in result) return { error: result.error }
  return { room: result }
}

export async function revealVotes(code: string, facilitatorId: string) {
  const result = revealVotesRepo(code, facilitatorId)
  if ("error" in result) return { error: result.error }
  return { room: result }
}

export async function nextIssue(code: string, facilitatorId: string) {
  const result = nextIssueRepo(code, facilitatorId)
  if ("error" in result) return { error: result.error }
  return { room: result }
}

export async function getRoomState(code: string) {
  const room = getRoom(code)
  if (!room) return { error: "Room not found" }
  return { room }
}

export async function endPlanning(code: string, facilitatorId: string) {
  const result = endRoomRepo(code, facilitatorId)
  if ("error" in result) return { error: result.error }
  return { success: true }
}
