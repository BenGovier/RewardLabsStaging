import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"

export const dynamic = "force-dynamic"

// Simple debug endpoint without key validation
export async function GET() {
  try {
    console.log("Attempting database connection...")
    const db = await getDb()
    console.log("Database connection successful")

    const usersCollection = db.collection(USERS_COLLECTION)

    // Count users
    const userCount = await usersCollection.countDocuments()
    console.log(`Found ${userCount} users in database`)

    // Check for admin users
    const adminCount = await usersCollection.countDocuments({ role: "admin" })
    console.log(`Found ${adminCount} admin users`)

    // Check for specific user
    const specificUser = await usersCollection.findOne(
      { email: "ben@raffily.co.uk" },
      { projection: { _id: 1, email: 1, role: 1, firstName: 1, lastName: 1 } },
    )

    return NextResponse.json({
      databaseConnected: true,
      userCount,
      adminCount,
      specificUserExists: !!specificUser,
      specificUser: specificUser || null,
      collectionName: USERS_COLLECTION,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({
      databaseConnected: false,
      error: error.message,
      stack: error.stack,
    })
  }
}
