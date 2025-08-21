import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { MESSAGES_COLLECTION } from "@/models/message"
import { USERS_COLLECTION } from "@/models/user"

// GET messages for a conversation
export async function GET(request: NextRequest, { params }: { params: { conversationId: string } }) {
  console.log("=== FETCHING CONVERSATION MESSAGES ===")
  console.log("Conversation ID:", params.conversationId)

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")

    // Verify user is participant in this conversation
    const participantIds = params.conversationId.split("_")
    if (!participantIds.includes(session.user.id)) {
      console.log("❌ User not in conversation participants")
      return NextResponse.json({ error: "Not authorized to view this conversation" }, { status: 403 })
    }

    const db = await getDb()

    // Get messages for this conversation
    const messages = await db
      .collection(MESSAGES_COLLECTION)
      .find({
        $or: [
          { senderId: participantIds[0], recipientId: participantIds[1] },
          { senderId: participantIds[1], recipientId: participantIds[0] },
        ],
      })
      .sort({ timestamp: 1 })
      .limit(limit)
      .toArray()

    console.log(`Found ${messages.length} messages`)
    console.log(
      "Sample message:",
      messages.length > 0
        ? {
            id: messages[0]._id,
            hasAttachments: !!(messages[0].attachments && messages[0].attachments.length > 0),
            attachmentCount: messages[0].attachments?.length || 0,
          }
        : "No messages",
    )

    // Get unique sender IDs
    const senderIds = [...new Set(messages.map((msg) => msg.senderId))]

    // Get sender information
    const senders = await db
      .collection(USERS_COLLECTION)
      .find({
        _id: {
          $in: senderIds.map((id) => {
            try {
              return new ObjectId(id)
            } catch (e) {
              return id
            }
          }),
        },
      })
      .toArray()

    console.log(`Found ${senders.length} senders`)

    // Create a map of sender info
    const senderMap = senders.reduce(
      (map, sender) => {
        map[sender._id.toString()] = {
          _id: sender._id.toString(),
          firstName: sender.firstName || "",
          lastName: sender.lastName || "",
          profilePictureUrl: sender.profilePictureUrl,
        }
        return map
      },
      {} as Record<string, any>,
    )

    // Add sender info to messages
    const messagesWithSender = messages.map((msg) => {
      const sender = senderMap[msg.senderId] || {
        _id: msg.senderId,
        firstName: "Unknown",
        lastName: "User",
      }

      return {
        ...msg,
        _id: msg._id.toString(),
        sender,
      }
    })

    console.log(
      "First message with sender:",
      messagesWithSender.length > 0
        ? {
            id: messagesWithSender[0]._id,
            sender: messagesWithSender[0].sender,
            hasAttachments: !!(messagesWithSender[0].attachments && messagesWithSender[0].attachments.length > 0),
            attachmentCount: messagesWithSender[0].attachments?.length || 0,
          }
        : "No messages",
    )

    return NextResponse.json({ messages: messagesWithSender })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
