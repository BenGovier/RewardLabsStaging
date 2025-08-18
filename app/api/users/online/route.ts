import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    // Define time thresholds
    const now = new Date()
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000) // 2 minutes ago
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000) // 10 minutes ago

    // Get all users with their status
    const users = await db
      .collection("users")
      .find({})
      .project({
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        profilePictureUrl: 1,
        lastSeen: 1,
      })
      .toArray()

    // Calculate status for each user
    const onlineUsers = users.map((user) => {
      let status = "offline"

      if (user.lastSeen) {
        const lastSeen = new Date(user.lastSeen)
        if (lastSeen > twoMinutesAgo) {
          status = "online"
        } else if (lastSeen > tenMinutesAgo) {
          status = "away"
        }
      }

      return {
        ...user,
        status,
      }
    })

    // Sort by status (online first, then away, then offline)
    onlineUsers.sort((a, b) => {
      const statusOrder = { online: 0, away: 1, offline: 2 }
      return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
    })

    return NextResponse.json({ users: onlineUsers })
  } catch (error) {
    console.error("Error fetching online users:", error)
    return NextResponse.json({ error: "Failed to fetch online users" }, { status: 500 })
  }
}
