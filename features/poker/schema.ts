import { z } from "zod"

/** Room code: 1–10 alphanumeric chars, uppercase */
export const roomCodeSchema = z
  .string()
  .min(1, "Room code is required")
  .max(10)
  .regex(/^[A-Za-z0-9]+$/, "Room code must be letters and numbers only")
  .transform((s) => s.toUpperCase())

/** Participant ID (UUID) */
export const participantIdSchema = z.string().uuid("Invalid participant ID")

/** Unit for estimation (days or weeks) */
export const unitSchema = z.enum(["days", "weeks"])
export type Unit = z.infer<typeof unitSchema>

/** A vote: number + unit. Days: min 0.5, step 0.25. Weeks: min 1, step 1. */
export const voteSchema = z
  .object({
    value: z.number().max(999, "Value must be 999 or less"),
    unit: unitSchema.default("days"),
  })
  .transform((v) => {
    if (v.unit === "weeks") {
      return { ...v, value: Math.max(1, Math.round(v.value)) }
    }
    return { ...v, value: Math.max(0.5, Math.round(v.value * 4) / 4) }
  })
  .refine(
    (v) =>
      v.unit === "weeks"
        ? Number.isInteger(v.value) && v.value >= 1 && v.value <= 2
        : v.value >= 0.5 && v.value <= 20,
    { message: "Days max 20, weeks max 2" }
  )
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
  name: z.string().max(100).optional(),
  allowIssueNames: z.boolean().default(false),
  currentIssueName: z.string().max(100).optional(),
  facilitatorId: z.string(),
  participants: z.array(participantSchema),
  revealed: z.boolean().default(false),
  createdAt: z.number(),
})
export type Room = z.infer<typeof roomSchema>

/** Create room input */
export const createRoomSchema = z.object({
  roomName: z.string().max(100).optional(),
  facilitatorName: z.string().max(100).optional(),
  allowIssueNames: z.boolean().default(false),
})
export type CreateRoomInput = z.infer<typeof createRoomSchema>

/** Join room input */
export const joinRoomSchema = z.object({
  code: roomCodeSchema,
  name: z.string().max(100).optional(),
  asSpectator: z.boolean().default(false),
})
export type JoinRoomInput = z.infer<typeof joinRoomSchema>

/** Facilitator action input */
export const facilitatorActionSchema = z.object({
  code: roomCodeSchema,
  facilitatorId: participantIdSchema,
})

/** Update issue name input */
export const updateIssueNameSchema = facilitatorActionSchema.extend({
  issueName: z.string().max(100).optional(),
})

/** Submit vote input */
export const submitVoteSchema = z.object({
  code: roomCodeSchema,
  participantId: participantIdSchema,
  vote: voteSchema,
})
export type SubmitVoteInput = z.infer<typeof submitVoteSchema>
