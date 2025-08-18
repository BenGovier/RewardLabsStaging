import type { ObjectId } from "mongodb"

/**
 * Website Lead interface for demo page email collection
 */
export interface WebsiteLead {
  _id?: ObjectId | string
  email: string
  source: string // 'demo-popup', 'homepage', etc.
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

/**
 * Collection name for MongoDB
 */
export const WEBSITE_LEADS_COLLECTION = "websiteLeads"
