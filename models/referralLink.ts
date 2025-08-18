import type { ObjectId } from "mongodb"

/**
 * ReferralLink interface for named referral link management
 */
export interface ReferralLink {
  _id?: ObjectId | string
  repId: string
  name: string // User-defined name for the link
  slug: string // The actual referral slug
  referralUrl: string // Full URL
  createdAt: Date
  isActive: boolean

  // Tracking stats (calculated fields)
  totalClicks?: number
  totalSignups?: number
  totalRevenue?: number
  lastClickedAt?: Date
}

/**
 * Collection name for MongoDB
 */
export const REFERRAL_LINKS_COLLECTION = "referralLinks"

/**
 * Helper function to validate a referral link object
 */
export function validateReferralLink(link: Partial<ReferralLink>): string[] {
  const errors: string[] = []

  if (!link.repId) errors.push("Rep ID is required")
  if (!link.name || link.name.trim().length === 0) errors.push("Link name is required")
  if (!link.slug) errors.push("Referral slug is required")

  return errors
}
