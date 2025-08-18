export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"

// GET users for directory
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    const db = await getDb()

    // Build query based on user role and requested role
    const query: any = {}

    if (session.user.role === "rep") {
      // Reps can only see other reps
      query.role = "rep"
      query._id = { $ne: session.user.id } // Exclude self
    } else if (session.user.role === "admin") {
      // Admins can see all users
      if (role) {
        query.role = role
      }
      query._id = { $ne: session.user.id } // Exclude self
    } else {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const users = await db
      .collection(USERS_COLLECTION)
      .find(query)
      .project({
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        role: 1,
        profilePictureUrl: 1,
      })
      .sort({ firstName: 1, lastName: 1 })
      .toArray()

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
