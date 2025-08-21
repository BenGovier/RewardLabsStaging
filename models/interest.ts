import type { ObjectId } from "mongodb"

/**
 * Interest interface for type checking
 */
export interface Interest {
  _id?: ObjectId | string
  name: string
  email: string
  phone: string
  comments: string
  timestamp: Date
}

/**
 * Collection name for MongoDB
 */
export const INTERESTS_COLLECTION = "interests"
