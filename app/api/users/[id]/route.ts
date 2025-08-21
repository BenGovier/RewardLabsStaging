import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"
import { ObjectId } from "mongodb"

// GET user by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    // Convert string ID to ObjectId
    let userId: ObjectId
    try {
      userId = new ObjectId(params.id)
    } catch (error) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    const user = await db.collection(USERS_COLLECTION).findOne(
      { _id: userId },
      {
        projection: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          profilePictureUrl: 1,
        },
      },
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
