/**
 * Conversation interface for tracking message threads
 */
export interface Conversation {
  _id: string // composite of two userIds sorted
  participants: string[]
  lastUpdated: Date
  lastMessage?: string
}

/**
 * Conversation with populated participant info (for API responses)
 */
export interface ConversationWithParticipants extends Conversation {
  otherParticipant: {
    _id: string
    firstName: string
    lastName: string
    profilePictureUrl?: string
    role: string
  }
}

/**
 * Collection name for MongoDB
 */
export const CONVERSATIONS_COLLECTION = "conversations"

/**
 * Helper function to generate conversation ID from two user IDs
 */
export function generateConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join("_")
}

/**
 * Helper function to validate a conversation object
 */
export function validateConversation(conversation: Partial<Conversation>): string[] {
  const errors: string[] = []

  if (!conversation.participants || conversation.participants.length !== 2) {
    errors.push("Conversation must have exactly 2 participants")
  }
  if (conversation.participants && conversation.participants[0] === conversation.participants[1]) {
    errors.push("Conversation participants must be different users")
  }

  return errors
}
