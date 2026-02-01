import { z } from "zod"

/** Unit for estimation (days or weeks) */
export const unitSchema = z.enum(["days", "weeks"])
export type Unit = z.infer<typeof unitSchema>

/** A vote: number + unit */
export const voteSchema = z.object({
  value: z.number().int().nonnegative(),
  unit: unitSchema.default("days"),
})
export type Vote = z.infer<typeof voteSchema>

/** Participant role */
export const participantRoleSchema = z.enum(["voter", "spectator", "facilitator"])
export type ParticipantRole = z.infer<typeof participantRoleSchema>

/** Participant in a room */
export const participantSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  role: participantRoleSchema,
  hasVoted: z.boolean().default(false),
  vote: voteSchema.optional(),
})
export type Participant = z.infer<typeof participantSchema>

/** Room state */
export const roomSchema = z.object({
  code: z.string(),
  facilitatorId: z.string(),
  participants: z.array(participantSchema),
  revealed: z.boolean().default(false),
  createdAt: z.number(),
})
export type Room = z.infer<typeof roomSchema>

/** Create room input */
export const createRoomSchema = z.object({
  facilitatorName: z.string().optional(),
})
export type CreateRoomInput = z.infer<typeof createRoomSchema>

/** Join room input */
export const joinRoomSchema = z.object({
  code: z.string().min(1, "Room code is required"),
  name: z.string().optional(),
  asSpectator: z.boolean().default(false),
})
export type JoinRoomInput = z.infer<typeof joinRoomSchema>

/** Submit vote input */
export const submitVoteSchema = z.object({
  code: z.string(),
  participantId: z.string(),
  vote: voteSchema,
})
export type SubmitVoteInput = z.infer<typeof submitVoteSchema>
