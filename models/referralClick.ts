import type { ObjectId } from "mongodb"

/**
 * ReferralClick interface for tracking referral link clicks
 */
export interface ReferralClick {
  _id?: ObjectId | string
  repId: string
  timestamp: Date
  ipAddress: string
  userAgent?: string
  referralSlug: string
}

/**
 * Collection name for MongoDB
 */
export const REFERRAL_CLICKS_COLLECTION = "referralClicks"

/**
 * Helper function to validate a referral click object
 */
export function validateReferralClick(click: Partial<ReferralClick>): string[] {
  const errors: string[] = []

  if (!click.repId) errors.push("Rep ID is required")
  if (!click.referralSlug) errors.push("Referral slug is required")
  if (!click.ipAddress) errors.push("IP address is required")

  return errors
}
