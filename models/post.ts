import type { ObjectId } from "mongodb"

/**
 * Post interface for social feed posts
 */
export interface Post {
  _id?: ObjectId | string
  authorId: string
  contentText: string
  mediaUrls: string[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Post with populated author info (for API responses)
 */
export interface PostWithAuthor extends Post {
  author: {
    _id: string
    firstName: string
    lastName: string
    profilePictureUrl?: string
  }
  reactionCounts: {
    like: number
    heart: number
  }
  userReaction?: string
  commentCount: number
}

/**
 * Collection name for MongoDB
 */
export const POSTS_COLLECTION = "posts"

/**
 * Helper function to validate a post object
 */
export function validatePost(post: Partial<Post>): string[] {
  const errors: string[] = []

  if (!post.authorId) errors.push("Author ID is required")
  if (!post.contentText || post.contentText.trim().length === 0) {
    errors.push("Content text is required")
  }
  if (post.contentText && post.contentText.length > 2000) {
    errors.push("Content text must be less than 2000 characters")
  }
  if (post.mediaUrls && !Array.isArray(post.mediaUrls)) {
    errors.push("Media URLs must be an array")
  }

  return errors
}
