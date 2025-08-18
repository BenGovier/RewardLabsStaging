import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { type Message, MESSAGES_COLLECTION, validateMessage } from "@/models/message"
import { CONVERSATIONS_COLLECTION, generateConversationId } from "@/models/conversation"

// POST new message
export async function POST(request: NextRequest) {
  console.log("=== MESSAGE API CALLED ===")

  try {
    const session = await getServerSession(authOptions)
    console.log("Session user:", session?.user?.id)

    if (!session?.user) {
      console.log("❌ No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("📨 Request body:", JSON.stringify(body, null, 2))

    const { recipientId, contentText, attachments } = body

    console.log("📋 Parsed data:", {
      recipientId,
      contentText: contentText?.substring(0, 50) + "...",
      attachmentsCount: attachments?.length || 0,
      attachments: attachments,
    })

    const messageData: Partial<Message> = {
      senderId: session.user.id,
      recipientId,
      contentText: contentText?.trim() || "",
      attachments: attachments || [],
    }

    console.log("🔍 Message data before validation:", messageData)

    const errors = validateMessage(messageData)
    if (errors.length > 0) {
      console.log("❌ Validation errors:", errors)
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 })
    }

    console.log("✅ Validation passed")

    const db = await getDb()

    // Create message
    const message: Message = {
      ...messageData,
      timestamp: new Date(),
      reactions: [],
    } as Message

    console.log("💾 About to insert message:", JSON.stringify(message, null, 2))

    const result = await db.collection(MESSAGES_COLLECTION).insertOne(message)
    console.log("✅ Message inserted with ID:", result.insertedId)

    // Verify the message was saved correctly
    const savedMessage = await db.collection(MESSAGES_COLLECTION).findOne({ _id: result.insertedId })
    console.log("🔍 Saved message verification:", JSON.stringify(savedMessage, null, 2))

    // Update or create conversation
    const conversationId = generateConversationId(session.user.id, recipientId)
    const lastMessage = contentText || (attachments?.length > 0 ? "📎 Attachment" : "")

    console.log("💬 Updating conversation:", conversationId)

    await db.collection(CONVERSATIONS_COLLECTION).updateOne(
      { _id: conversationId },
      {
        $set: {
          participants: [session.user.id, recipientId],
          lastUpdated: new Date(),
          lastMessage: lastMessage.substring(0, 100), // Store preview
        },
      },
      { upsert: true },
    )

    console.log("✅ Conversation updated")

    return NextResponse.json(
      {
        success: true,
        messageId: result.insertedId,
        debug: {
          savedMessage: savedMessage,
          attachmentsSaved: savedMessage?.attachments?.length || 0,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Error creating message:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
