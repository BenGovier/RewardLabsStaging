import type { ObjectId } from "mongodb"

/**
 * Winner interface for type checking
 */
export interface Winner {
  _id?: ObjectId | string
  raffleId: ObjectId | string
  businessId: ObjectId | string
  entryId: ObjectId | string
  ticketNumber: string
  winnerName: string
  winnerEmail: string
  winnerPhone?: string
  selectedAt: Date
  selectedBy: ObjectId | string // Admin who selected the winner
  selectionMethod: "manual" | "random"
  prizeDescription?: string
  contactedAt?: Date
  prizeClaimedAt?: Date
  notes?: string
  createdAt: Date
}

/**
 * Mongoose-style schema definition
 */
export const WinnerSchema = {
  raffleId: {
    type: String, // ObjectId as string
    required: true,
  },
  businessId: {
    type: String, // ObjectId as string
    required: true,
  },
  entryId: {
    type: String, // ObjectId as string
    required: true,
  },
  ticketNumber: {
    type: String,
    required: true,
  },
  winnerName: {
    type: String,
    required: true,
    trim: true,
  },
  winnerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  winnerPhone: {
    type: String,
    required: false,
    trim: true,
  },
  selectedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  selectedBy: {
    type: String, // ObjectId as string
    required: true,
  },
  selectionMethod: {
    type: String,
    enum: ["manual", "random"],
    required: true,
  },
  prizeDescription: {
    type: String,
    required: false,
  },
  contactedAt: {
    type: Date,
    required: false,
  },
  prizeClaimedAt: {
    type: Date,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}

/**
 * Helper function to validate a winner object against the schema
 */
export function validateWinner(winner: Partial<Winner>): string[] {
  const errors: string[] = []

  if (!winner.raffleId) errors.push("Raffle ID is required")
  if (!winner.businessId) errors.push("Business ID is required")
  if (!winner.entryId) errors.push("Entry ID is required")
  if (!winner.ticketNumber) errors.push("Ticket number is required")
  if (!winner.winnerName) errors.push("Winner name is required")
  if (!winner.winnerEmail) errors.push("Winner email is required")
  if (!winner.selectedBy) errors.push("Selected by admin ID is required")
  if (!winner.selectionMethod) errors.push("Selection method is required")

  // Validate email format
  if (winner.winnerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(winner.winnerEmail)) {
    errors.push("Winner email format is invalid")
  }

  // Validate selection method
  if (winner.selectionMethod && !["manual", "random"].includes(winner.selectionMethod)) {
    errors.push("Selection method must be 'manual' or 'random'")
  }

  return errors
}

/**
 * Collection name for MongoDB
 */
export const WINNERS_COLLECTION = "winners"
