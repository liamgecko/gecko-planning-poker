"use server"

import {
  createRoomSchema,
  facilitatorActionSchema,
  joinRoomSchema,
  submitVoteSchema,
  updateIssueNameSchema,
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
  resetVotes as resetVotesRepo,
  revealVotes as revealVotesRepo,
  submitVote as submitVoteRepo,
  updateIssueName as updateIssueNameRepo,
} from "@/data/room-repository"

export async function createRoom(input: CreateRoomInput) {
  const parsed = createRoomSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }
  const { room, facilitatorId } = await createRoomRepo(
    parsed.data.facilitatorName,
    parsed.data.roomName,
    parsed.data.allowIssueNames
  )
  return { room, facilitatorId }
}

export async function joinRoom(input: JoinRoomInput) {
  const parsed = joinRoomSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }
  const result = await joinRoomRepo(
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
  const result = await submitVoteRepo(
    parsed.data.code,
    parsed.data.participantId,
    parsed.data.vote
  )
  if ("error" in result) return { error: result.error }
  return { room: result }
}

export async function revealVotes(code: string, facilitatorId: string) {
  const parsed = facilitatorActionSchema.safeParse({ code, facilitatorId })
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }
  const result = await revealVotesRepo(parsed.data.code, parsed.data.facilitatorId)
  if ("error" in result) return { error: result.error }
  return { room: result }
}

export async function resetVotes(code: string, facilitatorId: string) {
  const parsed = facilitatorActionSchema.safeParse({ code, facilitatorId })
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }
  const result = await resetVotesRepo(parsed.data.code, parsed.data.facilitatorId)
  if ("error" in result) return { error: result.error }
  return { room: result }
}

export async function nextIssue(
  code: string,
  facilitatorId: string,
  issueName?: string
) {
  const parsed = facilitatorActionSchema.safeParse({ code, facilitatorId })
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }
  const result = await nextIssueRepo(
    parsed.data.code,
    parsed.data.facilitatorId,
    issueName
  )
  if ("error" in result) return { error: result.error }
  return { room: result }
}

export async function updateIssueName(
  code: string,
  facilitatorId: string,
  issueName?: string
) {
  const parsed = updateIssueNameSchema.safeParse({
    code,
    facilitatorId,
    issueName,
  })
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }
  const result = await updateIssueNameRepo(
    parsed.data.code,
    parsed.data.facilitatorId,
    parsed.data.issueName
  )
  if ("error" in result) return { error: result.error }
  return { room: result }
}

export async function getRoomState(code: string) {
  const parsed = facilitatorActionSchema.shape.code.safeParse(code.trim())
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid room code" }
  }
  const room = await getRoom(parsed.data)
  if (!room) return { error: "Room not found" }
  return { room }
}

export async function endPlanning(code: string, facilitatorId: string) {
  const parsed = facilitatorActionSchema.safeParse({ code, facilitatorId })
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }
  const result = await endRoomRepo(parsed.data.code, parsed.data.facilitatorId)
  if ("error" in result) return { error: result.error }
  return { success: true }
}
