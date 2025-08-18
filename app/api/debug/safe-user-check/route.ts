import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"

export const dynamic = "force-dynamic"

// Safe read-only endpoint to check admin users
export async function GET() {
  try {
    console.log("=== SAFE USER CHECK START ===")

    const db = await getDb()
    console.log("Database connected successfully")

    const usersCollection = db.collection(USERS_COLLECTION)
    console.log("Users collection accessed")

    // Only get admin users, exclude password fields for security
    const adminUsers = await usersCollection
      .find({ role: "admin" })
      .project({
        email: 1,
        firstName: 1,
        lastName: 1,
        role: 1,
        dateCreated: 1,
        _id: 1,
      })
      .toArray()

    console.log("Admin users found:", adminUsers.length)
    console.log("=== SAFE USER CHECK END ===")

    return NextResponse.json({
      success: true,
      adminCount: adminUsers.length,
      adminUsers: adminUsers,
    })
  } catch (error) {
    console.error("=== SAFE USER CHECK ERROR ===", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
