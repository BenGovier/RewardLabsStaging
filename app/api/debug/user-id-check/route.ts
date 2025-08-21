import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No session" }, { status: 401 })
    }

    const db = await getDb()

    // Check what's in the session
    console.log("Session user ID:", session.user.id)
    console.log("Session user ID type:", typeof session.user.id)

    // Try to find user with different ID formats
    const searchResults = {
      sessionId: session.user.id,
      sessionIdType: typeof session.user.id,
      searchAttempts: [],
    }

    // Attempt 1: Direct string match
    const user1 = await db.collection(USERS_COLLECTION).findOne({ _id: session.user.id })
    searchResults.searchAttempts.push({
      method: "Direct string match",
      query: { _id: session.user.id },
      found: !!user1,
    })

    // Attempt 2: ObjectId conversion
    let user2 = null
    try {
      if (ObjectId.isValid(session.user.id)) {
        const objectId = new ObjectId(session.user.id)
        user2 = await db.collection(USERS_COLLECTION).findOne({ _id: objectId })
        searchResults.searchAttempts.push({
          method: "ObjectId conversion",
          query: { _id: objectId.toString() },
          found: !!user2,
        })
      }
    } catch (error) {
      searchResults.searchAttempts.push({
        method: "ObjectId conversion",
        error: error instanceof Error ? error.message : String(error),
      })
    }

    // Attempt 3: Find all users to see ID format
    const allUsers = await db.collection(USERS_COLLECTION).find({}).limit(5).toArray()
    searchResults.sampleUserIds = allUsers.map((user) => ({
      _id: user._id,
      idType: typeof user._id,
      email: user.email,
    }))

    return NextResponse.json(searchResults)
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Debug failed", details: String(error) }, { status: 500 })
  }
}
