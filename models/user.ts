import type { ObjectId } from "mongodb"

/**
 * User interface for type checking (updated with business role)
 */
export interface User {
  _id: ObjectId | string
  firstName: string
  lastName: string
  email: string
  passwordHash: string
  role: "admin" | "rep" | "business"
  mobile?: string
  profilePictureUrl?: string
  referralSlug?: string
  businessName?: string // Required for business users
  onboardingCompleted?: boolean
  onboardingCompletedAt?: Date
  isActive?: boolean
  invitationSent?: boolean
  invitationSentAt?: Date
  dateCreated: Date

  // Stripe subscription fields
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripeSubscriptionStatus?: "active" | "canceled" | "past_due" | "unpaid" | "incomplete"
  stripePriceId?: string
  stripeCurrentPeriodEnd?: Date
  createdByRepId?: string // Rep who referred this business
  monthlyRevenue?: number // For MRR calculations
}

/**
 * Mongoose-style schema definition (updated with business role)
 */
export const UserSchema = {
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
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "rep", "business"],
    required: true,
  },
  mobile: {
    type: String,
    required: false,
    trim: true,
  },
  profilePictureUrl: {
    type: String,
    required: false,
  },
  referralSlug: {
    type: String,
    required: false,
    trim: true,
  },
  businessName: {
    type: String,
    required: function (this: User) {
      return this.role === "business"
    },
    trim: true,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  onboardingCompletedAt: {
    type: Date,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  invitationSent: {
    type: Boolean,
    default: false,
  },
  invitationSentAt: {
    type: Date,
    required: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  stripeCustomerId: {
    type: String,
    required: false,
  },
  stripeSubscriptionId: {
    type: String,
    required: false,
  },
  stripeSubscriptionStatus: {
    type: String,
    enum: ["active", "canceled", "past_due", "unpaid", "incomplete"],
    required: false,
  },
  stripePriceId: {
    type: String,
    required: false,
  },
  stripeCurrentPeriodEnd: {
    type: Date,
    required: false,
  },
  createdByRepId: {
    type: String,
    required: false,
  },
  monthlyRevenue: {
    type: Number,
    required: false,
  },
}

/**
 * Helper function to validate a user object against the schema
 */
export function validateUser(user: Partial<User>): string[] {
  const errors: string[] = []

  if (!user.firstName) errors.push("First name is required")
  if (!user.lastName) errors.push("Last name is required")
  if (!user.email) errors.push("Email is required")
  if (!user.role) errors.push("Role is required")

  if (user.email && !/^\S+@\S+\.\S+$/.test(user.email)) {
    errors.push("Email format is invalid")
  }

  if (user.role && !["admin", "rep", "business"].includes(user.role)) {
    errors.push("Role must be either 'admin', 'rep', or 'business'")
  }

  // Business name is required for business users
  if (user.role === "business" && !user.businessName) {
    errors.push("Business name is required for business accounts")
  }

  if (user.mobile && !/^[+]?[1-9][\d]{0,15}$/.test(user.mobile.replace(/\s/g, ""))) {
    errors.push("Mobile number format is invalid")
  }

  return errors
}

/**
 * Collection name for MongoDB (singular)
 */
export const USER_COLLECTION = "users"

/**
 * Collection name for MongoDB (plural)
 */
export const USERS_COLLECTION = "users"
