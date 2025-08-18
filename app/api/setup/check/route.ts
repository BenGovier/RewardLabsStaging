import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"

export const dynamic = "force-dynamic"

// This endpoint checks if any admin users exist
export async function GET() {
  try {
    const db = await getDb()
    const usersCollection = db.collection(USERS_COLLECTION)

    // Check if any admin users exist
    const adminCount = await usersCollection.countDocuments({ role: "admin" })

    return NextResponse.json(
      {
        hasAdmin: adminCount > 0,
        adminCount,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json(
      { error: "Failed to check admin status" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
