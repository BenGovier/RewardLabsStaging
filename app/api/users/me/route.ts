export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"
import { ObjectId } from "mongodb"

// GET current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    // Convert string ID to ObjectId for database query
    const user = await db.collection(USERS_COLLECTION).findOne(
      { _id: new ObjectId(session.user.id) },
      {
        projection: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          role: 1,
          profilePictureUrl: 1,
          referralSlug: 1,
        },
      },
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Convert ObjectId back to string for frontend
    const userResponse = {
      ...user,
      _id: user._id.toString(),
    }

    return NextResponse.json({ user: userResponse })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
