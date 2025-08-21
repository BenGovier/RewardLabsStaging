import type { ObjectId } from "mongodb"

/**
 * Entry interface for type checking
 */
export interface Entry {
  _id?: ObjectId | string
  businessId: ObjectId | string
  raffleId: ObjectId | string
  firstName: string
  lastName: string
  email: string
  answers: Record<string, any> // JSON object with answers to custom questions
  agreedToTerms: boolean
  agreedToMarketing: boolean
  consentTimestamp: Date
  submittedAt: Date
  ipAddress?: string // Optional for tracking unique entries
  createdAt: Date
}

/**
 * Mongoose-style schema definition
 */
export const EntrySchema = {
  businessId: {
    type: String, // ObjectId as string
    required: true,
  },
  raffleId: {
    type: String, // ObjectId as string
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  answers: {
    type: Object,
    required: true,
    default: {},
  },
  agreedToTerms: {
    type: Boolean,
    required: true,
    default: false,
  },
  agreedToMarketing: {
    type: Boolean,
    required: false,
    default: false,
  },
  consentTimestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  submittedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}

/**
 * Helper function to validate an entry object against the schema
 */
export function validateEntry(entry: Partial<Entry>): string[] {
  const errors: string[] = []

  if (!entry.businessId) errors.push("Business ID is required")
  if (!entry.raffleId) errors.push("Raffle ID is required")
  if (!entry.firstName) errors.push("First name is required")
  if (!entry.lastName) errors.push("Last name is required")
  if (!entry.email) errors.push("Email is required")
  if (!entry.agreedToTerms) errors.push("Terms and conditions must be agreed to")

  // Validate email format
  if (entry.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) {
    errors.push("Email format is invalid")
  }

  return errors
}

/**
 * Collection name for MongoDB
 */
export const ENTRIES_COLLECTION = "entries"
