import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { MESSAGES_COLLECTION } from "@/models/message"
import { CONVERSATIONS_COLLECTION } from "@/models/conversation"

export async function GET() {
  try {
    const db = await getDb()

    const messages = await db.collection(MESSAGES_COLLECTION).find({}).limit(10).toArray()
    const conversations = await db.collection(CONVERSATIONS_COLLECTION).find({}).limit(10).toArray()

    return NextResponse.json({
      messages: messages.map((msg) => ({
        ...msg,
        _id: msg._id.toString(),
      })),
      conversations: conversations.map((conv) => ({
        ...conv,
        _id: conv._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
