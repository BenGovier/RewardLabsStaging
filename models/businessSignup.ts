import type { ObjectId } from "mongodb"

/**
 * Business Signup interface for tracking signup flow and attribution
 */
export interface BusinessSignup {
  _id?: ObjectId | string
  businessName: string
  email: string
  firstName: string
  lastName: string
  createdByRepId?: string
  referralSource?: string
  stripeCheckoutSessionId?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  paymentStatus: "pending" | "completed" | "failed"
  signupStep: "form_submitted" | "payment_pending" | "payment_completed" | "account_created"
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  completedAt?: Date
}

/**
 * Collection name for MongoDB
 */
export const BUSINESS_SIGNUPS_COLLECTION = "businessSignups"

/**
 * Helper function to validate a business signup object
 */
export function validateBusinessSignup(signup: Partial<BusinessSignup>): string[] {
  const errors: string[] = []

  if (!signup.businessName) errors.push("Business name is required")
  if (!signup.email) errors.push("Email is required")
  if (!signup.firstName) errors.push("First name is required")
  if (!signup.lastName) errors.push("Last name is required")
  if (!signup.paymentStatus) errors.push("Payment status is required")
  if (!signup.signupStep) errors.push("Signup step is required")

  if (signup.email && !/^\S+@\S+\.\S+$/.test(signup.email)) {
    errors.push("Email format is invalid")
  }

  return errors
}
