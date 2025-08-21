import type { ObjectId } from "mongodb"

/**
 * BusinessRaffle interface for type checking
 */
export interface BusinessRaffle {
  _id: ObjectId | string
  businessId: ObjectId | string
  raffleId: ObjectId | string
  customTitle?: string // Optional customized title
  customDescription?: string // Optional customized description
  customImages?: string[] // Optional customized images
  customMainImageIndex?: number // Optional customized main image index
  customCoverImage?: string // Optional customized cover image
  businessCustomizations?: BusinessCustomizations // NEW: Business customizations
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Add this interface after the existing BusinessRaffle interface
export interface BusinessCustomizations {
  logo?: string // URL to uploaded logo
  primaryColor?: string // Hex color code
  redirectUrl?: string // URL to redirect users after they claim a ticket
  template?: "classic" | "hero" | "split" // Template selection
  coverPhoto?: string // Cover photo background image
  backgroundVideo?: string // NEW: Background video for modern design
  customDescription?: string // Custom raffle description
  additionalMedia?: string[] // Additional images/videos (up to 10)
  customQuestions?: Array<{
    id: string
    question: string
    type: "text" | "email" | "phone" | "select"
    options?: string[] // For select type
    required: boolean
  }>
}

/**
 * Mongoose-style schema definition
 */
export const BusinessRaffleSchema = {
  businessId: {
    type: String, // ObjectId as string
    required: true,
  },
  raffleId: {
    type: String, // ObjectId as string
    required: true,
  },
  customTitle: {
    type: String,
    required: false,
    trim: true,
  },
  customDescription: {
    type: String,
    required: false,
  },
  customImages: {
    type: [String],
    required: false,
    validate: {
      validator: (v: string[]) => v.length <= 10,
      message: "Custom images cannot exceed 10 images",
    },
  },
  customMainImageIndex: {
    type: Number,
    required: false,
    validate: {
      validator: function (this: BusinessRaffle, v: number) {
        if (!this.customImages) return true
        return v >= 0 && v < this.customImages.length
      },
      message: "Custom main image index must be valid",
    },
  },
  customCoverImage: {
    type: String,
    required: false,
  },
  backgroundVideo: {
    // NEW: Background video field
    type: String,
    required: false,
  },
  businessCustomizations: {
    type: Object,
    required: false,
    properties: {
      logo: { type: String },
      primaryColor: { type: String },
      redirectUrl: { type: String },
      template: { type: String, enum: ["classic", "hero", "split"] },
      coverPhoto: { type: String }, // Cover photo field
      backgroundVideo: { type: String }, // NEW: Background video field
      customDescription: { type: String },
      additionalMedia: { type: Array, items: { type: String } },
      customQuestions: {
        type: Array,
        items: {
          type: Object,
          properties: {
            id: { type: String, required: true },
            question: { type: String, required: true },
            type: { type: String, enum: ["text", "email", "phone", "select"], required: true },
            options: { type: Array, items: { type: String } },
            required: { type: Boolean, required: true },
          },
        },
        maxItems: 5,
      },
    },
  },
  isActive: {
    type: Boolean,
    default: true,
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
 * Helper function to validate a business raffle object against the schema
 */
export function validateBusinessRaffle(businessRaffle: Partial<BusinessRaffle>): string[] {
  const errors: string[] = []

  if (!businessRaffle.businessId) errors.push("Business ID is required")
  if (!businessRaffle.raffleId) errors.push("Raffle ID is required")

  if (businessRaffle.customImages && businessRaffle.customImages.length > 10) {
    errors.push("Maximum of 10 custom images allowed")
  }

  if (businessRaffle.customMainImageIndex !== undefined && businessRaffle.customImages) {
    if (
      businessRaffle.customMainImageIndex < 0 ||
      businessRaffle.customMainImageIndex >= businessRaffle.customImages.length
    ) {
      errors.push("Custom main image index must be valid")
    }
  }

  return errors
}

/**
 * Collection name for MongoDB
 */
export const BUSINESS_RAFFLES_COLLECTION = "businessRaffles"
