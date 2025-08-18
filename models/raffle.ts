import type { ObjectId } from "mongodb"

/**
 * Raffle interface for type checking
 */
export interface Raffle {
  _id: ObjectId | string
  title: string
  description: string
  startDate: Date
  endDate: Date
  prizeImages: string[] // URLs to images/videos
  mainImageIndex: number // Index of the main image in prizeImages
  coverImage: string // URL to cover image
  createdBy: ObjectId | string // Admin who created the raffle
  createdAt: Date
  updatedAt: Date
}

/**
 * Mongoose-style schema definition
 */
export const RaffleSchema = {
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  prizeImages: {
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => v.length > 0 && v.length <= 10,
      message: "Prize images must contain between 1 and 10 images",
    },
  },
  mainImageIndex: {
    type: Number,
    required: true,
    default: 0,
    validate: {
      validator: function (this: Raffle, v: number) {
        return v >= 0 && v < this.prizeImages.length
      },
      message: "Main image index must be valid",
    },
  },
  coverImage: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String, // ObjectId as string
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}

/**
 * Helper function to validate a raffle object against the schema
 */
export function validateRaffle(raffle: Partial<Raffle>): string[] {
  const errors: string[] = []

  if (!raffle.title) errors.push("Title is required")
  if (!raffle.description) errors.push("Description is required")
  if (!raffle.startDate) errors.push("Start date is required")
  if (!raffle.endDate) errors.push("End date is required")

  if (raffle.startDate && raffle.endDate && new Date(raffle.startDate) >= new Date(raffle.endDate)) {
    errors.push("End date must be after start date")
  }

  if (!raffle.prizeImages || !Array.isArray(raffle.prizeImages)) {
    errors.push("Prize images are required")
  } else if (raffle.prizeImages.length === 0) {
    errors.push("At least one prize image is required")
  } else if (raffle.prizeImages.length > 10) {
    errors.push("Maximum of 10 prize images allowed")
  }

  if (raffle.mainImageIndex !== undefined && raffle.prizeImages) {
    if (raffle.mainImageIndex < 0 || raffle.mainImageIndex >= raffle.prizeImages.length) {
      errors.push("Main image index must be valid")
    }
  }

  if (!raffle.coverImage) errors.push("Cover image is required")

  return errors
}

/**
 * Collection name for MongoDB
 */
export const RAFFLES_COLLECTION = "raffles"
