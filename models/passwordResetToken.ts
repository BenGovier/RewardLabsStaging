import type { ObjectId } from "mongodb"

/**
 * Password Reset Token interface
 */
export interface PasswordResetToken {
  _id: ObjectId | string
  userId: ObjectId | string
  token: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

/**
 * Schema definition for password reset tokens
 */
export const PasswordResetTokenSchema = {
  userId: {
    type: String, // ObjectId as string
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}

/**
 * Collection name for MongoDB
 */
export const PASSWORD_RESET_TOKENS_COLLECTION = "passwordResetTokens"

/**
 * Helper function to validate token
 */
export function isTokenValid(token: PasswordResetToken): boolean {
  return !token.used && new Date() < new Date(token.expiresAt)
}

/**
 * Helper function to generate secure token
 */
export function generateResetToken(): string {
  return crypto.randomUUID()
}

/**
 * Helper function to create token expiration date (30 minutes from now)
 */
export function getTokenExpiration(): Date {
  const expiration = new Date()
  expiration.setMinutes(expiration.getMinutes() + 30)
  return expiration
}
