import type { ObjectId } from "mongodb"

/**
 * Comment interface for post comments
 */
export interface Comment {
  _id?: ObjectId | string
  postId: string
  authorId: string
  contentText: string
  createdAt: Date
}

/**
 * Comment with populated author info (for API responses)
 */
export interface CommentWithAuthor extends Comment {
  author: {
    _id: string
    firstName: string
    lastName: string
    profilePictureUrl?: string
  }
}

/**
 * Collection name for MongoDB
 */
export const COMMENTS_COLLECTION = "comments"

/**
 * Helper function to validate a comment object
 */
export function validateComment(comment: Partial<Comment>): string[] {
  const errors: string[] = []

  if (!comment.postId) errors.push("Post ID is required")
  if (!comment.authorId) errors.push("Author ID is required")
  if (!comment.contentText || comment.contentText.trim().length === 0) {
    errors.push("Content text is required")
  }
  if (comment.contentText && comment.contentText.length > 500) {
    errors.push("Comment text must be less than 500 characters")
  }

  return errors
}
