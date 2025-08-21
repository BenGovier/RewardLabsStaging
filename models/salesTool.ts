import type { ObjectId } from "mongodb"

/**
 * Sales Tool interface
 */
export interface SalesTool {
  _id?: ObjectId | string
  title: string
  description: string
  type:
    | "facebookPost"
    | "linkedinPost"
    | "instagramPost"
    | "twitterPost"
    | "emailCopy"
    | "video"
    | "pdf"
    | "ppt"
    | "doc"
    | "other"
  url?: string
  filePath?: string
  fileName?: string
  fileSize?: number
  thumbnailUrl?: string
  createdAt: Date
  updatedAt?: Date
}

/**
 * Collection name for MongoDB
 */
export const SALES_TOOLS_COLLECTION = "salesTools"

/**
 * Helper function to validate a sales tool object
 */
export function validateSalesTool(tool: Partial<SalesTool>): string[] {
  const errors: string[] = []

  if (!tool.title || tool.title.trim().length === 0) {
    errors.push("Title is required")
  }
  if (tool.title && tool.title.length > 200) {
    errors.push("Title must be less than 200 characters")
  }

  if (!tool.description || tool.description.trim().length === 0) {
    errors.push("Description is required")
  }
  if (tool.description && tool.description.length > 1000) {
    errors.push("Description must be less than 1000 characters")
  }

  if (!tool.type) {
    errors.push("Type is required")
  }

  const validTypes = [
    "facebookPost",
    "linkedinPost",
    "instagramPost",
    "twitterPost",
    "emailCopy",
    "video",
    "pdf",
    "ppt",
    "doc",
    "other",
  ]

  if (tool.type && !validTypes.includes(tool.type)) {
    errors.push(`Type must be one of: ${validTypes.join(", ")}`)
  }

  // Either URL or file path must be provided
  if ((!tool.url || tool.url.trim().length === 0) && (!tool.filePath || tool.filePath.trim().length === 0)) {
    errors.push("Either URL or file upload is required")
  }

  // If URL is provided, validate it
  if (tool.url && tool.url.trim().length > 0) {
    try {
      new URL(tool.url)
    } catch {
      errors.push("URL must be a valid URL")
    }
  }

  return errors
}
