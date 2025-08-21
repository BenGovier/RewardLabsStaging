import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const userId = session.user.id

    // Update user's last activity timestamp
    await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: { lastSeen: new Date() } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user activity:", error)
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 })
  }
}
