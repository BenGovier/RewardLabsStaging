import type { ObjectId } from "mongodb"

/**
 * Customer interface (basic structure for sales system)
 */
export interface Customer {
  _id?: ObjectId | string
  repId: string
  name: string
  email: string
  phone?: string
  company?: string
  createdAt: Date
}

/**
 * Collection name for MongoDB
 */
export const CUSTOMERS_COLLECTION = "customers"
