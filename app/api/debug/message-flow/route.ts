import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { MESSAGES_COLLECTION } from "@/models/message"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    // Get recent messages with attachments
    const recentMessages = await db
      .collection(MESSAGES_COLLECTION)
      .find({
        $or: [{ senderId: session.user.id }, { recipientId: session.user.id }],
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray()

    console.log("=== DEBUG MESSAGE FLOW ===")
    console.log("User ID:", session.user.id)
    console.log("Recent messages count:", recentMessages.length)

    recentMessages.forEach((msg, index) => {
      console.log(`Message ${index + 1}:`, {
        id: msg._id,
        senderId: msg.senderId,
        recipientId: msg.recipientId,
        contentText: msg.contentText?.substring(0, 50) + "...",
        hasAttachments: !!(msg.attachments && msg.attachments.length > 0),
        attachmentCount: msg.attachments?.length || 0,
        attachments: msg.attachments,
        timestamp: msg.timestamp,
      })
    })

    return NextResponse.json({
      success: true,
      userId: session.user.id,
      messageCount: recentMessages.length,
      messages: recentMessages.map((msg) => ({
        id: msg._id,
        senderId: msg.senderId,
        recipientId: msg.recipientId,
        contentText: msg.contentText,
        attachments: msg.attachments,
        timestamp: msg.timestamp,
        hasAttachments: !!(msg.attachments && msg.attachments.length > 0),
      })),
    })
  } catch (error) {
    console.error("Debug message flow error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
