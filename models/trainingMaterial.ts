import type { ObjectId } from "mongodb"

/**
 * Training Material interface
 */
export interface TrainingMaterial {
  _id?: ObjectId | string
  title: string
  description: string
  type: "video" | "pdf" | "ppt" | "link" | "file"
  url?: string
  filePath?: string
  fileName?: string
  fileSize?: number
  createdAt: Date
  updatedAt?: Date
}

/**
 * Collection name for MongoDB
 */
export const TRAINING_MATERIALS_COLLECTION = "trainingMaterials"

/**
 * Helper function to validate a training material object
 */
export function validateTrainingMaterial(material: Partial<TrainingMaterial>): string[] {
  const errors: string[] = []

  if (!material.title || material.title.trim().length === 0) {
    errors.push("Title is required")
  }
  if (material.title && material.title.length > 200) {
    errors.push("Title must be less than 200 characters")
  }

  if (!material.description || material.description.trim().length === 0) {
    errors.push("Description is required")
  }
  if (material.description && material.description.length > 1000) {
    errors.push("Description must be less than 1000 characters")
  }

  if (!material.type) {
    errors.push("Type is required")
  }
  const validTypes = ["video", "pdf", "ppt", "link", "file"]
  if (material.type && !validTypes.includes(material.type)) {
    errors.push("Type must be video, pdf, ppt, link, or file")
  }

  // URL is required only for link and video types
  if ((material.type === "link" || material.type === "video") && (!material.url || material.url.trim().length === 0)) {
    errors.push("URL is required for links and videos")
  }

  // For link and video types, validate URL format
  if ((material.type === "link" || material.type === "video") && material.url) {
    try {
      new URL(material.url)
    } catch {
      errors.push("URL must be a valid URL")
    }
  }

  // For file types, validate file path
  if (
    (material.type === "pdf" || material.type === "ppt" || material.type === "file") &&
    (!material.filePath || material.filePath.trim().length === 0)
  ) {
    errors.push("File is required for PDF, PPT, and other file types")
  }

  return errors
}
