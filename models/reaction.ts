import type { ObjectId } from "mongodb"

/**
 * Reaction interface for post reactions
 */
export interface Reaction {
  _id?: ObjectId | string
  postId: string
  userId: string
  reactionType: "like" | "heart"
  createdAt: Date
}

/**
 * Collection name for MongoDB
 */
export const REACTIONS_COLLECTION = "reactions"

/**
 * Helper function to validate a reaction object
 */
export function validateReaction(reaction: Partial<Reaction>): string[] {
  const errors: string[] = []

  if (!reaction.postId) errors.push("Post ID is required")
  if (!reaction.userId) errors.push("User ID is required")
  if (!reaction.reactionType) errors.push("Reaction type is required")

  const validReactionTypes = ["like", "heart"]
  if (reaction.reactionType && !validReactionTypes.includes(reaction.reactionType)) {
    errors.push("Invalid reaction type")
  }

  return errors
}
