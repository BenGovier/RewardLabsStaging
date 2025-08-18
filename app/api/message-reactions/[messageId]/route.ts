import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { MESSAGES_COLLECTION } from "@/models/message"
import { ObjectId } from "mongodb"

// POST - Add reaction to message
export async function POST(request: NextRequest, { params }: { params: { messageId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { emoji } = await request.json()

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 })
    }

    const db = await getDb()

    // Check if message exists
    const message = await db.collection(MESSAGES_COLLECTION).findOne({
      _id: new ObjectId(params.messageId),
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions?.find((r: any) => r.userId === session.user.id && r.emoji === emoji)

    if (existingReaction) {
      // Remove existing reaction
      await db.collection(MESSAGES_COLLECTION).updateOne(
        { _id: new ObjectId(params.messageId) },
        {
          $pull: {
            reactions: { userId: session.user.id, emoji: emoji },
          },
        },
      )
      return NextResponse.json({ success: true, action: "removed" })
    } else {
      // Add new reaction
      await db.collection(MESSAGES_COLLECTION).updateOne(
        { _id: new ObjectId(params.messageId) },
        {
          $push: {
            reactions: {
              emoji: emoji,
              userId: session.user.id,
              timestamp: new Date(),
            },
          },
        },
      )
      return NextResponse.json({ success: true, action: "added" })
    }
  } catch (error) {
    console.error("Error handling reaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
