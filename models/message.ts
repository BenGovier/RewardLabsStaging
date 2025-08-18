import type { ObjectId } from "mongodb"

/**
 * Reaction interface for message reactions
 */
export interface MessageReaction {
  emoji: string
  userId: string
  timestamp: Date
}

/**
 * File attachment interface
 */
export interface MessageAttachment {
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
}

/**
 * Message interface for direct messages
 */
export interface Message {
  _id?: ObjectId | string
  senderId: string
  recipientId: string
  contentText: string
  timestamp: Date
  reactions?: MessageReaction[]
  attachments?: MessageAttachment[]
}

/**
 * Message with populated sender info (for API responses)
 */
export interface MessageWithSender extends Message {
  sender: {
    _id: string
    firstName: string
    lastName: string
    profilePictureUrl?: string
  }
}

/**
 * Collection name for MongoDB
 */
export const MESSAGES_COLLECTION = "messages"

/**
 * Helper function to validate a message object
 */
export function validateMessage(message: Partial<Message>): string[] {
  const errors: string[] = []

  if (!message.senderId) errors.push("Sender ID is required")
  if (!message.recipientId) errors.push("Recipient ID is required")
  if (!message.contentText || message.contentText.trim().length === 0) {
    // Allow empty content if there are attachments
    if (!message.attachments || message.attachments.length === 0) {
      errors.push("Message content or attachment is required")
    }
  }
  if (message.contentText && message.contentText.length > 1000) {
    errors.push("Message content must be less than 1000 characters")
  }
  if (message.senderId === message.recipientId) {
    errors.push("Cannot send message to yourself")
  }

  return errors
}
