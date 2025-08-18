import type { ObjectId } from "mongodb"

/**
 * Lead interface for rep lead management
 * Completely separate from existing Customer model
 */
export interface Lead {
  _id?: ObjectId | string
  repId: string // Which rep owns this lead

  // Contact Information
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string

  // Lead Details
  source: "cold-call" | "referral" | "website" | "social-media" | "event" | "other"
  sourceDetails?: string // Additional context about source

  // Sales Status
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost" | "nurturing"
  priority: "low" | "medium" | "high"

  // Sales Information
  estimatedValue?: number
  expectedCloseDate?: Date
  lastContactDate?: Date
  nextFollowUpDate?: Date

  // Notes and History
  notes: string
  tags: string[] // For categorization

  // Tracking
  createdAt: Date
  updatedAt: Date

  // Optional: Link to actual sale if converted
  convertedToSaleId?: string
}

/**
 * Lead Activity Log for tracking interactions
 */
export interface LeadActivity {
  _id?: ObjectId | string
  leadId: string
  repId: string

  type: "call" | "email" | "meeting" | "note" | "status-change" | "follow-up"
  description: string
  outcome?: string

  // Scheduling
  scheduledDate?: Date
  completedDate?: Date

  createdAt: Date
}

/**
 * Collection names
 */
export const LEADS_COLLECTION = "leads"
export const LEAD_ACTIVITIES_COLLECTION = "leadActivities"

/**
 * Lead status options with descriptions
 */
export const LEAD_STATUSES = {
  new: "New Lead",
  contacted: "Initial Contact Made",
  qualified: "Qualified Prospect",
  proposal: "Proposal Sent",
  negotiation: "In Negotiation",
  won: "Deal Won",
  lost: "Deal Lost",
  nurturing: "Long-term Nurturing",
} as const

/**
 * Lead sources
 */
export const LEAD_SOURCES = {
  "cold-call": "Cold Call",
  referral: "Referral",
  website: "Website",
  "social-media": "Social Media",
  event: "Event/Trade Show",
  other: "Other",
} as const

// Re-export the users collection constant so other modules can import from here
export const USERS_COLLECTION = "users" // keeps existing user collection name consistent
